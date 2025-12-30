import mongoose from 'mongoose';

const workSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

workSessionSchema.index({ userId: 1, endTime: 1, startTime: -1 });

export default mongoose.model('WorkSession', workSessionSchema);
