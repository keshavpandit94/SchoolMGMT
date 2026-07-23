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
