import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  postponeTask,
} from '../controllers/taskController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protectRoute, createTask);
router.get('/', protectRoute, getTasks);
router.get('/:id', protectRoute, getTaskById);
router.put('/:id', protectRoute, updateTask);
router.delete('/:id', protectRoute, deleteTask);
router.post('/:id/subtasks', protectRoute, addSubtask);
router.put('/:id/subtasks/:subtaskId', protectRoute, toggleSubtask);
router.post('/:id/postpone', protectRoute, postponeTask);

export default router;
