import mongoose from 'mongoose';

const productivityStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    tasksCreated: {
      type: Number,
      default: 0,
    },
    tasksPostponed: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    averageTaskDuration: {
      type: Number, // in minutes
      default: 0,
    },
    productivityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    aiRecommendations: [
      {
        type: String,
      },
    ],
    topCategory: {
      type: String,
      default: null,
    },
    breaksSuggested: [
      {
        time: Date,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
productivityStatsSchema.index({ userId: 1, date: -1 });

export default mongoose.model('ProductivityStats', productivityStatsSchema);
