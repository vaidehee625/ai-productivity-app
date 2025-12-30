import express from 'express';
import {
  getStreak,
  updateStreak,
  getDailyStats,
  getWeeklyStats,
  generateDailySummary,
  predictNextDayWorkload,
  groupTasksBySimilarity,
} from '../controllers/streakController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/streak', protectRoute, getStreak);
router.put('/streak', protectRoute, updateStreak);
router.get('/daily-stats', protectRoute, getDailyStats);
router.get('/weekly-stats', protectRoute, getWeeklyStats);
router.get('/daily-summary', protectRoute, generateDailySummary);
router.get('/workload-prediction', protectRoute, predictNextDayWorkload);
router.get('/group-tasks', protectRoute, groupTasksBySimilarity);

export default router;
