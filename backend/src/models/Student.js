import mongoose from 'mongoose';

const AcademicRecordSchema = new mongoose.Schema({
  term: { type: String, required: true },
  year: { type: Number, required: true },
  subjects: [
    {
      subjectName: { type: String, required: true },
      marksObtained: { type: Number, required: true },
      maxMarks: { type: Number, required: true },
      grade: { type: String },
    },
  ],
  remarks: { type: String },
});

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true },
});

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      required: true,
      trim: true,
    },
    guardianPhone: {
      type: String,
      required: true,
      trim: true,
    },
    guardianEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Active', 'On Leave', 'Suspended', 'Graduated'],
      default: 'Active',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    academicRecords: [AcademicRecordSchema],
    attendance: [AttendanceSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', StudentSchema);
export default Student;
