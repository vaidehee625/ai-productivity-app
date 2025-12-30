import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    streakStartDate: {
      type: Date,
      default: null,
    },
    lastCompletionDate: {
      type: Date,
      default: null,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        icon: String,
        unlockedAt: Date,
        description: String,
      },
    ],
    dailyCheckIns: [
      {
        date: Date,
        completed: Boolean,
      },
    ],
    aiEncouragement: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
streakSchema.index({ userId: 1 });

export default mongoose.model('Streak', streakSchema);
