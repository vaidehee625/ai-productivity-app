import express from 'express';
import { signup, login, getProfile, updateProfile, logout } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protectRoute, getProfile);
router.put('/profile', protectRoute, updateProfile);
router.post('/logout', protectRoute, logout);

export default router;
