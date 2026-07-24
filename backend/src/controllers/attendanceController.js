import Attendance from '../models/Attendance.js';
import Teacher from '../models/Teacher.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import SchoolSetting from '../models/SchoolSetting.js';
import { checkWindowActive } from './settingsController.js';

// Helper to normalize dates to 00:00:00 UTC
const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Helper to check if attendance window is closed for a date based on database settings
const isCutoffPassedForDate = async (targetDate) => {
  const now = new Date();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Past dates are locked/closed
  if (targetDate < today) return true;
  // Future dates are closed
  if (targetDate > today) return true;

  // Fetch configured timing window from DB
  let setting = await SchoolSetting.findOne({ key: 'attendance_window' });
  const endTime = setting?.endTime || '10:00';

  const windowStatus = checkWindowActive(setting?.startTime || '08:00', endTime);
  return windowStatus.isCutoffPassed;
};

// @desc    Get staff and teacher attendance for a specific date
// @route   GET /api/attendance
// @access  Public / Private (Admin, Principal, Teacher, Staff)
export const getDailyAttendance = async (req, res, next) => {
  try {
    const targetDate = normalizeDate(req.query.date);
    const windowClosed = await isCutoffPassedForDate(targetDate);

    // Fetch configured timing window from DB for display
    let setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    const endTime = setting?.endTime || '10:00';

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
        remarks: record ? record.remarks || '' : windowClosed && !record ? `Auto timeout (Missed ${endTime} AM deadline)` : '',
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
      cutoffTime: `${endTime} AM`,
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
    const windowClosed = await isCutoffPassedForDate(targetDate);
    const isAdminOrPrincipal = !req.user || ['Admin', 'Principal'].includes(req.user.role);

    // Fetch configured timing window from DB for error messaging
    let setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    const endTime = setting?.endTime || '10:00';

    if (windowClosed && !isAdminOrPrincipal) {
      return res.status(403).json({
        success: false,
        message: `Attendance window closed at ${endTime} AM. Past records are locked and can ONLY be modified by Admin or Principal.`,
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

    // Check configuration start time for lateness
    let setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    const startTime = setting?.startTime || '08:00';
    const [startH, startM] = startTime.split(':').map(Number);

    const now = new Date();
    const isLate = now.getHours() > startH || (now.getHours() === startH && now.getMinutes() >= startM);
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
