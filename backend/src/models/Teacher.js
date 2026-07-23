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
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model('Teacher', TeacherSchema);
export default Teacher;
