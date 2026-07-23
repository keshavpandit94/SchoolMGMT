import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Check-In', 'Check-Out', 'Late', 'On Time', 'Present', 'Absent', 'On Leave'],
      default: 'Check-In',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    confidenceScore: {
      type: Number, // Percentage similarity score (e.g. 98.4%)
      default: 95.0,
    },
    geoTag: {
      latitude: Number,
      longitude: Number,
      locationName: { type: String, default: 'Main School Entrance Kiosk' },
    },
    verificationMethod: {
      type: String,
      enum: ['Dual-PIN-Face-Biometric', 'Manual-Admin-Override'],
      default: 'Dual-PIN-Face-Biometric',
    },
  },
  {
    timestamps: true,
  }
);

AttendanceRecordSchema.index({ staffId: 1, date: 1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
export default AttendanceRecord;
