import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import StaffFace from '../models/StaffFace.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin, Principal, Teacher, Staff)
export const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'name email role phone profilePicture pinCode');
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher details
// @route   GET /api/teachers/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Teacher Status (Active, On Leave, Suspended, Resigned, Retired)
// @route   PATCH /api/teachers/:id/status
// @access  Private (Admin, Principal)
export const updateTeacherStatus = async (req, res, next) => {
  try {
    const { status, reason, duration } = req.body;
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Role check: Principal requests for Suspended, Resigned, Retired require Admin approval
    if (req.user.role === 'Principal' && ['Suspended', 'Resigned', 'Retired'].includes(status)) {
      teacher.pendingStatus = status;
      teacher.pendingReason = reason || '';
      teacher.pendingDuration = Number(duration) || 0;
      await teacher.save();

      const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
      const io = req.app.get('io');
      if (io) {
        io.emit('teacher_updated', updatedTeacher);
      }

      return res.status(200).json({
        success: true,
        message: `Status change request (${status}) submitted to Admin for approval`,
        teacher: updatedTeacher,
      });
    }

    // Otherwise (Admin, or Principal requesting Active / On Leave), update directly
    teacher.status = status;
    teacher.statusReason = reason || '';
    teacher.statusDuration = Number(duration) || 0;
    teacher.pendingStatus = 'None'; // clear pending if matching directly
    teacher.pendingReason = '';
    teacher.pendingDuration = 0;
    await teacher.save();

    const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');

    const io = req.app.get('io');
    if (io) {
      io.emit('teacher_updated', updatedTeacher);
    }

    res.status(200).json({ success: true, message: `Teacher status updated to ${status}`, teacher: updatedTeacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private (Admin, Principal)
export const updateTeacher = async (req, res, next) => {
  const {
    name,
    email,
    phone,
    pinCode,
    department,
    designation,
    qualifications,
    subjectsTaught,
    photoUrl,
    status,
    isClassTeacher,
    assignedClass,
    assignedSection,
  } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Update Teacher fields
    if (department !== undefined) teacher.department = department;
    if (designation !== undefined) teacher.designation = designation;
    if (qualifications !== undefined) teacher.qualifications = qualifications;
    if (subjectsTaught !== undefined) teacher.subjectsTaught = subjectsTaught;
    if (photoUrl !== undefined) teacher.photoUrl = photoUrl;
    if (status !== undefined) teacher.status = status;
    if (isClassTeacher !== undefined) teacher.isClassTeacher = Boolean(isClassTeacher);
    if (assignedClass !== undefined) teacher.assignedClass = assignedClass;
    if (assignedSection !== undefined) teacher.assignedSection = assignedSection;
    await teacher.save();

    // Update associated User fields
    const user = await User.findById(teacher.userId);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (photoUrl !== undefined) user.profilePicture = photoUrl;
      if (pinCode !== undefined && pinCode.trim() !== '') {
        if (!/^\d{4}$/.test(pinCode.trim())) {
          return res.status(400).json({ success: false, message: 'Security PIN must be exactly 4 numeric digits (e.g. 1234)' });
        }

        if (pinCode.trim() !== user.pinCode) {
          // Check role: Only Admin can change the PIN
          if (req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Only Administrators can change the Security PIN' });
          }

          // Check 14-day rule
          const lastUpdated = user.pinUpdatedAt ? new Date(user.pinUpdatedAt).getTime() : 0;
          const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastUpdated < fourteenDaysInMs) {
            const nextChangeDate = new Date(lastUpdated + fourteenDaysInMs).toLocaleDateString();
            return res.status(400).json({ success: false, message: `Security PIN can only be changed once every 14 days. Next change eligible on ${nextChangeDate}` });
          }

          user.pinCode = pinCode.trim();
          user.pinUpdatedAt = Date.now();
        }

        // Also hash PIN & update StaffFace if biometric facial profile exists
        try {
          const salt = await bcrypt.genSalt(10);
          const pinHash = await bcrypt.hash(pinCode.trim(), salt);
          await StaffFace.findOneAndUpdate(
            { userId: user._id },
            { pinHash },
            { upsert: false }
          );
        } catch (e) {
          console.warn('StaffFace PIN hash sync warning:', e);
        }
      }
      if (email !== undefined) {
        // Ensure email isn't taken by someone else
        const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email already in use by another user' });
        }
        user.email = email;
      }
      await user.save();
    }

    const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');

    // Emit socket event for real-time synchronization
    const io = req.app.get('io');
    if (io) {
      io.emit('teacher_updated', updatedTeacher);
    }

    res.status(200).json({ success: true, teacher: updatedTeacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin, Principal)
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Role check: Principal cannot delete teacher directly without Admin approval
    if (req.user.role === 'Principal') {
      teacher.pendingStatus = 'Deleted';
      teacher.pendingReason = req.body.reason || 'Delete request submitted by Principal';
      teacher.pendingDuration = 0;
      await teacher.save();

      const updatedTeacher = await Teacher.findById(teacher._id).populate('userId', 'name email role phone profilePicture pinCode');
      const io = req.app.get('io');
      if (io) {
        io.emit('teacher_updated', updatedTeacher);
      }

      return res.status(200).json({ success: true, message: 'Delete request submitted to Admin for approval', teacher: updatedTeacher });
    }

    // Otherwise, Admin can delete directly
    // Delete associated User first
    await User.findByIdAndDelete(teacher.userId);
    // Delete Teacher profile
    await teacher.deleteOne();

    // Delete StaffFace biometric data if any
    await StaffFace.findOneAndDelete({ userId: teacher.userId });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('teacher_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Teacher account and profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject Teacher Status or Delete request (Admin only)
// @route   PATCH /api/teachers/:id/approve-status
// @access  Private (Admin only)
export const approveTeacherStatusRequest = async (req, res, next) => {
  try {
    const { approve } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    if (teacher.pendingStatus === 'None') {
      return res.status(400).json({ success: false, message: 'No pending status requests found for this teacher' });
    }

    const requestedStatus = teacher.pendingStatus;
    const requestedReason = teacher.pendingReason;
    const requestedDuration = teacher.pendingDuration;

    // Clear pending fields
    teacher.pendingStatus = 'None';
    teacher.pendingReason = '';
    teacher.pendingDuration = 0;

    if (approve) {
      if (requestedStatus === 'Deleted') {
        // Perform delete
        await User.findByIdAndDelete(teacher.userId);
        await teacher.deleteOne();
        await StaffFace.findOneAndDelete({ userId: teacher.userId });

        const io = req.app.get('io');
        if (io) {
          io.emit('teacher_deleted', req.params.id);
        }
        return res.status(200).json({ success: true, message: 'Teacher delete request approved and profile deleted successfully' });
      } else {
        // Transition status
        teacher.status = requestedStatus;
        teacher.statusReason = requestedReason;
        teacher.statusDuration = requestedDuration;
        await teacher.save();

        const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
        const io = req.app.get('io');
        if (io) {
          io.emit('teacher_updated', updatedTeacher);
        }
        return res.status(200).json({ success: true, message: `Teacher status change approved and updated to ${requestedStatus}`, teacher: updatedTeacher });
      }
    } else {
      // Rejected
      await teacher.save();
      const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
      return res.status(200).json({ success: true, message: 'Teacher status request rejected', teacher: updatedTeacher });
    }
  } catch (error) {
    next(error);
  }
};
