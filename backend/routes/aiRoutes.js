import express from 'express';
import { getEnergySuggestions, getMoodSuggestions, getGroupedTasks, getTomorrowWorkload, getSubtaskSuggestions } from '../controllers/aiController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggestions/energy', protectRoute, getEnergySuggestions);
router.get('/suggestions/mood', protectRoute, getMoodSuggestions);
router.get('/tasks/grouped', protectRoute, getGroupedTasks);
router.get('/workload/tomorrow', protectRoute, getTomorrowWorkload);
router.get('/tasks/:id/breakdown', protectRoute, getSubtaskSuggestions);

export default router;
