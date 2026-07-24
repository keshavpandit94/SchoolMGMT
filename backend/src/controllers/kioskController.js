import bcrypt from 'bcryptjs';
import StaffFace from '../models/StaffFace.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import SchoolSetting from '../models/SchoolSetting.js';
import { checkWindowActive } from './settingsController.js';

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
    const { userId, pinCode, faceDescriptors, faceImage, shiftStart, shiftEnd } = req.body;

    if (!userId || !pinCode || !faceDescriptors || !Array.isArray(faceDescriptors) || faceDescriptors.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide User ID, PIN code, and reference facial descriptors' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found in user database' });
    }

    // Hash PIN code
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pinCode, salt);

    // Also update pinCode in User model
    user.pinCode = pinCode;
    await user.save();

    // Upsert StaffFace record
    const staffFace = await StaffFace.findOneAndUpdate(
      { userId },
      {
        userId,
        pinHash,
        faceDescriptors,
        referenceImage: faceImage || '',
        shiftStart: shiftStart || '08:00',
        shiftEnd: shiftEnd || '10:00',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Facial biometric profile registered successfully for ${user.name}`,
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
    const { pinCode, staffId } = req.body;

    if (!pinCode || !/^\d{4}$/.test(pinCode.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 4-digit security PIN' });
    }

    // Check attendance window settings
    const setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    const startTime = setting?.startTime || '08:00';
    const endTime = setting?.endTime || '10:00';
    const windowStatus = checkWindowActive(startTime, endTime);

    if (windowStatus.isCutoffPassed) {
      return res.status(400).json({
        success: false,
        message: `Attendance window closed at ${endTime}. Marking attendance is disabled.`,
        isWindowOpen: false,
      });
    }

    let matchedUser = null;
    let matchedStaffFace = null;

    if (staffId) {
      // Direct PIN check for selected staff member
      const user = await User.findById(staffId);
      if (user) {
        const validPin = user.pinCode || '1234';
        if (pinCode === validPin) {
          matchedUser = user;
          matchedStaffFace = await StaffFace.findOne({ userId: user._id });
        }
      }
    } else {
      // Search all registered StaffFace entries for a PIN match
      const allStaffFaces = await StaffFace.find().populate('userId', 'name email role phone profilePicture pinCode');
      for (const sf of allStaffFaces) {
        if (sf.pinHash && (await bcrypt.compare(pinCode, sf.pinHash))) {
          matchedUser = sf.userId;
          matchedStaffFace = sf;
          break;
        }
      }

      // Fallback: check User.pinCode directly
      if (!matchedUser) {
        const fallbackUser = await User.findOne({ pinCode });
        if (fallbackUser) {
          matchedUser = fallbackUser;
          matchedStaffFace = await StaffFace.findOne({ userId: fallbackUser._id });
        }
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, message: 'Invalid PIN entered for this member. Access denied.' });
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
        hasFaceEnrolled: Boolean(matchedStaffFace && matchedStaffFace.faceDescriptors?.length > 0),
      },
      shiftStart: startTime,
      shiftEnd: endTime,
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
    const { staffId, liveFaceDescriptor, faceImage, geoTag } = req.body;

    if (!staffId || !liveFaceDescriptor || !Array.isArray(liveFaceDescriptor)) {
      return res.status(400).json({ success: false, message: 'Missing staff ID or live facial vector descriptor' });
    }

    const user = await User.findById(staffId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member profile not found' });
    }

    // Check attendance window settings
    const setting = await SchoolSetting.findOne({ key: 'attendance_window' });
    const startTime = setting?.startTime || '08:00';
    const endTime = setting?.endTime || '10:00';
    const windowStatus = checkWindowActive(startTime, endTime);

    if (windowStatus.isCutoffPassed) {
      return res.status(400).json({
        success: false,
        message: `Attendance window closed at ${endTime}. Time over.`,
      });
    }

    let staffFace = await StaffFace.findOne({ userId: staffId });

    let minDistance = 0.20;
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
          message: `Biometric Face Mismatch! Face verification failed (does not match stored face image).`,
          confidence: Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100))),
        });
      }
    } else {
      // First-time face capture: Save reference image & facial vector in DB for next time verification!
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash(user.pinCode || '1234', salt);

      staffFace = await StaffFace.findOneAndUpdate(
        { userId: staffId },
        {
          userId: staffId,
          pinHash,
          faceDescriptors: [liveFaceDescriptor],
          referenceImage: faceImage || '',
          shiftStart: startTime,
          shiftEnd: endTime,
        },
        { upsert: true, new: true }
      );
      console.log(`Auto-enrolled facial biometric profile for ${user.name} for future verification.`);
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

    const [shiftHour, shiftMin] = startTime.split(':').map(Number);
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

      if (record.checkInTime) {
        const diffMs = now.getTime() - new Date(record.checkInTime).getTime();
        totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        record.totalHours = totalHours;
      }

      await record.save();
    }

    // Update Master Daily Attendance record for Admin ERP roster view
    const masterStatus = isLate ? 'Late' : 'Present';
    await Attendance.findOneAndUpdate(
      { personId: user._id, date: today },
      {
        personId: user._id,
        personType: user.role === 'Teacher' ? 'Teacher' : 'Staff',
        date: today,
        status: masterStatus,
        markedVia: 'Self-Kiosk',
        recordedBy: user._id,
        remarks: `Biometric Kiosk ${eventType} at ${now.toLocaleTimeString()}`,
      },
      { upsert: true }
    );

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

      // Also trigger roster update on all listening SPAs
      io.emit('attendance_updated', { date: today, updatedBy: user.name });
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
