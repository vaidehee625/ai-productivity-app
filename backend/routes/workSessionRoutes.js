import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { startWorkSession, endWorkSession, getWorkSessionStatus } from '../controllers/workSessionController.js';

const router = express.Router();

router.post('/start', protectRoute, startWorkSession);
router.post('/end', protectRoute, endWorkSession);
router.get('/status', protectRoute, getWorkSessionStatus);

export default router;
