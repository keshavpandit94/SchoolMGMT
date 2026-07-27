import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Suspended', 'Resigned', 'Retired'],
      default: 'Active',
    },
    statusReason: {
      type: String,
      default: '',
    },
    statusDuration: {
      type: Number,
      default: 0,
    },
    pendingStatus: {
      type: String,
      enum: ['Active', 'On Leave', 'Suspended', 'Resigned', 'Retired', 'Deleted', 'None'],
      default: 'None',
    },
    pendingReason: {
      type: String,
      default: '',
    },
    pendingDuration: {
      type: Number,
      default: 0,
    },
    qualifications: [
      {
        type: String,
      },
    ],
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    subjectsTaught: [
      {
        type: String,
      },
    ],
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
    assignedClass: {
      type: String,
      trim: true,
      default: '',
    },
    assignedSection: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model('Teacher', TeacherSchema);
export default Teacher;
