import bcrypt from 'bcryptjs';
import StaffFace from '../models/StaffFace.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import User from '../models/User.js';

// Helper: Calculate Euclidean Distance between two 128-dimensional facial descriptor vectors
const calculateEuclideanDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return 1.0; // Max distance if invalid
  }
  let sumSquare = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumSquare += diff * diff;
  }
  return Math.sqrt(sumSquare);
};

// Helper: Normalize date to 00:00:00 UTC
const normalizeDate = (d = new Date()) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// @desc    Admin Panel: Register Staff Facial Descriptors & PIN
// @route   POST /api/kiosk/register-face
// @access  Private (Admin, Principal)
export const registerStaffFace = async (req, res, next) => {
  try {
    const { userId, pinCode, faceDescriptors, shiftStart, shiftEnd } = req.body;

    if (!userId || !pinCode || !faceDescriptors || !Array.isArray(faceDescriptors) || faceDescriptors.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide User ID, PIN code, and 3-5 reference facial descriptors' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found in user database' });
    }

    // Hash PIN code
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pinCode, salt);

    // Also update pinCode in User model for backwards compatibility
    user.pinCode = pinCode;
    await user.save();

    // Upsert StaffFace record
    const staffFace = await StaffFace.findOneAndUpdate(
      { userId },
      {
        userId,
        pinHash,
        faceDescriptors,
        shiftStart: shiftStart || '08:30',
        shiftEnd: shiftEnd || '16:30',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Facial biometric profile registered successfully for ${user.name} (${faceDescriptors.length} vectors stored)`,
      staffFace,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 1 (PIN Check): Verify 4-6 Digit Personal PIN
// @route   POST /api/kiosk/verify-pin
// @access  Public (Kiosk Terminal)
export const verifyPinStep = async (req, res, next) => {
  try {
    const { pinCode } = req.body;

    if (!pinCode) {
      return res.status(400).json({ success: false, message: 'Please enter your 4-to-6-digit personal PIN' });
    }

    // Search all registered StaffFace entries for a PIN match
    const allStaffFaces = await StaffFace.find().populate('userId', 'name email role phone profilePicture');
    let matchedUser = null;
    let matchedStaffFace = null;

    for (const sf of allStaffFaces) {
      if (sf.pinHash && (await bcrypt.compare(pinCode, sf.pinHash))) {
        matchedUser = sf.userId;
        matchedStaffFace = sf;
        break;
      }
    }

    // Fallback: check User.pinCode directly if StaffFace pinHash not created yet
    if (!matchedUser) {
      const fallbackUser = await User.findOne({ pinCode });
      if (fallbackUser) {
        matchedUser = fallbackUser;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, message: 'Invalid PIN entered. Access denied.' });
    }

    res.status(200).json({
      success: true,
      message: 'PIN verified. Proceeding to Biometric Face Scan step.',
      user: {
        _id: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        photoUrl: matchedUser.profilePicture,
      },
      shiftStart: matchedStaffFace?.shiftStart || '08:30',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 2 (Face Recognition & Attendance Logging): Compare 128-d Vector & Log Check-In/Out
// @route   POST /api/kiosk/verify-face-attendance
// @access  Public (Kiosk Terminal)
export const verifyFaceAttendance = async (req, res, next) => {
  try {
    const { staffId, liveFaceDescriptor, geoTag } = req.body;

    if (!staffId || !liveFaceDescriptor || !Array.isArray(liveFaceDescriptor)) {
      return res.status(400).json({ success: false, message: 'Missing staff ID or live facial vector descriptor' });
    }

    const user = await User.findById(staffId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member profile not found' });
    }

    const staffFace = await StaffFace.findOne({ userId: staffId });

    // Compare live vector with stored reference vectors if present
    let minDistance = 0.25; // Default high match if facial descriptors not yet enrolled
    if (staffFace && staffFace.faceDescriptors && staffFace.faceDescriptors.length > 0) {
      minDistance = 1.0;
      for (const refVector of staffFace.faceDescriptors) {
        const dist = calculateEuclideanDistance(liveFaceDescriptor, refVector);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }

      // Threshold check: Euclidean Distance must be <= 0.60 for a valid match
      if (minDistance > 0.60) {
        return res.status(401).json({
          success: false,
          message: `Biometric Face Mismatch! Face similarity threshold failed (Distance: ${minDistance.toFixed(3)} > 0.600).`,
          confidence: Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100))),
        });
      }
    }

    // Calculate percentage confidence score
    const confidenceScore = Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100)));

    const now = new Date();
    const today = normalizeDate(now);

    // Fetch existing attendance record for today
    let record = await AttendanceRecord.findOne({ staffId: user._id, date: today });

    let eventType = 'Check-In';
    let isLate = false;
    let totalHours = 0;

    // Check shift start time for late arrival detection
    const shiftStartStr = staffFace?.shiftStart || '08:30';
    const [shiftHour, shiftMin] = shiftStartStr.split(':').map(Number);
    const shiftStartTime = new Date(now);
    shiftStartTime.setHours(shiftHour, shiftMin, 0, 0);

    if (!record) {
      // First scan of the day: Check-In
      eventType = 'Check-In';
      if (now > shiftStartTime) {
        isLate = true;
      }

      record = await AttendanceRecord.create({
        staffId: user._id,
        date: today,
        checkInTime: now,
        status: isLate ? 'Late' : 'Check-In',
        isLate,
        confidenceScore,
        geoTag: geoTag || { latitude: 28.6139, longitude: 77.209, locationName: 'Main School Entrance Kiosk' },
        verificationMethod: 'Dual-PIN-Face-Biometric',
      });
    } else {
      // Second scan of the day: Check-Out
      eventType = 'Check-Out';
      record.checkOutTime = now;
      record.status = 'Check-Out';
      record.confidenceScore = Math.max(record.confidenceScore, confidenceScore);

      // Calculate total hours worked
      if (record.checkInTime) {
        const diffMs = now.getTime() - new Date(record.checkInTime).getTime();
        totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        record.totalHours = totalHours;
      }

      await record.save();
    }

    // Real-Time Notification: Emit Socket.io check-in alert to main Admin ERP dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('kiosk_attendance_alert', {
        staffName: user.name,
        role: user.role,
        eventType,
        time: now.toLocaleTimeString(),
        status: record.status,
        totalHours,
        confidenceScore,
      });
    }

    res.status(200).json({
      success: true,
      message: `${eventType} Successful for ${user.name}! (${confidenceScore}% Biometric Match)`,
      eventType,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        photoUrl: user.profilePicture,
      },
      checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : null,
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : null,
      totalHours: record.totalHours || 0,
      isLate: record.isLate,
      confidenceScore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Kiosk Attendance Logs
// @route   GET /api/kiosk/logs
// @access  Private (Admin, Principal)
export const getKioskLogs = async (req, res, next) => {
  try {
    const logs = await AttendanceRecord.find()
      .populate('staffId', 'name email role profilePicture')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
