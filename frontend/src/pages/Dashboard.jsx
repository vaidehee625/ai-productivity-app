import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, CheckCircle, Flame, BarChart3, Calendar, Clock, Target } from 'lucide-react';
import API from '../utils/api';
import { useTaskStore, useUIStore } from '../store/store';
import { GlassCard, StatCard, EmptyState } from '../components/UI/UIComponents';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const tasks = useTaskStore((state) => state.tasks);
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, streakRes, predictionRes] = await Promise.all([
        API.get('/stats/daily-stats'),
        API.get('/stats/streak'),
        API.get('/stats/workload-prediction'),
      ]);

      setStats(statsRes.data.stats);
      setStreak(streakRes.data.streak);
      setPrediction(predictionRes.data.prediction);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: CheckCircle,
      label: 'Tasks Completed',
      value: stats?.tasksCompleted || 0,
      color: 'text-green-400',
    },
    {
      icon: TrendingUp,
      label: 'Productivity Score',
      value: `${stats?.productivityScore || 0}%`,
      color: 'text-blue-400',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: streak?.currentStreak || 0,
      color: 'text-orange-600',
    },
    {
      icon: BarChart3,
      label: 'Total Time Spent',
      value: `${stats?.totalTimeSpent || 0}m`,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap className="w-12 h-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-gradient-to-br from-white via-slate-50 to-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            AI Control Center
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Real-time insights and productivity metrics</p>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ translateY: -5 }}
            >
              <StatCard
                icon={card.icon}
                label={card.label}
                value={card.value}
              />
            </motion.div>
          ))}
        </div>

        {/* Daily Top-3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ translateY: -2 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-violet-400" size={28} />
              <h2 className="text-2xl font-bold">Today’s Top-3</h2>
            </div>
            {(() => {
              const start = new Date(); start.setHours(0,0,0,0);
              const end = new Date(start); end.setDate(end.getDate() + 1);
              const topTasks = tasks.filter((t) => t.isTopTask && t.topTaskDate && new Date(t.topTaskDate) >= start && new Date(t.topTaskDate) < end);
              return topTasks.length === 0 ? (
                <EmptyState icon={Target} title="No focus tasks yet" description="Mark up to three tasks as Today’s Focus from the Tasks page." />
              ) : (
                <div className="space-y-3">
                  {topTasks.slice(0, 3).map((task) => (
                    <div key={task._id} className="group p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={task.status === 'completed'} readOnly className="w-5 h-5 rounded accent-indigo-500" />
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{task.estimatedTime}m • {task.priority}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </GlassCard>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Streak Status - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ translateY: -5 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-8 h-full bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="text-orange-400" size={28} />
                <h2 className="text-2xl font-bold">Streak</h2>
              </div>
              {streak && (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current</p>
                    <p className="text-4xl font-bold text-orange-400">{streak.currentStreak}</p>
                    <p className="text-xs text-gray-500 mt-1">days</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Personal Best</p>
                    <p className="text-2xl font-semibold text-white">{streak.longestStreak} days</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((streak.currentStreak / 30) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Keep going!</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Tomorrow's Workload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ translateY: -5 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-8 h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-cyan-400" size={28} />
                <h2 className="text-xl font-bold">Tomorrow</h2>
              </div>
              {prediction && (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Workload</p>
                    <div className="inline-block px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
                      <p className="text-lg font-semibold text-cyan-300 capitalize">
                        {prediction.workloadLevel}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Est. Tasks</p>
                    <p className="text-3xl font-bold text-cyan-400">{prediction.estimatedTasks}</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 bg-white/5 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">{prediction.suggestion}</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ translateY: -5 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-8 h-full bg-gradient-to-br from-violet-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-violet-400" size={28} />
                <h2 className="text-xl font-bold">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full px-4 py-3 bg-violet-500/20 border border-violet-500/40 rounded-lg hover:bg-violet-500/30 transition-all text-violet-300 font-medium text-sm"
                >
                  + Add Task
                </button>
                <button
                  onClick={() => navigate('/insights')}
                  className="w-full px-4 py-3 bg-indigo-500/20 border border-indigo-500/40 rounded-lg hover:bg-indigo-500/30 transition-all text-indigo-300 font-medium text-sm"
                >
                  📊 View Insights
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ translateY: -2 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-blue-400" size={28} />
              <h2 className="text-2xl font-bold">Today's Tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No Tasks Yet"
                description="Create a task to get started on your productivity journey"
              />
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task, idx) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        readOnly
                        className="w-5 h-5 rounded accent-indigo-500"
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
