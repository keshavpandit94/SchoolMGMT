import Staff from '../models/Staff.js';
import User from '../models/User.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStaff = async (req, res, next) => {
  try {
    const staffList = await Staff.find().populate('userId', 'name email role phone profilePicture');
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
    const staff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture');
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
export const updateStaffStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    staff.status = status;
    await staff.save();

    const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture');

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
  const { name, email, phone, department, roleDetails, shift, photoUrl, status } = req.body;

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

    const updatedStaff = await Staff.findById(req.params.id).populate('userId', 'name email role phone profilePicture');

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

    // Delete associated User first
    await User.findByIdAndDelete(staff.userId);
    // Delete Staff profile
    await staff.deleteOne();

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
