import Student from '../models/Student.js';

// @desc    Get all students (with search, pagination, and filter)
// @route   GET /api/students
// @access  Private (Admin, Principal, Teacher, Staff)
export const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', className = '', section = '', status = '' } = req.query;

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

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
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
    const student = await Student.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a student (Teacher registrations require Admin/Principal Approval)
// @route   POST /api/students
// @access  Private (Admin, Principal, Teacher)
export const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, class: className, section, dateOfBirth, gender, address, guardianName, guardianPhone, guardianEmail, photoUrl } = req.body;

    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }

    const initialStatus = req.user.role === 'Teacher' ? 'Pending Approval' : 'Active';

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
      photoUrl,
      status: initialStatus,
      approvedBy: req.user.role !== 'Teacher' ? req.user._id : undefined,
      createdBy: req.user._id,
    });

    const savedStudent = await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_created', savedStudent);
    }

    res.status(201).json({
      success: true,
      message: initialStatus === 'Pending Approval' ? 'Student admission submitted for Principal/Admin approval' : 'Student created successfully',
      student: savedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve Student Admission (Admin/Principal only)
// @route   PATCH /api/students/:id/approve
// @access  Private (Admin, Principal)
export const approveStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = 'Active';
    student.approvedBy = req.user._id;
    const updatedStudent = await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_updated', updatedStudent);
    }

    res.status(200).json({
      success: true,
      message: 'Student admission approved successfully',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Student Status (Active, On Leave, Suspended, Graduated, Pending Approval)
// @route   PATCH /api/students/:id/status
// @access  Private (Admin, Principal, Teacher)
export const updateStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = status;
    if (status === 'Active' && !student.approvedBy) {
      student.approvedBy = req.user._id;
    }

    const updatedStudent = await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_updated', updatedStudent);
    }

    res.status(200).json({
      success: true,
      message: `Student status updated to ${status}`,
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Class-wise Student Attendance in Bulk
// @route   POST /api/students/attendance
// @access  Private (Admin, Principal, Teacher)
export const markBulkStudentAttendance = async (req, res, next) => {
  try {
    const { date, attendanceRecords } = req.body; // [{ studentId, status: 'Present'|'Absent'|'Late'|'Excused' }]
    const attendanceDate = date ? new Date(date) : new Date();

    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance records payload' });
    }

    for (const rec of attendanceRecords) {
      const student = await Student.findById(rec.studentId);
      if (student) {
        // Remove existing record for date if present
        student.attendance = student.attendance.filter(
          (a) => new Date(a.date).toISOString().split('T')[0] !== attendanceDate.toISOString().split('T')[0]
        );
        // Push new attendance record
        student.attendance.push({
          date: attendanceDate,
          status: rec.status || 'Present',
        });
        await student.save();
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('student_attendance_updated', { date: attendanceDate });
    }

    res.status(200).json({ success: true, message: 'Student class attendance recorded successfully' });
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
      'photoUrl',
      'status',
      'academicRecords',
      'attendance',
    ];

    updateKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        student[key] = req.body[key];
      }
    });

    const updatedStudent = await student.save();

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

    const io = req.app.get('io');
    if (io) {
      io.emit('student_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    next(error);
  }
};
