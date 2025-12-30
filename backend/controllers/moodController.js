import MoodLog from '../models/MoodLog.js';

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const saveMood = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!['Happy', 'Neutral', 'Stressed'].includes(mood)) {
      return res.status(400).json({ message: 'Mood must be Happy, Neutral, or Stressed' });
    }

    const { start, end } = getTodayRange();
    const log = await MoodLog.findOneAndUpdate(
      { userId: req.userId, date: { $gte: start, $lt: end } },
      { userId: req.userId, mood, date: start },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTodayMood = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const log = await MoodLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    return res.status(200).json({ success: true, mood: log ? log.mood : null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
