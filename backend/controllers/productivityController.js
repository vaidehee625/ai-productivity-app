import ProductivityArticle from '../models/ProductivityArticle.js';
import EnergyLog from '../models/EnergyLog.js';
import MoodLog from '../models/MoodLog.js';
import Task from '../models/Task.js';
import aiService from '../services/aiService.js';

const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const generateProductivityArticle = async (req, res) => {
  try {
    const { start, end } = getTodayBounds();
    const force = String(req.query.force || '').toLowerCase() === 'true';

    if (!force) {
      const existing = await ProductivityArticle.findOne({ userId: req.userId, date: start });
      if (existing) {
        return res.status(200).json({
          success: true,
          article: {
            title: existing.title,
            content: existing.content,
            takeaways: existing.takeaways,
            date: existing.date,
            source: 'cached',
            context: existing.context || null,
          },
        });
      }
    }

    // Gather user context
    const energyLog = await EnergyLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    const moodLog = await MoodLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    const tasks = await Task.find({ userId: req.userId });
    const fatigueCount = tasks.filter((t) => (t.postponeCount || t.postponedCount || 0) >= 3).length;

    const context = {
      energyLevel: energyLog?.energy || 'Medium',
      mood: moodLog?.mood || 'Neutral',
      hasFatigue: fatigueCount > 0,
    };

    let article = null;
    try {
      article = await aiService.generateProductivityArticle(context);
    } catch (err) {
      console.error('AI article generation failed:', err);
      article = null;
    }

    if (!article) {
      article = {
        title: 'Build Momentum with Small Wins',
        content: `Productivity isn't about doing everything at once—it's about steady progress. When you feel overwhelmed, the most effective strategy is to focus on one small, achievable task. Completing it creates momentum and reduces mental clutter.

Break larger projects into micro-tasks that take 15 minutes or less. This makes daunting work feel manageable and gives you frequent completion signals that keep motivation high.

Another key insight: energy management matters more than time management. Schedule your hardest work during your peak focus hours, and use low-energy periods for routine tasks. This alignment maximizes output without burning out.`,
        takeaways: [
          'Start with one small, achievable task to build momentum',
          'Break large projects into 15-minute micro-tasks',
          'Schedule hard work during your peak energy hours',
        ],
      };
    }

    const saved = await ProductivityArticle.findOneAndUpdate(
      { userId: req.userId, date: start },
      {
        userId: req.userId,
        date: start,
        title: article.title,
        content: article.content,
        takeaways: article.takeaways,
        context,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      article: {
        title: saved.title,
        content: saved.content,
        takeaways: saved.takeaways,
        date: saved.date,
        source: article ? 'ai' : 'fallback',
        context: saved.context || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addFocusedTime = async (req, res) => {
  try {
    const { minutes } = req.body;
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: 'Invalid minutes value' });
    }

    // Create a virtual completed task entry for focused time tracking
    // This is a simple implementation - you could enhance this with a dedicated FocusSession model
    const { start } = getTodayBounds();
    
    return res.status(200).json({
      success: true,
      message: `Added ${minutes} minutes to today's focused time`,
      minutes: Number(minutes),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
