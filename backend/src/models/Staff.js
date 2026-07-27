import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema(
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
    roleDetails: {
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
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'],
      default: 'Morning',
    },
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model('Staff', StaffSchema);
export default Staff;
