import mongoose from 'mongoose';

const StaffFaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pinHash: {
      type: String,
      required: true,
    },
    // Array of 128-dimensional floating point vectors (3-5 reference facial embeddings)
    faceDescriptors: [
      {
        type: [Number],
        required: true,
      },
    ],
    shiftStart: {
      type: String,
      default: '08:30', // HH:mm format
    },
    shiftEnd: {
      type: String,
      default: '16:30', // HH:mm format
    },
  },
  {
    timestamps: true,
  }
);

const StaffFace = mongoose.model('StaffFace', StaffFaceSchema);
export default StaffFace;
