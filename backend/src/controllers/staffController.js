import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import StaffFace from '../models/StaffFace.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStaff = async (req, res, next) => {
  try {
    const staffList = await Staff.find().populate('userId', 'name email role phone profilePicture pinCode');
    res.status(200).json({ success: true, staff: staffList });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff details
// @route   GET /api/staff/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }
    res.status(200).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Staff Status (Active, On Leave, Suspended, Resigned, Retired)
// @route   PATCH /api/staff/:id/status
// @access  Private (Admin, Principal)
// @desc    Update Staff Status (Active, On Leave, Suspended, Resigned, Retired)
// @route   PATCH /api/staff/:id/status
// @access  Private (Admin, Principal)
export const updateStaffStatus = async (req, res, next) => {
  try {
    const { status, reason, duration } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Role check: Principal requests for Suspended, Resigned, Retired require Admin approval
    if (req.user.role === 'Principal' && ['Suspended', 'Resigned', 'Retired'].includes(status)) {
      staff.pendingStatus = status;
      staff.pendingReason = reason || '';
      staff.pendingDuration = Number(duration) || 0;
      await staff.save();

      const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
      const io = req.app.get('io');
      if (io) {
        io.emit('staff_updated', updatedStaff);
      }

      return res.status(200).json({
        success: true,
        message: `Status change request (${status}) submitted to Admin for approval`,
        staff: updatedStaff,
      });
    }

    // Otherwise (Admin, or Principal requesting Active / On Leave), update directly
    staff.status = status;
    staff.statusReason = reason || '';
    staff.statusDuration = Number(duration) || 0;
    staff.pendingStatus = 'None'; // clear pending if matching directly
    staff.pendingReason = '';
    staff.pendingDuration = 0;
    await staff.save();

    const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');

    const io = req.app.get('io');
    if (io) {
      io.emit('staff_updated', updatedStaff);
    }

    res.status(200).json({ success: true, message: `Staff status updated to ${status}`, staff: updatedStaff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff profile
// @route   PUT /api/staff/:id
// @access  Private (Admin, Principal)
export const updateStaff = async (req, res, next) => {
  const { name, email, phone, pinCode, department, roleDetails, shift, photoUrl, status } = req.body;

  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Update Staff fields
    if (department !== undefined) staff.department = department;
    if (roleDetails !== undefined) staff.roleDetails = roleDetails;
    if (shift !== undefined) staff.shift = shift;
    if (photoUrl !== undefined) staff.photoUrl = photoUrl;
    if (status !== undefined) staff.status = status;
    await staff.save();

    // Update associated User fields
    const user = await User.findById(staff.userId);
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

    const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');

    // Emit socket event for real-time synchronization
    const io = req.app.get('io');
    if (io) {
      io.emit('staff_updated', updatedStaff);
    }

    res.status(200).json({ success: true, staff: updatedStaff });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (Admin, Principal)
export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Role check: Principal cannot delete staff directly without Admin approval
    if (req.user.role === 'Principal') {
      staff.pendingStatus = 'Deleted';
      staff.pendingReason = req.body.reason || 'Delete request submitted by Principal';
      staff.pendingDuration = 0;
      await staff.save();

      const updatedStaff = await Staff.findById(staff._id).populate('userId', 'name email role phone profilePicture pinCode');
      const io = req.app.get('io');
      if (io) {
        io.emit('staff_updated', updatedStaff);
      }

      return res.status(200).json({ success: true, message: 'Delete request submitted to Admin for approval', staff: updatedStaff });
    }

    // Otherwise, Admin can delete directly
    // Delete associated User first
    await User.findByIdAndDelete(staff.userId);
    // Delete Staff profile
    await staff.deleteOne();

    // Delete StaffFace biometric data if any
    await StaffFace.findOneAndDelete({ userId: staff.userId });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('staff_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Staff account and profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject Staff Status or Delete request (Admin only)
// @route   PATCH /api/staff/:id/approve-status
// @access  Private (Admin only)
export const approveStaffStatusRequest = async (req, res, next) => {
  try {
    const { approve } = req.body;
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    if (staff.pendingStatus === 'None') {
      return res.status(400).json({ success: false, message: 'No pending status requests found for this staff' });
    }

    const requestedStatus = staff.pendingStatus;
    const requestedReason = staff.pendingReason;
    const requestedDuration = staff.pendingDuration;

    // Clear pending fields
    staff.pendingStatus = 'None';
    staff.pendingReason = '';
    staff.pendingDuration = 0;

    if (approve) {
      if (requestedStatus === 'Deleted') {
        // Perform delete
        await User.findByIdAndDelete(staff.userId);
        await staff.deleteOne();
        await StaffFace.findOneAndDelete({ userId: staff.userId });

        const io = req.app.get('io');
        if (io) {
          io.emit('staff_deleted', req.params.id);
        }
        return res.status(200).json({ success: true, message: 'Staff delete request approved and profile deleted successfully' });
      } else {
        // Transition status
        staff.status = requestedStatus;
        staff.statusReason = requestedReason;
        staff.statusDuration = requestedDuration;
        await staff.save();

        const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
        const io = req.app.get('io');
        if (io) {
          io.emit('staff_updated', updatedStaff);
        }
        return res.status(200).json({ success: true, message: `Staff status change approved and updated to ${requestedStatus}`, staff: updatedStaff });
      }
    } else {
      // Rejected
      await staff.save();
      const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture pinCode');
      return res.status(200).json({ success: true, message: 'Staff status request rejected', staff: updatedStaff });
    }
  } catch (error) {
    next(error);
  }
};
