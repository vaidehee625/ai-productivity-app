import mongoose from 'mongoose';

const tomorrowWorkloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // represents the day the prediction was generated (today)
    },
    prediction: {
      type: String,
      enum: ['Light', 'Medium', 'Heavy'],
      required: true,
    },
    summary: {
      totalTasks: Number,
      easyTasks: Number,
      mediumTasks: Number,
      hardTasks: Number,
      estimatedTotalMinutes: Number,
    },
  },
  { timestamps: true }
);

tomorrowWorkloadSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('TomorrowWorkload', tomorrowWorkloadSchema);
