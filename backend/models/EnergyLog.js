import mongoose from 'mongoose';

const energyLogSchema = new mongoose.Schema(
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
    energy: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one energy entry per user per day
energyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('EnergyLog', energyLogSchema);
