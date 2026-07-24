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
    // Array of 128-dimensional floating point vectors (reference facial embeddings)
    faceDescriptors: [
      {
        type: [Number],
        required: true,
      },
    ],
    // Captured facial snapshot image stored in DB
    referenceImage: {
      type: String,
      default: '',
    },
    referenceImages: [
      {
        type: String,
      },
    ],
    shiftStart: {
      type: String,
      default: '08:00', // HH:mm format
    },
    shiftEnd: {
      type: String,
      default: '10:00', // HH:mm format
    },
  },
  {
    timestamps: true,
  }
);

const StaffFace = mongoose.model('StaffFace', StaffFaceSchema);
export default StaffFace;
