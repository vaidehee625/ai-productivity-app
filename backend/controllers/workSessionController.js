import WorkSession from '../models/WorkSession.js';
import Task from '../models/Task.js';
import aiService from '../services/aiService.js';

const BREAK_THRESHOLD_MINUTES = 75;
const FALLBACK_MESSAGE = "You've been working for a while. Consider taking a 5-10 minute break.";

const computeActiveSession = async (userId) => {
  const active = await WorkSession.findOne({ userId, endTime: null }).sort({ startTime: -1 });
  return active;
};

const endActiveSession = async (userId) => {
  const active = await computeActiveSession(userId);
  if (!active) return null;
  const now = new Date();
  active.endTime = now;
  const durationMs = now - new Date(active.startTime);
  active.durationMinutes = Math.max(1, Math.round(durationMs / 60000));
  await active.save();
  return active;
};

const startSession = async (userId) => {
  const existing = await computeActiveSession(userId);
  if (existing) return existing;
  const session = await WorkSession.create({ userId, startTime: new Date() });
  return session;
};

export const startWorkSession = async (req, res) => {
  try {
    const session = await startSession(req.userId);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endWorkSession = async (req, res) => {
  try {
    const session = await endActiveSession(req.userId);
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkSessionStatus = async (req, res) => {
  try {
    const active = await computeActiveSession(req.userId);
    // Compute focused minutes based on completed tasks for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const completedToday = await Task.find({
      userId: req.userId,
      status: 'completed',
      completedAt: { $gte: startOfDay, $lt: endOfDay },
    }).select('actualTime');

    const focusedMinutesToday = completedToday
      .map((t) => (typeof t.actualTime === 'number' ? t.actualTime : 0))
      .reduce((sum, m) => sum + m, 0);

    if (!active) {
      return res.status(200).json({ activeSession: null, needsBreak: false, message: null, continuousMinutes: 0, focusedMinutesToday });
    }

    const now = new Date();
    const minutes = Math.floor((now - new Date(active.startTime)) / 60000);
    let message = null;
    let source = 'none';

    if (minutes >= BREAK_THRESHOLD_MINUTES) {
      try {
        message = await aiService.getBreakSuggestion(minutes);
        source = 'ai';
      } catch (err) {
        console.error('AI break suggestion failed:', err);
        message = FALLBACK_MESSAGE;
        source = 'fallback';
      }
      if (!message) {
        message = FALLBACK_MESSAGE;
        source = 'fallback';
      }
    }

    res.status(200).json({
      activeSession: {
        id: active._id,
        startTime: active.startTime,
        endTime: active.endTime,
        durationMinutes: active.durationMinutes,
      },
      needsBreak: minutes >= BREAK_THRESHOLD_MINUTES,
      continuousMinutes: minutes,
      focusedMinutesToday,
      message,
      source,
      thresholdMinutes: BREAK_THRESHOLD_MINUTES,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const _internalEndActiveSession = endActiveSession;
export const _internalStartSession = startSession;
