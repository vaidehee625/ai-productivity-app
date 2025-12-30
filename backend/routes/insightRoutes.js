import express from 'express';
import {
  logMoodEnergy,
  getEnergyBasedSuggestions,
  getMoodBasedTasks,
  getTaskFatigueAnalysis,
  getBreakSuggestions,
  getMoodHistory,
} from '../controllers/insightController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/mood-energy', protectRoute, logMoodEnergy);
router.post('/energy-suggestions', protectRoute, getEnergyBasedSuggestions);
router.post('/mood-tasks', protectRoute, getMoodBasedTasks);
router.get('/fatigue-analysis', protectRoute, getTaskFatigueAnalysis);
router.post('/break-suggestions', protectRoute, getBreakSuggestions);
router.get('/mood-history', protectRoute, getMoodHistory);

export default router;
