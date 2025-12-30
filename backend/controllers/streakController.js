import Streak from '../models/Streak.js';
import Task from '../models/Task.js';
import ProductivityStats from '../models/ProductivityStats.js';
import DailySummary from '../models/DailySummary.js';
import EnergyLog from '../models/EnergyLog.js';
import MoodLog from '../models/MoodLog.js';
import WorkSession from '../models/WorkSession.js';
import aiService from '../services/aiService.js';

const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const getStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId });

    if (!streak) {
      streak = await Streak.create({ userId: req.userId });
    }

    res.status(200).json({
      success: true,
      streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId });

    if (!streak) {
      streak = await Streak.create({ userId: req.userId });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompletion = streak.lastCompletionDate
      ? new Date(streak.lastCompletionDate)
      : null;
    if (lastCompletion) {
      lastCompletion.setHours(0, 0, 0, 0);
    }

    const isConsecutive =
      lastCompletion && (today - lastCompletion) / (1000 * 60 * 60 * 24) === 1;

    if (!lastCompletion || isConsecutive) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else if ((today - lastCompletion) / (1000 * 60 * 60 * 24) > 1) {
      streak.currentStreak = 1;
    }

    streak.lastCompletionDate = new Date();
    streak.totalTasksCompleted += 1;

    // Unlock badges
    const badges = [
      {
        threshold: 7,
        name: 'Week Warrior',
        icon: '⚔️',
        description: 'Complete a 7-day streak',
      },
      {
        threshold: 30,
        name: 'Month Master',
        icon: '👑',
        description: 'Complete a 30-day streak',
      },
      {
        threshold: 100,
        name: 'Century Club',
        icon: '💯',
        description: 'Complete 100 tasks',
      },
    ];

    for (const badge of badges) {
      const achieved =
        (streak.currentStreak >= badge.threshold ||
          streak.totalTasksCompleted >= badge.threshold) &&
        !streak.badges.find((b) => b.name === badge.name);

      if (achieved) {
        streak.badges.push({
          name: badge.name,
          icon: badge.icon,
          unlockedAt: new Date(),
          description: badge.description,
        });
      }
    }

    // Generate AI encouragement
    const moodData = { mood: 'happy', motivationLevel: 10 };
    const encouragement = await aiService.generateEncouragement(
      streak.currentStreak,
      moodData
    );
    streak.aiEncouragement = encouragement.message;

    await streak.save();

    res.status(200).json({
      success: true,
      streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = await ProductivityStats.findOne({
      userId: req.userId,
      date: today,
    });

    if (!stats) {
      const tasks = await Task.find({ userId: req.userId });
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const created = tasks.filter(
        (t) =>
          new Date(t.createdAt).toDateString() === today.toDateString()
      ).length;
      const postponed = tasks.filter((t) => t.status === 'postponed').length;

      stats = await ProductivityStats.create({
        userId: req.userId,
        date: today,
        tasksCompleted: completed,
        tasksCreated: created,
        tasksPostponed: postponed,
        totalTimeSpent: 0,
        averageTaskDuration: 0,
        productivityScore: 0,
      });
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await ProductivityStats.find({
      userId: req.userId,
      date: { $gte: lastWeek, $lte: today },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: stats.length,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateDailySummary = async (req, res) => {
  try {
    const { start, end } = getTodayBounds();
    const force = String(req.query.force || '').toLowerCase() === 'true';

    if (!force) {
      const existing = await DailySummary.findOne({ userId: req.userId, date: start });
      if (existing) {
        return res.status(200).json({
          success: true,
          summary: {
            content: existing.content,
            date: existing.date,
            source: 'cached',
            metadata: existing.metadata || {},
          },
        });
      }
    }

    const tasks = await Task.find({ userId: req.userId });

    const completedToday = tasks.filter(
      (t) => t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= start && new Date(t.completedAt) < end
    );
    const completedCount = completedToday.length;
    const completedTaskTitles = completedToday.slice(0, 5).map((t) => t.title);

    const pendingCount = tasks.filter((t) => ['todo', 'in-progress'].includes(t.status)).length;

    const postponedCount = tasks.filter((t) => (t.postponeCount || t.postponedCount || 0) > 0).length;
    const fatigueTaskTitles = tasks
      .filter((t) => (t.postponeCount || t.postponedCount || 0) >= 3)
      .slice(0, 5)
      .map((t) => t.title);

    const energyLog = await EnergyLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    const moodLog = await MoodLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });

    const sessions = await WorkSession.find({ userId: req.userId, startTime: { $gte: start, $lt: end } });
    let focusedMinutes = 0;
    const hourBuckets = new Map();
    for (const s of sessions) {
      const sStart = new Date(s.startTime);
      const sEnd = s.endTime ? new Date(s.endTime) : new Date();
      const duration = s.durationMinutes || Math.max(0, Math.round((sEnd - sStart) / 60000));
      focusedMinutes += duration;
      const hour = sStart.getHours();
      hourBuckets.set(hour, (hourBuckets.get(hour) || 0) + duration);
    }

    // Add focused time from completed tasks (actualTime or estimatedTime)
    for (const t of completedToday) {
      focusedMinutes += Number(t.actualTime || t.estimatedTime || 0);
    }

    const peakHour = hourBuckets.size
      ? [...hourBuckets.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const tomorrowTaskCount = pendingCount;

    const data = {
      completedCount,
      completedTaskTitles,
      pendingCount,
      energyLevel: energyLog?.energy || null,
      mood: moodLog?.mood || null,
      focusedMinutes,
      fatigueTaskTitles,
      postponedCount,
      peakHour,
      tomorrowTaskCount,
    };

    let content = await aiService.generateEndOfDaySummary(data);
    let source = 'ai';
    if (!content) {
      source = 'fallback';
      content = `You put in steady effort today and kept things moving. You wrapped up ${completedCount} tasks${completedTaskTitles.length ? ` like ${completedTaskTitles.join(', ')}` : ''}, and you still have ${pendingCount} on deck.
Your focus time came out to about ${focusedMinutes} minutes${peakHour !== null ? `, with a strong window around ${peakHour}:00` : ''}, and you reported energy ${data.energyLevel || 'not logged'} with a mood of ${data.mood || 'not logged'}.
${fatigueTaskTitles.length ? 'A few tasks have been postponed multiple times; consider slicing them into smaller steps.' : 'You kept postponements light today.'}
Tomorrow looks manageable with the current workload. Start with one meaningful task during your best focus window and build momentum.
Nice work today—keep the rhythm going.`;
    }

    const saved = await DailySummary.findOneAndUpdate(
      { userId: req.userId, date: start },
      { userId: req.userId, date: start, content, metadata: { ...data, source } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      summary: {
        content: saved.content,
        date: saved.date,
        source,
        metadata: saved.metadata || {},
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const predictNextDayWorkload = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
      status: { $in: ['todo', 'in-progress'] },
    });

    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);

    const stats = await ProductivityStats.find({
      userId: req.userId,
      date: { $gte: lastSevenDays },
    });

    const avgDailyTasks =
      stats.length > 0
        ? stats.reduce((sum, s) => sum + s.tasksCompleted, 0) / stats.length
        : 5;

    const trend =
      stats.length > 1
        ? stats[0].tasksCompleted > stats[stats.length - 1].tasksCompleted
          ? 'increasing'
          : 'decreasing'
        : 'stable';

    const prediction = await aiService.predictNextDayWorkload(tasks, {
      avgDailyTasks,
      trend,
    });

    res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const groupTasksBySimilarity = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
      status: { $in: ['todo', 'in-progress'] },
    });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        groups: [],
      });
    }

    const groups = await aiService.groupTasksBySimilarity(tasks);

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
