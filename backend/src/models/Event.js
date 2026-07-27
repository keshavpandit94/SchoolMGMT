import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true, // e.g. "Aug 14"
      trim: true,
    },
    fullDate: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      required: true, // e.g. "Technology Event"
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', EventSchema);
export default Event;
