import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Zap, Brain, CheckCircle2, Circle, Clock, Sparkles, Layers, ChevronDown, ChevronUp, Smile, Coffee, Pencil } from 'lucide-react';
import API from '../utils/api';
import { useTaskStore, useUIStore } from '../store/store';
import { getPriorityColor, getDifficultyColor, formatDate } from '../utils/helpers.jsx';
import { GlassCard, Badge, EmptyState } from '../components/UI/UIComponents';

// Compute priority from urgency + importance (Eisenhower Matrix)
const computePriority = (urgency, importance) => {
  if (!urgency || !importance) return 'medium';
  if (urgency === 'High' && importance === 'High') return 'high';
  if (urgency === 'Low' && importance === 'Low') return 'low';
  return 'medium';
};

function TaskManager() {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    estimatedTime: 30,
    urgency: null,
    importance: null,
    isTopTask: false,
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState(null);
  const [showMatrixView, setShowMatrixView] = useState(false);
  const [surfaceQuickWins, setSurfaceQuickWins] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [moodPromptVisible, setMoodPromptVisible] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [moodRecommendations, setMoodRecommendations] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);
  const [groupedLoading, setGroupedLoading] = useState(false);
  const [groupedTasks, setGroupedTasks] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [subtaskSuggestions, setSubtaskSuggestions] = useState({});
  const [breakSuggestion, setBreakSuggestion] = useState(null);
  const [snoozeUntil, setSnoozeUntil] = useState(null);
  const [completionModal, setCompletionModal] = useState(null);
  const [actualTimeInput, setActualTimeInput] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    estimatedTime: 30,
    urgency: '',
    importance: '',
    difficulty: '',
    isTopTask: false,
  });
  const [editSaving, setEditSaving] = useState(false);
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const BREAK_REMIND_LATER_MINUTES = 30;
  const BREAK_POLL_INTERVAL_MS = 5 * 60 * 1000;
  const FALLBACK_BREAK_MESSAGE = "You've been working for a while. Consider taking a 5-10 minute break.";

  useEffect(() => {
    fetchTasks();
    fetchTodayMood();
  }, [filterStatus]);

  useEffect(() => {
    checkBreakStatus();
    const interval = setInterval(checkBreakStatus, BREAK_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [snoozeUntil]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = '/tasks';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const response = await API.get(url);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMood = async () => {
    try {
      const res = await API.get('/mood/today');
      if (res.data.mood) {
        setTodayMood(res.data.mood);
        setMoodPromptVisible(false);
      } else {
        setMoodPromptVisible(true);
      }
    } catch (error) {
      console.error('Error fetching today mood:', error);
    }
  };

  const saveMood = async (mood) => {
    try {
      await API.post('/mood', { mood });
      setTodayMood(mood);
      setMoodPromptVisible(false);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const fetchEnergySuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const res = await API.get('/ai/suggestions/energy');
      setRecommendedTasks(res.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching energy suggestions:', error);
      const msg = error?.response?.data?.message;
      if (msg) alert(msg);
      setRecommendedTasks([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchMoodSuggestions = async () => {
    if (!todayMood) {
      setMoodPromptVisible(true);
      return;
    }
    setMoodLoading(true);
    try {
      const res = await API.get('/ai/suggestions/mood');
      setMoodRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching mood suggestions:', error);
      const msg = error?.response?.data?.message;
      if (msg) alert(msg);
      setMoodRecommendations([]);
    } finally {
      setMoodLoading(false);
    }
  };

  const fetchGroupedTasks = async () => {
    setGroupedLoading(true);
    try {
      const res = await API.get('/ai/tasks/grouped');
      const groups = res.data.groups || {};
      const mapped = Object.entries(groups).map(([name, ids]) => ({
        name,
        tasks: ids
          .map((id) => tasks.find((t) => t._id === id) || recommendedTasks.find((t) => t.id === id) || moodRecommendations.find((t) => t.id === id))
          .filter(Boolean),
      }));
      setGroupedTasks(mapped);
      // expand all by default
      const initial = {};
      mapped.forEach((g) => {
        initial[g.name] = true;
      });
      setExpandedGroups(initial);
    } catch (error) {
      console.error('Error grouping tasks:', error);
      setGroupedTasks([]);
    } finally {
      setGroupedLoading(false);
    }
  };

  const checkBreakStatus = async () => {
    if (snoozeUntil && Date.now() < snoozeUntil) return;
    try {
      const res = await API.get('/work-sessions/status');
      const { needsBreak, message, focusedMinutesToday } = res.data;
      if (needsBreak) {
        setBreakSuggestion({
          message: message || FALLBACK_BREAK_MESSAGE,
          minutes: focusedMinutesToday,
        });
      } else {
        setBreakSuggestion(null);
      }
    } catch (error) {
      console.error('Error checking break status:', error);
    }
  };

  const handleStartFocusSession = async () => {
    try {
      await API.post('/work-sessions/start');
      setBreakSuggestion(null);
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await API.post('/work-sessions/end');
    } catch (error) {
      console.error('Error ending work session:', error);
    }
  };

  const handleTakeBreak = async () => {
    await handleEndSession();
    setBreakSuggestion(null);
    setSnoozeUntil(Date.now() + 5 * 60 * 1000);
  };

  const handleSnoozeBreak = () => {
    setBreakSuggestion(null);
    setSnoozeUntil(Date.now() + BREAK_REMIND_LATER_MINUTES * 60 * 1000);
  };

  const handleCompleteTask = (task) => {
    setCompletionModal(task);
    setActualTimeInput('');
  };

  const openEditModal = (task) => {
    setEditModal(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      category: task.category || 'personal',
      estimatedTime: task.estimatedTime || 30,
      urgency: task.urgency || '',
      importance: task.importance || '',
      difficulty: task.difficulty || '',
      isTopTask: !!task.isTopTask,
    });
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditSaving(false);
  };

  const saveEdit = async () => {
    if (!editModal) return;
    try {
      setEditSaving(true);
      const start = new Date(); start.setHours(0,0,0,0);
      await handleUpdateTask(editModal._id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        estimatedTime: Number(editForm.estimatedTime) || 30,
        urgency: editForm.urgency || null,
        importance: editForm.importance || null,
        difficulty: editForm.difficulty || null,
        isTopTask: editForm.isTopTask,
        topTaskDate: editForm.isTopTask ? start : null,
      });
      closeEditModal();
    } catch (error) {
      console.error('Error saving edits:', error);
      setEditSaving(false);
    }
  };

  const confirmCompletion = async () => {
    if (!completionModal) return;
    const updates = { status: 'completed' };
    if (actualTimeInput && !isNaN(Number(actualTimeInput))) {
      updates.actualTime = Number(actualTimeInput);
    }
    await handleUpdateTask(completionModal._id, updates);
    setCompletionModal(null);
    setActualTimeInput('');
  };

  const cancelCompletion = () => {
    setCompletionModal(null);
    setActualTimeInput('');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask };
      // Convert empty strings to null for enum fields
      if (payload.urgency === '') payload.urgency = null;
      if (payload.importance === '') payload.importance = null;
      if (payload.isTopTask) {
        const start = new Date(); start.setHours(0,0,0,0);
        payload.topTaskDate = start;
      }
      const response = await API.post('/tasks', payload);
      addTask(response.data.task);
      setNewTask({
        title: '',
        description: '',
        category: 'personal',
        estimatedTime: 30,
        urgency: null,
        importance: null,
        isTopTask: false,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      const msg = error?.response?.data?.message;
      if (msg) alert(msg);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const response = await API.put(`/tasks/${id}`, updates);
      updateTask(id, response.data.task);
      await checkBreakStatus();
    } catch (error) {
      console.error('Error updating task:', error);
      const msg = error?.response?.data?.message;
      if (msg) {
        alert(msg);
      }
    }
  };

  const handlePostponeTask = async (id) => {
    try {
      const response = await API.post(`/tasks/${id}/postpone`);
      updateTask(id, response.data.task);
    } catch (error) {
      console.error('Error postponing task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const fetchSubtaskSuggestions = async (task) => {
    try {
      const res = await API.get(`/ai/tasks/${task._id}/breakdown`);
      const suggestions = res.data.subtasks || [];
      setSubtaskSuggestions((prev) => ({ ...prev, [task._id]: suggestions }));
    } catch (error) {
      console.error('Error getting subtask suggestions:', error);
    }
  };

  const addSuggestedSubtasks = async (taskId) => {
    try {
      const suggestions = subtaskSuggestions[taskId] || [];
      for (const title of suggestions) {
        await API.post(`/tasks/${taskId}/subtasks`, { title });
      }
      await fetchTasks();
      setSubtaskSuggestions((prev) => ({ ...prev, [taskId]: [] }));
    } catch (error) {
      console.error('Error adding suggested subtasks:', error);
    }
  };

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  const timeFilteredTasksRaw = timeFilter
    ? filteredTasks.filter((t) => t.status === 'todo' && (Number(t.estimatedTime) || 0) <= timeFilter)
    : filteredTasks;

  // Two-Minute Rule: Quick Wins detection and optional surfacing at top
  const quickWins = timeFilteredTasksRaw.filter((t) => (t.status === 'todo') && (Number(t.estimatedTime) || 0) <= 2);
  const nonQuickWins = timeFilteredTasksRaw.filter((t) => !((t.status === 'todo') && (Number(t.estimatedTime) || 0) <= 2));
  const timeFilteredTasks = surfaceQuickWins ? [...quickWins, ...nonQuickWins] : timeFilteredTasksRaw;

  const statusColors = {
    'all': 'from-indigo-500/40 to-violet-500/40 border-indigo-500/50',
    'todo': 'from-blue-500/40 to-cyan-500/40 border-blue-500/50',
    'in-progress': 'from-yellow-500/40 to-orange-500/40 border-yellow-500/50',
    'completed': 'from-green-500/40 to-emerald-500/40 border-green-500/50',
    'postponed': 'from-gray-500/40 to-slate-500/40 border-gray-500/50',
  };

  const priorityVariants = {
    low: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300' },
    medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300' },
    high: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300' },
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Task Intelligence
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Smart task management powered by AI</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchEnergySuggestions}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border
                ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              {suggestionsLoading ? (
                <span className="w-4 h-4 border-2 border-transparent border-t-white animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Get AI Suggestions
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchMoodSuggestions}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border
                ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              {moodLoading ? (
                <span className="w-4 h-4 border-2 border-transparent border-t-white animate-spin" />
              ) : (
                <Smile className="w-4 h-4" />
              )}
              Get Mood Suggestions
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowMatrixView((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border
                ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              <Layers className="w-4 h-4" />
              {showMatrixView ? 'Hide Matrix' : 'Eisenhower Matrix'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchGroupedTasks}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border
                ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              {groupedLoading ? (
                <span className="w-4 h-4 border-2 border-transparent border-t-white animate-spin" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
              Auto-Group Tasks
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartFocusSession}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 border
                ${isDark ? 'border-amber-300/30 text-amber-200 hover:bg-amber-500/10' : 'border-amber-300 text-amber-700 hover:bg-amber-100'}`}
            >
              <Coffee className="w-4 h-4" />
              Start Focus Session
            </motion.button>
          </div>
        </motion.div>

        {breakSuggestion && (
          <GlassCard className={`p-4 mb-8 border ${isDark ? 'border-amber-300/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <Coffee className={isDark ? 'text-amber-300' : 'text-amber-700'} size={20} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                    You've been focused for {breakSuggestion.minutes ?? 'a while'} minutes.
                  </p>
                  <p className={`${isDark ? 'text-amber-100' : 'text-amber-800'} text-sm mt-1`}>
                    {breakSuggestion.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTakeBreak}
                  className={`${isDark ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-amber-600 text-white hover:bg-amber-500'} px-4 py-2 rounded-lg font-semibold text-sm transition-all`}
                >
                  Take Break
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSnoozeBreak}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm border transition-all
                    ${isDark ? 'border-amber-300/40 text-amber-100 hover:bg-amber-500/10' : 'border-amber-300 text-amber-700 hover:bg-amber-100'}`}
                >
                  Remind me later
                </motion.button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Mood Prompt */}
        {moodPromptVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-8 p-4 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold">Select today’s mood</p>
                <p className={isDark ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>We ask once per day to tailor recommendations.</p>
              </div>
              <div className="flex items-center gap-2">
                {[{ label: 'Happy', value: 'Happy', icon: '😊' }, { label: 'Neutral', value: 'Neutral', icon: '😐' }, { label: 'Stressed', value: 'Stressed', icon: '😖' }].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveMood(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 flex items-center gap-1
                      ${
                        todayMood === opt.value
                          ? isDark
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span>{opt.icon}</span>
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommended Section */}
        {recommendedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recommended for your energy level</h2>
              <span className="text-xs uppercase tracking-wide text-gray-400">AI ordered</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedTasks.map((task, idx) => (
                <GlassCard key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>#{idx + 1} • {task.priority || 'medium'}</p>
                      <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                    </div>
                    <Badge
                      variant={(() => {
                        const diff = (task.difficulty || '').toLowerCase();
                        if (diff === 'hard') return 'danger';
                        if (diff === 'easy') return 'success';
                        return 'warning';
                      })()}
                    >
                      {task.difficulty}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Clock className="w-4 h-4" />
                    <span>{task.time || task.estimatedTime || 30}m</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mood Recommendations */}
        {moodRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recommended for your mood</h2>
              <span className="text-xs uppercase tracking-wide text-gray-400">AI ordered</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moodRecommendations.map((task, idx) => (
                <GlassCard key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>#{idx + 1} • {task.priority || 'medium'}</p>
                      <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                    </div>
                    <Badge
                      variant={(() => {
                        const diff = (task.difficulty || '').toLowerCase();
                        if (diff === 'hard') return 'danger';
                        if (diff === 'easy') return 'success';
                        return 'warning';
                      })()}
                    >
                      {task.difficulty}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Clock className="w-4 h-4" />
                    <span>{task.time || task.estimatedTime || 30}m</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Auto-grouped tasks */}
        {groupedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Auto-grouped tasks</h2>
              <span className="text-xs uppercase tracking-wide text-gray-400">AI generated (on demand)</span>
            </div>
            <div className="space-y-3">
              {groupedTasks.map((group) => (
                <GlassCard key={group.name} className="p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.name]: !prev[group.name] }))}
                    className={`w-full flex items-center justify-between px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      {group.name}
                      <span className="text-xs text-gray-400">({group.tasks.length})</span>
                    </span>
                    {expandedGroups[group.name] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedGroups[group.name] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 space-y-3"
                      >
                        {group.tasks.map((task) => (
                          <div key={task._id || task.id} className={`p-3 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                                {task.description && (
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{task.description}</p>
                                )}
                              </div>
                              <Badge
                                variant={(() => {
                                  const diff = (task.difficulty || '').toLowerCase();
                                  if (diff === 'hard') return 'danger';
                                  if (diff === 'easy') return 'success';
                                  return 'warning';
                                })()}
                              >
                                {task.difficulty || 'Medium'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Create Task Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className={isDark ? 'text-violet-400' : 'text-indigo-600'} size={28} />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Task</h2>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Task Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-violet-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>

              {/* Task Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  placeholder="Add task details (optional)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows="2"
                  className={`w-full px-4 py-3 rounded-lg border transition-all resize-none focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-violet-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                ></textarea>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask({ ...newTask, category: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white focus:border-violet-500/50 focus:ring-violet-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  >
                    <option value="work" className={isDark ? 'bg-slate-900' : 'bg-white'}>Work</option>
                    <option value="personal" className={isDark ? 'bg-slate-900' : 'bg-white'}>Personal</option>
                    <option value="health" className={isDark ? 'bg-slate-900' : 'bg-white'}>Health</option>
                    <option value="learning" className={isDark ? 'bg-slate-900' : 'bg-white'}>Learning</option>
                    <option value="other" className={isDark ? 'bg-slate-900' : 'bg-white'}>Other</option>
                  </select>
                </div>

                {/* Estimated Time */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newTask.estimatedTime}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        estimatedTime: parseInt(e.target.value) || 30,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-violet-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>

                {/* Urgency (Eisenhower Matrix) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Urgency
                  </label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white focus:border-violet-500/50 focus:ring-violet-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  >
                    <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Select urgency</option>
                    <option value="High" className={isDark ? 'bg-slate-900' : 'bg-white'}>High</option>
                    <option value="Low" className={isDark ? 'bg-slate-900' : 'bg-white'}>Low</option>
                  </select>
                </div>

                {/* Importance (Eisenhower Matrix) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Importance
                  </label>
                  <select
                    value={newTask.importance}
                    onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-white/10 border-white/20 text-white focus:border-violet-500/50 focus:ring-violet-500/20'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  >
                    <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Select importance</option>
                    <option value="High" className={isDark ? 'bg-slate-900' : 'bg-white'}>High</option>
                    <option value="Low" className={isDark ? 'bg-slate-900' : 'bg-white'}>Low</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Task</span>
                </motion.button>
              </div>

              {/* Computed Priority Display */}
              {newTask.urgency && newTask.importance && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Priority (auto-computed):</span>
                  <Badge variant={computePriority(newTask.urgency, newTask.importance)}>
                    {computePriority(newTask.urgency, newTask.importance)}
                  </Badge>
                  <span className="text-xs text-gray-500 italic">Based on Urgency + Importance</span>
                </div>
              )}

              {/* Daily Top-3 toggle */}
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={newTask.isTopTask}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewTask({ ...newTask, isTopTask: checked });
                    }}
                  />
                  Mark as Today’s Focus (Top-3)
                </label>
                <span className="text-xs text-gray-500">Limit 3 per day</span>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Status Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-4"
        >
          {['all', 'todo', 'in-progress', 'completed', 'postponed'].map(
            (status, idx) => (
              <motion.button
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(status)}
                className={`
                  px-5 py-2.5 rounded-lg font-medium transition-all duration-300 capitalize
                  ${filterStatus === status
                    ? `bg-gradient-to-r ${statusColors[status]} border border-white/30`
                    : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                  }
                `}
              >
                {status.replace('-', ' ')}
              </motion.button>
            )
          )}
        </motion.div>

        {/* Time Quick Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          {[5, 10, 20].map((minutes) => (
            <motion.button
              key={minutes}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(minutes)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 transition-all duration-200
                ${timeFilter === minutes
                  ? isDark
                    ? 'bg-white/20 border-white/50 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-indigo-100 border-indigo-300 text-indigo-800 shadow-lg shadow-indigo-200'
                  : isDark
                    ? 'bg-white/5 border-white/20 text-gray-200 hover:bg-white/10'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}
              `}
            >
              <Clock className="w-4 h-4" />
              {minutes} min
            </motion.button>
          ))}
          {timeFilter && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200
                ${isDark ? 'border-white/20 text-gray-200 hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
            >
              Clear filter
            </motion.button>
          )}
          <span className="text-sm text-gray-400">
            Filters pending tasks at or under the selected minutes.
          </span>
          <label className="flex items-center gap-2 text-sm text-gray-300 ml-auto">
            <input type="checkbox" checked={surfaceQuickWins} onChange={(e) => setSurfaceQuickWins(e.target.checked)} />
            Surface Quick Wins at top
          </label>
        </motion.div>

        {/* Eisenhower Matrix View */}
        {showMatrixView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <GlassCard className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Eisenhower Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'UI', label: 'Urgent & Important', filter: (t) => t.urgency === 'High' && t.importance === 'High' },
                  { key: 'IN', label: 'Important, Not Urgent', filter: (t) => t.urgency === 'Low' && t.importance === 'High' },
                  { key: 'UN', label: 'Urgent, Not Important', filter: (t) => t.urgency === 'High' && t.importance === 'Low' },
                  { key: 'NN', label: 'Neither', filter: (t) => !(t.urgency === 'High' || t.urgency === 'Low') || !(t.importance === 'High' || t.importance === 'Low') },
                ].map((quad) => (
                  <div key={quad.key} className="p-4 rounded-lg border border-white/10 bg-white/5">
                    <p className="text-sm font-semibold text-gray-200 mb-3">{quad.label}</p>
                    <div className="space-y-2">
                      {filteredTasks.filter(quad.filter).map((task) => (
                        <div key={task._id} className={`flex items-center justify-between p-3 rounded border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</span>
                          <div className="flex items-center gap-2">
                            <select
                              value={task.urgency || ''}
                              onChange={(e) => handleUpdateTask(task._id, { urgency: e.target.value || null })}
                              className={`text-xs rounded px-2 py-1 ${isDark ? 'bg-transparent border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            >
                              <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Urgency</option>
                              <option value="High" className={isDark ? 'bg-slate-900' : 'bg-white'}>High</option>
                              <option value="Low" className={isDark ? 'bg-slate-900' : 'bg-white'}>Low</option>
                            </select>
                            <select
                              value={task.importance || ''}
                              onChange={(e) => handleUpdateTask(task._id, { importance: e.target.value || null })}
                              className={`text-xs rounded px-2 py-1 ${isDark ? 'bg-transparent border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                            >
                              <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Importance</option>
                              <option value="High" className={isDark ? 'bg-slate-900' : 'bg-white'}>High</option>
                              <option value="Low" className={isDark ? 'bg-slate-900' : 'bg-white'}>Low</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {filteredTasks.filter(quad.filter).length === 0 && (
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No tasks here yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Tasks Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap className="w-8 h-8 text-violet-500" />
              </motion.div>
            </motion.div>
          ) : timeFilteredTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard className="p-12">
                <EmptyState
                  icon={Brain}
                  title="No tasks found"
                  description={timeFilter
                    ? `No pending tasks fit within ${timeFilter} minutes`
                    : filterStatus === 'all'
                      ? 'Create your first task to get started!'
                      : `No ${filterStatus.replace('-', ' ')} tasks yet`}
                />
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {timeFilteredTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <GlassCard className="p-6 h-full hover:border-white/40">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <button
                        onClick={() => {
                          if (task.status === 'completed') {
                            handleUpdateTask(task._id, { status: 'todo' });
                          } else {
                            handleCompleteTask(task);
                          }
                        }}
                        className={`flex-shrink-0 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-semibold mb-2 ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(task)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                      >
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(task._id)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Tags & Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                      <Badge variant="primary" className="capitalize">
                        {task.category}
                      </Badge>
                      {task.difficulty && (
                        <Badge
                          variant={(() => {
                            const diff = task.difficulty.toLowerCase();
                            if (diff === 'easy') return 'success';
                            if (diff === 'hard') return 'danger';
                            return 'warning';
                          })()}
                        >
                          {task.difficulty}
                        </Badge>
                      )}
                      {(() => {
                        const postponeCount = task.postponeCount ?? task.postponedCount ?? 0;
                        if (postponeCount <= 0) return null;
                        const fatigue = postponeCount >= 3;
                        return (
                          <Badge variant={fatigue ? 'danger' : 'warning'}>
                            {fatigue ? 'Postponed (fatigue risk)' : 'Postponed'} • {postponeCount}
                          </Badge>
                        );
                      })()}
                      {/* Two-Minute Rule badge */}
                      {task.status === 'todo' && (Number(task.estimatedTime) || 0) <= 2 && (
                        <Badge variant="success">Quick Win – Do it now</Badge>
                      )}

                      {/* Daily Top-3 badge */}
                      {task.isTopTask && (
                        <Badge variant="warning">Today’s Focus</Badge>
                      )}
                      {(() => {
                        const postponeCount = task.postponeCount ?? task.postponedCount ?? 0;
                        const fatigue = postponeCount >= 3 || (task.difficulty || '').toLowerCase() === 'hard';
                        if (!fatigue) return null;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchSubtaskSuggestions(task)}
                            className={`px-3 py-1 text-xs rounded-lg border ${isDark ? 'border-blue-300/40 text-blue-200 hover:bg-blue-500/10' : 'border-blue-300 text-blue-700 hover:bg-blue-100'}`}
                          >
                            Suggest subtasks
                          </motion.button>
                        );
                      })()}
                    </div>

                    {/* Suggested subtasks panel */}
                    {subtaskSuggestions[task._id] && subtaskSuggestions[task._id].length > 0 && (
                      <div className="mt-2 p-3 rounded border border-white/10 bg-white/5">
                        <p className="text-xs text-gray-300 mb-2">AI Suggestions (review before adding):</p>
                        <ul className="space-y-1">
                          {subtaskSuggestions[task._id].map((st, idx) => (
                            <li key={idx} className="text-xs text-white">• {st}</li>
                          ))}
                        </ul>
                        <div className="mt-2 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addSuggestedSubtasks(task._id)}
                            className={`px-3 py-1 text-xs rounded-lg ${isDark ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
                          >
                            Add all as subtasks
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSubtaskSuggestions((prev) => ({ ...prev, [task._id]: [] }))}
                            className={`px-3 py-1 text-xs rounded-lg border ${isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                          >
                            Dismiss
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimatedTime}m</span>
                      </div>
                      {task.status !== 'completed' && (
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePostponeTask(task._id)}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-all duration-300
                              ${isDark ? 'border-white/20 text-amber-200 hover:bg-amber-500/10' : 'border-amber-300 text-amber-700 hover:bg-amber-100'}`}
                            title="Postpone / do later"
                          >
                            Postpone
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const start = new Date(); start.setHours(0,0,0,0);
                              handleUpdateTask(task._id, { isTopTask: !task.isTopTask, topTaskDate: !task.isTopTask ? start : null });
                            }}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-all duration-300 ${isDark ? 'border-white/20 text-violet-200 hover:bg-violet-500/10' : 'border-violet-300 text-violet-700 hover:bg-violet-100'}`}
                            title="Toggle Today’s Focus"
                          >
                            {task.isTopTask ? 'Unmark Focus' : 'Mark Focus'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleUpdateTask(task._id, {
                                status: 'in-progress',
                              })
                            }
                            className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all duration-300"
                            title="Start task"
                          >
                            <Play className="w-5 h-5" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Task Modal */}
        <AnimatePresence>
          {editModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closeEditModal}
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className={`max-w-2xl w-full p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-white/20' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Task</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{editModal.title}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeEditModal}
                    className={`px-3 py-1 text-sm rounded-lg border ${isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Close
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-violet-500/50 focus:ring-violet-500/20' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20'} focus:outline-none focus:ring-2`}
                    placeholder="Task title"
                  />
                  <input
                    type="number"
                    value={editForm.estimatedTime}
                    onChange={(e) => setEditForm({ ...editForm, estimatedTime: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-violet-500/50 focus:ring-violet-500/20' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20'} focus:outline-none focus:ring-2`}
                    placeholder="Estimated minutes"
                  />
                </div>

                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all mb-4 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-violet-500/50 focus:ring-violet-500/20' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20'} focus:outline-none focus:ring-2`}
                  placeholder="Description"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={`px-4 py-3 rounded-lg transition-all appearance-none cursor-pointer ${isDark ? 'bg-white/10 border border-white/20 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20' : 'bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                  >
                    <option value="work" className="bg-slate-900">Work</option>
                    <option value="personal" className="bg-slate-900">Personal</option>
                    <option value="health" className="bg-slate-900">Health</option>
                    <option value="learning" className="bg-slate-900">Learning</option>
                    <option value="other" className="bg-slate-900">Other</option>
                  </select>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className={`px-4 py-3 rounded-lg transition-all appearance-none cursor-pointer ${isDark ? 'bg-white/10 border border-white/20 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20' : 'bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                  >
                    <option value="" className="bg-slate-900">Difficulty (optional)</option>
                    <option value="Easy" className="bg-slate-900">Easy</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="Hard" className="bg-slate-900">Hard</option>
                  </select>
                  <select
                    value={editForm.urgency}
                    onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                    className={`px-4 py-3 rounded-lg transition-all appearance-none cursor-pointer ${isDark ? 'bg-white/10 border border-white/20 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20' : 'bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                  >
                    <option value="" className="bg-slate-900">Urgency (optional)</option>
                    <option value="High" className="bg-slate-900">High</option>
                    <option value="Low" className="bg-slate-900">Low</option>
                  </select>
                  <select
                    value={editForm.importance}
                    onChange={(e) => setEditForm({ ...editForm, importance: e.target.value })}
                    className={`px-4 py-3 rounded-lg transition-all appearance-none cursor-pointer ${isDark ? 'bg-white/10 border border-white/20 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20' : 'bg-white border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                  >
                    <option value="" className="bg-slate-900">Importance (optional)</option>
                    <option value="High" className="bg-slate-900">High</option>
                    <option value="Low" className="bg-slate-900">Low</option>
                  </select>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${isDark ? 'border-white/20 text-white bg-white/5' : 'border-gray-300 text-gray-800 bg-white'}`}>
                    <input
                      type="checkbox"
                      checked={editForm.isTopTask}
                      onChange={(e) => setEditForm({ ...editForm, isTopTask: e.target.checked })}
                    />
                    Mark as Today’s Focus
                  </label>
                </div>

                {/* Computed Priority Display */}
                {editForm.urgency && editForm.importance && (
                  <div className={`flex items-center gap-2 text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Priority (auto-computed):</span>
                    <Badge variant={computePriority(editForm.urgency, editForm.importance)}>
                      {computePriority(editForm.urgency, editForm.importance)}
                    </Badge>
                    <span className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Based on Urgency + Importance</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={editSaving}
                    onClick={saveEdit}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all ${editSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {editSaving ? 'Saving...' : 'Save changes'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeEditModal}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold border transition-all ${isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Input Modal */}
        <AnimatePresence>
          {completionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={cancelCompletion}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`max-w-md w-full p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-white/20' : 'bg-white border-gray-200'}`}
              >
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Complete Task
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {completionModal.title}
                </p>
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    How much time did you spend? (optional)
                  </label>
                  <input
                    type="number"
                    placeholder={`${completionModal.estimatedTime} min (estimated)`}
                    value={actualTimeInput}
                    onChange={(e) => setActualTimeInput(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${isDark ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-violet-500/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500'} focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-violet-500/20' : 'focus:ring-indigo-500/20'}`}
                  />
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Leave empty to use estimated time ({completionModal.estimatedTime} min)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmCompletion}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                  >
                    Complete Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelCompletion}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold border transition-all ${isDark ? 'border-white/20 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TaskManager;
