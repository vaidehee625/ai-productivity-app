import express from 'express';
import { saveEnergy, getTodayEnergy } from '../controllers/energyController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectRoute, saveEnergy);
router.get('/today', protectRoute, getTodayEnergy);

export default router;
