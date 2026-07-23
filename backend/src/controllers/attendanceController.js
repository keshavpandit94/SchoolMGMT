import Attendance from '../models/Attendance.js';
import Teacher from '../models/Teacher.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

// Helper to normalize dates to 00:00:00 UTC
const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Default attendance cutoff time (09:30 AM local time)
const CUTOFF_HOUR = 9;
const CUTOFF_MINUTE = 30;

// Helper to check if attendance window is closed for a date
const isCutoffPassed = (targetDate) => {
  const now = new Date();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Past dates are always closed/locked
  if (targetDate < today) return true;
  // Future dates are closed
  if (targetDate > today) return true;

  // For today: check if current time > 09:30 AM
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour > CUTOFF_HOUR) return true;
  if (currentHour === CUTOFF_HOUR && currentMinute >= CUTOFF_MINUTE) return true;

  return false;
};

// @desc    Get staff and teacher attendance for a specific date
// @route   GET /api/attendance
// @access  Public / Private (Admin, Principal, Teacher, Staff)
export const getDailyAttendance = async (req, res, next) => {
  try {
    const targetDate = normalizeDate(req.query.date);
    const windowClosed = isCutoffPassed(targetDate);

    // Fetch all active teachers and staff users
    const teachers = await Teacher.find().populate('userId', 'name email role phone profilePicture pinCode');
    const staffList = await Staff.find().populate('userId', 'name email role phone profilePicture pinCode');

    // Fetch existing attendance records for target date
    const existingRecords = await Attendance.find({ date: targetDate });

    const attendanceMap = new Map();
    existingRecords.forEach((rec) => {
      attendanceMap.set(rec.personId.toString(), rec);
    });

    const roster = [];

    const processPerson = (person, personType, department, designation) => {
      if (!person.userId) return;
      const personId = person.userId._id.toString();
      const record = attendanceMap.get(personId);

      let status = 'Present';
      let markedVia = 'Manual';
      let isLocked = windowClosed;

      if (record) {
        status = record.status;
        markedVia = record.markedVia || 'Manual';
        isLocked = record.isLocked || windowClosed;
      } else if (windowClosed) {
        status = 'Absent';
        markedVia = 'Auto-Timeout';
        isLocked = true;
      }

      roster.push({
        personId: person.userId._id,
        name: person.userId.name,
        email: person.userId.email,
        phone: person.userId.phone,
        photoUrl: person.photoUrl || person.userId.profilePicture,
        personType,
        department,
        designation,
        status,
        markedVia,
        isLocked,
        remarks: record ? record.remarks || '' : windowClosed && !record ? 'Auto timeout (Missed 09:30 AM deadline)' : '',
      });
    };

    teachers.forEach((t) => processPerson(t, 'Teacher', t.department, t.designation));
    staffList.forEach((s) => processPerson(s, 'Staff', s.department, s.roleDetails));

    // Calculate stats
    const totalCount = roster.length;
    const presentCount = roster.filter((r) => r.status === 'Present').length;
    const absentCount = roster.filter((r) => r.status === 'Absent').length;
    const lateCount = roster.filter((r) => r.status === 'Late').length;
    const leaveCount = roster.filter((r) => r.status === 'On Leave').length;
    const autoAbsentCount = roster.filter((r) => r.markedVia === 'Auto-Timeout').length;

    res.status(200).json({
      success: true,
      date: targetDate,
      cutoffPassed: windowClosed,
      cutoffTime: '09:30 AM',
      stats: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        onLeave: leaveCount,
        autoAbsent: autoAbsentCount,
      },
      roster,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Upsert daily attendance with lock protection
// @route   POST /api/attendance
// @access  Public / Private
export const saveDailyAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    const targetDate = normalizeDate(date);
    const windowClosed = isCutoffPassed(targetDate);
    const isAdminOrPrincipal = !req.user || ['Admin', 'Principal'].includes(req.user.role);

    if (windowClosed && !isAdminOrPrincipal) {
      return res.status(403).json({
        success: false,
        message: 'Attendance window closed at 09:30 AM. Past records are locked and can ONLY be modified by Admin or Principal.',
      });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Invalid records format' });
    }

    const recordedById = req.user ? req.user._id : records[0]?.personId;

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { personId: rec.personId, date: targetDate },
        update: {
          $set: {
            personId: rec.personId,
            personType: rec.personType,
            date: targetDate,
            status: rec.status,
            markedVia: rec.markedVia || 'Manual',
            isLocked: windowClosed,
            remarks: rec.remarks || '',
            recordedBy: recordedById,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('attendance_updated', { date: targetDate, updatedBy: req.user ? req.user.name : 'Attendance Terminal' });
    }

    res.status(200).json({
      success: true,
      message: `Attendance records saved successfully for ${targetDate.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kiosk: Get all registered staff/teachers roster for self-service kiosk
// @route   GET /api/attendance/kiosk/roster
// @access  Public (No Login Auth Required - Touchscreen Entrance Terminal)
export const getKioskRoster = async (req, res, next) => {
  try {
    const today = normalizeDate();
    const teachers = await Teacher.find().populate('userId', 'name email role profilePicture pinCode');
    const staffList = await Staff.find().populate('userId', 'name email role profilePicture pinCode');

    const todayAttendance = await Attendance.find({ date: today });
    const attendanceMap = new Map();
    todayAttendance.forEach((rec) => {
      attendanceMap.set(rec.personId.toString(), rec);
    });

    const members = [];

    const formatMember = (m, type, dept, desig) => {
      if (!m.userId) return;
      const rec = attendanceMap.get(m.userId._id.toString());
      members.push({
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        photoUrl: m.photoUrl || m.userId.profilePicture,
        personType: type,
        department: dept,
        designation: desig,
        statusToday: rec ? rec.status : 'Not Checked In',
        checkedInAt: rec ? rec.updatedAt : null,
      });
    };

    teachers.forEach((t) => formatMember(t, 'Teacher', t.department, t.designation));
    staffList.forEach((s) => formatMember(s, 'Staff', s.department, s.roleDetails));

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kiosk: Self-service PIN + Face Verification check-in
// @route   POST /api/attendance/kiosk/verify
// @access  Public (Self-Service Touchscreen Kiosk)
export const verifyKioskAttendance = async (req, res, next) => {
  try {
    const { personId, pinCode, faceVerified } = req.body;

    if (!personId || !pinCode) {
      return res.status(400).json({ success: false, message: 'Please provide person selection and security PIN' });
    }

    const user = await User.findById(personId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Registered member not found' });
    }

    // Verify 4-digit PIN (default 1234 or user set PIN)
    const validPin = user.pinCode || '1234';
    if (pinCode !== validPin) {
      return res.status(401).json({ success: false, message: 'Incorrect Security PIN passcode. Please try again.' });
    }

    if (!faceVerified) {
      return res.status(400).json({ success: false, message: 'Biometric face scan verification failed or missing.' });
    }

    const today = normalizeDate();

    // Check time: if past 09:30 AM, mark Late, else Present
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() >= 30);
    const finalStatus = isLate ? 'Late' : 'Present';

    const attendanceRecord = await Attendance.findOneAndUpdate(
      { personId: user._id, date: today },
      {
        personId: user._id,
        personType: user.role === 'Teacher' ? 'Teacher' : 'Staff',
        date: today,
        status: finalStatus,
        markedVia: 'Self-Kiosk',
        recordedBy: user._id,
        remarks: `Biometric Face Scan & PIN Verified at ${now.toLocaleTimeString()}`,
      },
      { upsert: true, new: true }
    );

    // Emit Socket event so admin dashboard updates instantly
    const io = req.app.get('io');
    if (io) {
      io.emit('attendance_updated', { date: today, updatedBy: user.name });
    }

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}! Attendance marked as ${finalStatus} via Biometric Face Scan.`,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
      status: finalStatus,
      timestamp: now.toLocaleTimeString(),
    });
  } catch (error) {
    next(error);
  }
};
