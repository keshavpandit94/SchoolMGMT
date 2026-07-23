import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personType: {
      type: String,
      enum: ['Teacher', 'Staff'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On Leave'],
      default: 'Present',
    },
    markedVia: {
      type: String,
      enum: ['Manual', 'Auto-Timeout', 'Self-Kiosk'],
      default: 'Manual',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Composite unique index so a person only has one attendance entry per day
AttendanceSchema.index({ personId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
