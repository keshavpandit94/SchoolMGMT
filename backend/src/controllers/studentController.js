import Student from '../models/Student.js';

// @desc    Get all students (with search, pagination, and filter)
// @route   GET /api/students
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', className = '', section = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { guardianName: { $regex: search, $options: 'i' } },
      ];
    }

    if (className) {
      query.class = className;
    }

    if (section) {
      query.section = section;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('createdBy', 'name email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalStudents: total,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('createdBy', 'name email role');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private (Admin, Principal, Teacher)
export const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, class: className, section, dateOfBirth, gender, address, guardianName, guardianPhone, guardianEmail } = req.body;

    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }

    const student = new Student({
      name,
      rollNumber,
      class: className,
      section,
      dateOfBirth,
      gender,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
      createdBy: req.user._id,
    });

    const savedStudent = await student.save();

    // Emit socket event for real-time sync
    const io = req.app.get('io');
    if (io) {
      io.emit('student_created', savedStudent);
    }

    res.status(201).json({ success: true, student: savedStudent });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin, Principal, Teacher)
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // List of keys to update from request body
    const updateKeys = [
      'name',
      'rollNumber',
      'class',
      'section',
      'dateOfBirth',
      'gender',
      'address',
      'guardianName',
      'guardianPhone',
      'guardianEmail',
      'academicRecords',
      'attendance',
    ];

    updateKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        student[key] = req.body[key];
      }
    });

    const updatedStudent = await student.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('student_updated', updatedStudent);
    }

    res.status(200).json({ success: true, student: updatedStudent });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin, Principal, Teacher)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('student_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    next(error);
  }
};
