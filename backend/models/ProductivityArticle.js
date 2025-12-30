import mongoose from 'mongoose';

const productivityArticleSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    takeaways: [String],
    context: {
      energyLevel: String,
      mood: String,
      hasFatigue: Boolean,
    },
  },
  { timestamps: true }
);

productivityArticleSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('ProductivityArticle', productivityArticleSchema);
