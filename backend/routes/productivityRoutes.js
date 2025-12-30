import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { generateProductivityArticle, addFocusedTime } from '../controllers/productivityController.js';

const router = express.Router();

router.get('/article', protectRoute, generateProductivityArticle);
router.post('/focus/add', protectRoute, addFocusedTime);

export default router;
