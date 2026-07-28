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

    if (!name || !rollNumber || !className || !section || !dateOfBirth || !gender || !guardianName || !guardianPhone || !guardianEmail) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid guardian email address' });
    }

    // Indian Phone format validation
    const cleanPhone = guardianPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.' });
    }

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
      address: address || '',
      guardianName,
      guardianPhone: cleanPhone,
      guardianEmail,
      photoUrl: photoUrl || '',
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

// @desc    Public Admission Application
// @route   POST /api/students/public-admission
// @access  Public
export const publicAdmissionApply = async (req, res, next) => {
  try {
    const { name, class: className, dateOfBirth, gender, address, guardianName, guardianPhone, guardianEmail, photoUrl } = req.body;

    if (!name || !className || !dateOfBirth || !gender || !guardianName || !guardianPhone || !guardianEmail) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields (Name, Class, DOB, Gender, Guardian Name, Phone, Email)' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid guardian email address' });
    }

    // Indian Phone format validation
    const cleanPhone = guardianPhone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.' });
    }

    // Generate unique registration/roll tracking number
    const uniqueRoll = `ADM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent = new Student({
      name,
      rollNumber: uniqueRoll,
      class: className,
      section: 'Pending',
      dateOfBirth,
      gender,
      address: address || '',
      guardianName,
      guardianPhone: cleanPhone,
      guardianEmail,
      photoUrl: photoUrl || '',
      status: 'Pending Approval',
    });

    const savedStudent = await newStudent.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_created', savedStudent);
      io.emit('admission_created', savedStudent);
    }

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully! Tracking ID: ' + uniqueRoll,
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
    const { class: className, section, rollNumber } = req.body;

    if (!className || !section || !rollNumber) {
      return res.status(400).json({ success: false, message: 'Class, section, and roll number are required for approval' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if roll number is already used by another student
    const rollExists = await Student.findOne({ rollNumber, _id: { $ne: req.params.id } });
    if (rollExists) {
      return res.status(400).json({ success: false, message: 'Roll number is already assigned to another student' });
    }

    student.class = className;
    student.section = section;
    student.rollNumber = rollNumber;
    student.status = 'Active';
    student.approvedBy = req.user._id;

    const updatedStudent = await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_updated', updatedStudent);
      io.emit('admission_approved', updatedStudent);
      io.emit('student_status_changed', { studentId: student._id, status: 'Active' });
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

    const reviewStatuses = ['Pending Approval', 'Information Requested', 'Approved', 'Rejected'];
    // Restrict review status changes to Admin and Principal
    if ((reviewStatuses.includes(status) || reviewStatuses.includes(student.status)) && !['Admin', 'Principal'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Admins and Principals can review or modify admission states' });
    }

    student.status = status;
    if (status === 'Active' && !student.approvedBy) {
      student.approvedBy = req.user._id;
    }

    const updatedStudent = await student.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('student_updated', updatedStudent);
      io.emit('student_status_changed', { studentId: student._id, status });
      if (status === 'Information Requested') {
        io.emit('admission_reviewed', updatedStudent);
      } else if (status === 'Rejected') {
        io.emit('admission_rejected', updatedStudent);
      }
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
