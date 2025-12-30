import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    mood: {
      type: String,
      enum: ['Happy', 'Neutral', 'Stressed'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

moodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('MoodLog', moodLogSchema);
