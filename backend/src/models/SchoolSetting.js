import mongoose from 'mongoose';

const SchoolSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'attendance_window',
    },
    startTime: {
      type: String,
      default: '08:00', // HH:mm format (e.g., 08:00 AM)
    },
    endTime: {
      type: String,
      default: '10:00', // HH:mm format (e.g., 10:00 AM)
    },
    autoAbsentCutoff: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SchoolSetting = mongoose.model('SchoolSetting', SchoolSettingSchema);
export default SchoolSetting;
