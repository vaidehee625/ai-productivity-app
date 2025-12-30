import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['work', 'personal', 'health', 'learning', 'other'],
      default: 'personal',
    },
    // Eisenhower Matrix fields (source of truth for priority calculation)
    urgency: {
      type: String,
      enum: ['Low', 'High'],
      default: null,
      required: false,
    },
    importance: {
      type: String,
      enum: ['Low', 'High'],
      default: null,
      required: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      // NOTE: Priority is DERIVED from urgency + importance, not user-editable
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30,
    },
    actualTime: {
      type: Number, // in minutes, recorded after completion
      default: null,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed', 'postponed'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Legacy field: postponedCount retained for backwards compatibility; use postponeCount going forward.
    postponedCount: {
      type: Number,
      default: 0,
    },
    postponeCount: {
      type: Number,
      default: 0,
    },
    lastPostponedAt: {
      type: Date,
    },
    subtasks: [
      {
        id: mongoose.Schema.Types.ObjectId,
        title: String,
        completed: Boolean,
        createdAt: Date,
      },
    ],
    aiDifficulty: {
      type: String,
      default: null,
      required: false,
    },
    aiNotes: {
      type: String,
      default: null,
    },
    tags: [String],
    energyRequired: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    moodRequired: [
      {
        type: String,
        enum: ['happy', 'neutral', 'stressed'],
      },
    ],
    // Daily Top-3 focus selection
    isTopTask: {
      type: Boolean,
      default: false,
    },
    topTaskDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: 1 });
taskSchema.index({ userId: 1, topTaskDate: 1, isTopTask: 1 });

export default mongoose.model('Task', taskSchema);
