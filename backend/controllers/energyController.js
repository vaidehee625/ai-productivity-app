import EnergyLog from '../models/EnergyLog.js';

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const saveEnergy = async (req, res) => {
  try {
    const { energy } = req.body;
    if (!['Low', 'Medium', 'High'].includes(energy)) {
      return res.status(400).json({ message: 'Energy must be Low, Medium, or High' });
    }

    const { start, end } = getTodayRange();

    const log = await EnergyLog.findOneAndUpdate(
      { userId: req.userId, date: { $gte: start, $lt: end } },
      { userId: req.userId, energy, date: start },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTodayEnergy = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const log = await EnergyLog.findOne({ userId: req.userId, date: { $gte: start, $lt: end } });
    return res.status(200).json({ success: true, energy: log ? log.energy : null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
