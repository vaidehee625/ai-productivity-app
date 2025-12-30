import express from 'express';
import { saveMood, getTodayMood } from '../controllers/moodController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectRoute, saveMood);
router.get('/today', protectRoute, getTodayMood);

export default router;
