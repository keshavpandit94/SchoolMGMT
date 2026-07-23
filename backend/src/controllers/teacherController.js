import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin, Principal, Teacher, Staff)
export const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate('userId', 'name email role phone profilePicture');
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
    const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private (Admin, Principal)
export const updateTeacher = async (req, res, next) => {
  const { name, email, phone, department, designation, qualifications, subjectsTaught } = req.body;

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
    await teacher.save();

    // Update associated User fields
    const user = await User.findById(teacher.userId);
    if (user) {
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
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

    const updatedTeacher = await Teacher.findById(req.params.id).populate('userId', 'name email role phone profilePicture');

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

    // Delete associated User first
    await User.findByIdAndDelete(teacher.userId);
    // Delete Teacher profile
    await teacher.deleteOne();

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
