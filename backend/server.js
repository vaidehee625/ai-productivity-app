import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/authMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import energyRoutes from './routes/energyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import workSessionRoutes from './routes/workSessionRoutes.js';
import productivityRoutes from './routes/productivityRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to database
connectDB();

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'AI Productivity Manager Backend',
    version: '1.0.0',
    status: 'running'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/stats', streakRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/work-sessions', workSessionRoutes);
app.use('/api/productivity', productivityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
