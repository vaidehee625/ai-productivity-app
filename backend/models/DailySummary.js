import mongoose from 'mongoose';

const dailySummarySchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailySummary', dailySummarySchema);
