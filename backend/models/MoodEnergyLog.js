import mongoose from 'mongoose';

const moodEnergyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    mood: {
      type: String,
      enum: ['happy', 'neutral', 'stressed'],
      required: true,
    },
    energyLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    motivationLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    focusLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    notes: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
moodEnergyLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('MoodEnergyLog', moodEnergyLogSchema);
