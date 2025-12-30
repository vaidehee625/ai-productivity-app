import Task from '../models/Task.js';
import WorkSession from '../models/WorkSession.js';
import ProductivityStats from '../models/ProductivityStats.js';
import aiService from '../services/aiService.js';

// Derive priority from urgency + importance (Eisenhower Matrix)
const derivePriority = (urgency, importance) => {
  // If either is not set, default to medium
  if (!urgency || !importance) return 'medium';
  
  if (urgency === 'High' && importance === 'High') return 'high';
  if (urgency === 'Low' && importance === 'Low') return 'low';
  return 'medium'; // High/Low or Low/High combinations
};

// Ensure a single active work session per user; create if missing
const startWorkSessionIfNone = async (userId) => {
  const existing = await WorkSession.findOne({ userId, endTime: null }).sort({ startTime: -1 });
  if (existing) return existing;
  return WorkSession.create({ userId, startTime: new Date() });
};

// End the active work session, if any
const endActiveWorkSession = async (userId) => {
  const active = await WorkSession.findOne({ userId, endTime: null }).sort({ startTime: -1 });
  if (!active) return null;
  const now = new Date();
  active.endTime = now;
  const durationMs = now - new Date(active.startTime);
  active.durationMinutes = Math.max(1, Math.round(durationMs / 60000));
  await active.save();
  return active;
};

// Helper to get or create today's productivity stats
const getTodayStats = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let stats = await ProductivityStats.findOne({ userId, date: today });
  if (!stats) {
    stats = await ProductivityStats.create({
      userId,
      date: today,
      tasksCompleted: 0,
      tasksCreated: 0,
      tasksPostponed: 0,
      totalTimeSpent: 0,
      averageTaskDuration: 0,
      productivityScore: 0,
    });
  }
  return stats;
};

export const createTask = async (req, res) => {
  try {
    const { title, description, category, estimatedTime, dueDate, tags, urgency, importance, isTopTask, topTaskDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a task title' });
    }

    // Create the task first (AI should not block creation)
    const taskData = {
      userId: req.userId,
      title,
      description,
      category,
      estimatedTime,
      dueDate,
      tags,
    };
    
    // Add optional fields only if they have valid values
    if (urgency) taskData.urgency = urgency;
    if (importance) taskData.importance = importance;
    
    // DERIVE priority from urgency + importance (Eisenhower Matrix)
    taskData.priority = derivePriority(urgency, importance);
    
    if (isTopTask !== undefined) taskData.isTopTask = isTopTask;
    if (topTaskDate) taskData.topTaskDate = topTaskDate;
    
    const task = await Task.create(taskData);

    // Update today's stats for task creation
    try {
      const stats = await getTodayStats(req.userId);
      stats.tasksCreated += 1;
      const denom = Math.max(1, stats.tasksCreated + stats.tasksPostponed);
      stats.productivityScore = Math.min(100, Math.round((stats.tasksCompleted * 100) / denom));
      await stats.save();
    } catch (e) {
      console.error('Stats update failed on createTask:', e);
    }

    // Classify difficulty asynchronously; failures are tolerated
    try {
      const combinedText = `${title} ${description || ''}`.trim();
      if (combinedText) {
        const difficulty = await aiService.getTaskDifficulty(combinedText);
        task.difficulty = difficulty;
        await task.save();
      }
    } catch (aiError) {
      console.error('AI difficulty classification failed (createTask):', aiError);
    }

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, category, priority, sortBy = 'createdAt' } = req.query;

    let query = { userId: req.userId };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).sort({ [sortBy]: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const existingTask = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const previousDueDate = existingTask.dueDate ? new Date(existingTask.dueDate) : null;

    const newStatus = req.body.status ?? existingTask.status;

    // Handle status transitions
    if (newStatus === 'completed' && existingTask.status !== 'completed') {
      req.body.completedAt = new Date();
      // Stats update for completion
      try {
        const stats = await getTodayStats(req.userId);
        stats.tasksCompleted += 1;
        const minutesToAdd = Number(req.body.actualTime ?? existingTask.actualTime ?? existingTask.estimatedTime ?? 0) || 0;
        stats.totalTimeSpent += minutesToAdd;
        stats.averageTaskDuration = stats.tasksCompleted > 0 ? Math.round(stats.totalTimeSpent / stats.tasksCompleted) : 0;
        const denom = Math.max(1, stats.tasksCreated + stats.tasksPostponed);
        stats.productivityScore = Math.min(100, Math.round((stats.tasksCompleted * 100) / denom));
        await stats.save();
      } catch (e) {
        console.error('Stats update failed on completion:', e);
      }
    }

    if (newStatus === 'in-progress' && existingTask.status !== 'in-progress') {
      req.body.startedAt = new Date();
      await startWorkSessionIfNone(req.userId);
    }

    if (existingTask.status === 'in-progress' && newStatus !== 'in-progress') {
      await endActiveWorkSession(req.userId);
    }

    // Enforce Daily Top-3 limit when marking a task as top for today
    if (req.body && typeof req.body.isTopTask !== 'undefined') {
      const wantTop = Boolean(req.body.isTopTask);
      if (wantTop) {
        // Determine the date bucket (start of day)
        const date = req.body.topTaskDate ? new Date(req.body.topTaskDate) : new Date();
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        // Count current top tasks for the user on this date (excluding this task if already top)
        const currentTopCount = await Task.countDocuments({
          userId: req.userId,
          isTopTask: true,
          topTaskDate: { $gte: start, $lt: end },
          _id: { $ne: existingTask._id },
        });

        const alreadyTopToday = existingTask.isTopTask === true && existingTask.topTaskDate && (new Date(existingTask.topTaskDate)).getTime() >= start.getTime() && (new Date(existingTask.topTaskDate)).getTime() < end.getTime();

        if (!alreadyTopToday && currentTopCount >= 3) {
          return res.status(400).json({
            success: false,
            message: 'Daily Top-3 limit reached. You can only mark 3 tasks for today.',
          });
        }

        // Normalize provided topTaskDate to start-of-day
        req.body.topTaskDate = start;
      } else {
        // Clearing top task state
        req.body.topTaskDate = null;
      }
    }

    // DERIVE priority if urgency or importance changed
    if (req.body.urgency || req.body.importance) {
      const newUrgency = req.body.urgency ?? existingTask.urgency;
      const newImportance = req.body.importance ?? existingTask.importance;
      req.body.priority = derivePriority(newUrgency, newImportance);
    }

    let task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Detect due date pushes as postponement (explicit user intent)
    const newDueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (
      previousDueDate instanceof Date && !Number.isNaN(previousDueDate.getTime()) &&
      newDueDate instanceof Date && !Number.isNaN(newDueDate.getTime()) &&
      newDueDate.getTime() > previousDueDate.getTime()
    ) {
      task.postponeCount = (task.postponeCount || 0) + 1;
      task.postponedCount = (task.postponedCount || 0) + 1; // legacy mirror
      task.lastPostponedAt = new Date();
      await task.save();
      // Stats update for postponement
      try {
        const stats = await getTodayStats(req.userId);
        stats.tasksPostponed += 1;
        const denom = Math.max(1, stats.tasksCreated + stats.tasksPostponed);
        stats.productivityScore = Math.min(100, Math.round((stats.tasksCompleted * 100) / denom));
        await stats.save();
      } catch (e) {
        console.error('Stats update failed on postponement:', e);
      }
    }

    // Re-classify difficulty after edits (non-blocking)
    try {
      const combinedText = `${task.title} ${task.description || ''}`.trim();
      if (combinedText) {
        const difficulty = await aiService.getTaskDifficulty(combinedText);
        task.difficulty = difficulty;
        await task.save();
      }
    } catch (aiError) {
      console.error('AI difficulty classification failed (updateTask):', aiError);
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Explicit postponement endpoint to record user intent
export const postponeTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.postponeCount = (task.postponeCount || 0) + 1;
    task.postponedCount = (task.postponedCount || 0) + 1; // legacy mirror
    task.lastPostponedAt = new Date();
    await task.save();

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.subtasks.push({
      id: new Date(),
      title,
      completed: false,
      createdAt: new Date(),
    });

    await task.save();

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.subtasks.find((st) => st.id.toString() === subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
