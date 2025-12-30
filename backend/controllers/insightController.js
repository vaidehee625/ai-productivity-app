import MoodEnergyLog from '../models/MoodEnergyLog.js';
import EnergyLog from '../models/EnergyLog.js';
import MoodLog from '../models/MoodLog.js';
import Task from '../models/Task.js';
import aiService from '../services/aiService.js';

export const logMoodEnergy = async (req, res) => {
  try {
    const { mood, energyLevel, stressLevel, motivationLevel, focusLevel, notes } = req.body;

    const log = await MoodEnergyLog.create({
      userId: req.userId,
      mood,
      energyLevel,
      stressLevel,
      motivationLevel,
      focusLevel,
      notes,
    });

    // Also persist to the primary daily logs used by AI suggestions
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    // Normalize values to match model enums
    const moodCap = mood === 'happy' ? 'Happy' : mood === 'stressed' ? 'Stressed' : 'Neutral';
    const energyCap = energyLevel === 'low' ? 'Low' : energyLevel === 'high' ? 'High' : 'Medium';

    await MoodLog.findOneAndUpdate(
      { userId: req.userId, date: { $gte: start, $lt: end } },
      { userId: req.userId, mood: moodCap, date: start },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await EnergyLog.findOneAndUpdate(
      { userId: req.userId, date: { $gte: start, $lt: end } },
      { userId: req.userId, energy: energyCap, date: start },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      log,
      mood: moodCap,
      energy: energyCap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnergyBasedSuggestions = async (req, res) => {
  try {
    // Use explicitly logged energy only
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const energyLog = await EnergyLog.findOne({
      userId: req.userId,
      date: { $gte: start, $lt: end },
    });

    if (!energyLog) {
      return res.status(400).json({
        success: false,
        message: 'No energy level set for today. Please select your energy first.',
      });
    }

    const tasks = await Task.find({
      userId: req.userId,
      status: { $in: ['todo', 'in-progress'] },
    });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        suggestions: {
          prioritizedTasks: [],
          reasoning: 'No pending tasks',
        },
      });
    }

    const suggestions = await aiService.getEnergyBasedSuggestions(tasks, energyLog.energy);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMoodBasedTasks = async (req, res) => {
  try {
    const { mood } = req.body;

    const tasks = await Task.find({
      userId: req.userId,
      status: { $in: ['todo', 'in-progress'] },
    });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: {
          recommendedTasks: [],
          moodTips: 'No pending tasks. Great job!',
        },
      });
    }

    const recommendations = await aiService.getMoodBasedTasks(tasks, mood);

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskFatigueAnalysis = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });

    const postponedCount = tasks.filter((t) => t.status === 'postponed').length;
    const totalCount = tasks.length;

    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        analysis: {
          hasFatigue: false,
          severity: 'low',
          advice: 'Create some tasks to get started!',
        },
      });
    }

    const analysis = await aiService.detectTaskFatigue(postponedCount, totalCount);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBreakSuggestions = async (req, res) => {
  try {
    const { continuousWorkMinutes } = req.body;

    const suggestions = await aiService.suggestBreaks(continuousWorkMinutes);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await MoodEnergyLog.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
