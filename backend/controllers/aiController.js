import EnergyLog from '../models/EnergyLog.js';
import MoodLog from '../models/MoodLog.js';
import Task from '../models/Task.js';
import TomorrowWorkload from '../models/TomorrowWorkload.js';
import aiService from '../services/aiService.js';

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const fallbackSort = (tasks) => {
  const order = { Easy: 0, Medium: 1, Hard: 2 };
  return [...tasks].sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1));
};

const fallbackGroup = (tasks) => ({ 'All Tasks': tasks.map((t) => t.id) });

export const getEnergySuggestions = async (req, res) => {
  try {
    // 1) Energy for today (must exist)
    const { start, end } = getTodayRange();
    const energyLog = await EnergyLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    if (!energyLog) {
      return res.status(400).json({ success: false, message: 'No energy level set for today. Please set it first.' });
    }

    // 2) Pending tasks
    const tasks = await Task.find(
      { userId: req.userId, status: { $in: ['todo', 'in-progress'] } },
      'title difficulty estimatedTime priority'
    );

    if (!tasks.length) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const payloadTasks = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      difficulty: t.difficulty || 'Medium',
      time: t.estimatedTime || 30,
      priority: t.priority || 'medium',
    }));

    // 3) Call AI for ordering
    let orderedIds = [];
    try {
      orderedIds = await aiService.getEnergyTaskOrder(energyLog.energy, payloadTasks);
    } catch (err) {
      console.error('AI suggestion failed:', err);
      orderedIds = [];
    }

    // 4) Validate IDs and build ordered tasks
    const validIdSet = new Set(payloadTasks.map((t) => t.id));
    const filtered = orderedIds.filter((id) => validIdSet.has(id));

    let orderedTasks;
    if (filtered.length) {
      const byId = new Map(payloadTasks.map((t) => [t.id, t]));
      orderedTasks = filtered.map((id) => byId.get(id)).filter(Boolean);
      // append any missing tasks to maintain completeness
      const missing = payloadTasks.filter((t) => !filtered.includes(t.id));
      orderedTasks = [...orderedTasks, ...missing];
    } else {
      orderedTasks = fallbackSort(payloadTasks);
    }

    return res.status(200).json({ success: true, recommendations: orderedTasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMoodSuggestions = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const moodLog = await MoodLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    if (!moodLog) {
      return res.status(400).json({ success: false, message: 'No mood set for today. Please set it first.' });
    }

    const tasks = await Task.find(
      { userId: req.userId, status: { $in: ['todo', 'in-progress'] } },
      'title difficulty estimatedTime priority'
    );

    if (!tasks.length) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const payloadTasks = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      difficulty: t.difficulty || 'Medium',
      time: t.estimatedTime || 30,
      priority: t.priority || 'medium',
    }));

    let orderedIds = [];
    try {
      orderedIds = await aiService.getMoodTaskOrder(moodLog.mood, payloadTasks);
    } catch (err) {
      console.error('AI mood suggestion failed:', err);
      orderedIds = [];
    }

    const validIdSet = new Set(payloadTasks.map((t) => t.id));
    const filtered = orderedIds.filter((id) => validIdSet.has(id));

    let orderedTasks;
    if (filtered.length) {
      const byId = new Map(payloadTasks.map((t) => [t.id, t]));
      orderedTasks = filtered.map((id) => byId.get(id)).filter(Boolean);
      const missing = payloadTasks.filter((t) => !filtered.includes(t.id));
      orderedTasks = [...orderedTasks, ...missing];
    } else {
      orderedTasks = fallbackSort(payloadTasks);
    }

    return res.status(200).json({ success: true, recommendations: orderedTasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGroupedTasks = async (req, res) => {
  try {
    const tasks = await Task.find(
      { userId: req.userId, status: { $in: ['todo', 'in-progress'] } },
      'title description'
    );

    if (!tasks.length) {
      return res.status(200).json({ success: true, groups: {} });
    }

    const payload = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description || '',
    }));

    let grouped = {};
    try {
      grouped = await aiService.getGroupedTasks(payload);
    } catch (err) {
      console.error('AI grouping failed:', err);
      grouped = {};
    }

    // Validate: ensure all task ids appear exactly once
    const allIds = new Set(payload.map((t) => t.id));
    const seen = new Set();
    const validGroups = {};

    for (const [groupName, ids] of Object.entries(grouped || {})) {
      if (!Array.isArray(ids)) continue;
      const filtered = ids.map(String).filter((id) => allIds.has(id) && !seen.has(id));
      if (filtered.length) {
        filtered.forEach((id) => seen.add(id));
        validGroups[groupName] = filtered;
      }
    }

    const missing = [...allIds].filter((id) => !seen.has(id));
    if (missing.length) {
      validGroups['Unsorted'] = [...(validGroups['Unsorted'] || []), ...missing];
    }

    const hasGroups = Object.keys(validGroups).length > 0;
    const result = hasGroups ? validGroups : fallbackGroup(payload);

    return res.status(200).json({ success: true, groups: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTomorrowWorkload = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const force = String(req.query.force || '').toLowerCase() === 'true';

    if (!force) {
      const cached = await TomorrowWorkload.findOne({ userId: req.userId, date: today });
      if (cached) {
        return res.status(200).json({ success: true, prediction: cached.prediction, summary: cached.summary, source: 'cached' });
      }
    }

    const tasks = await Task.find({ userId: req.userId, status: { $in: ['todo', 'in-progress'] } });

    const summary = tasks.reduce(
      (acc, t) => {
        const diff = (t.difficulty || 'Medium').toLowerCase();
        if (diff === 'easy') acc.easyTasks += 1;
        else if (diff === 'hard') acc.hardTasks += 1;
        else acc.mediumTasks += 1;

        acc.totalTasks += 1;
        acc.estimatedTotalMinutes += Number(t.estimatedTime || 30);
        return acc;
      },
      { totalTasks: 0, easyTasks: 0, mediumTasks: 0, hardTasks: 0, estimatedTotalMinutes: 0 }
    );

    let prediction = null;
    try {
      prediction = await aiService.getTomorrowWorkloadPrediction(summary);
    } catch (err) {
      console.error('AI workload prediction failed:', err);
      prediction = null;
    }

    if (!prediction) {
      const minutes = summary.estimatedTotalMinutes;
      if (minutes < 120) prediction = 'Light';
      else if (minutes <= 300) prediction = 'Medium';
      else prediction = 'Heavy';
    }

    const saved = await TomorrowWorkload.findOneAndUpdate(
      { userId: req.userId, date: today },
      { userId: req.userId, date: today, prediction, summary },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, prediction: saved.prediction, summary: saved.summary, source: prediction ? 'ai' : 'fallback' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubtaskSuggestions = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const postponeCount = task.postponeCount ?? task.postponedCount ?? 0;
    const isFatigueProne = postponeCount >= 3 || (task.difficulty || '').toLowerCase() === 'hard';
    if (!isFatigueProne) {
      return res.status(200).json({ success: true, subtasks: [], note: 'Task not marked as fatigue-prone' });
    }

    const suggestions = await aiService.generateSubtaskSuggestions(task.title, task.description || '');
    return res.status(200).json({ success: true, subtasks: suggestions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
