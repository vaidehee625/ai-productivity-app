import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, AlertCircle, Lightbulb, TrendingUp, Activity, Target, Sparkles } from 'lucide-react';
import API from '../utils/api';
import { GlassCard, Badge, EmptyState } from '../components/UI/UIComponents';
import { useUIStore } from '../store/store';

function AIInsights() {
  const [mood, setMood] = useState('neutral');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [suggestions, setSuggestions] = useState(null);
  const [fatigueAnalysis, setFatigueAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [groupedTasks, setGroupedTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayEnergy, setTodayEnergy] = useState(null);
  const [showEnergyPrompt, setShowEnergyPrompt] = useState(false);
  const [selectedTab, setSelectedTab] = useState('suggestions');

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const res = await API.get('/energy/today');
        if (res.data.energy) {
          setTodayEnergy(res.data.energy);
          setEnergyLevel(res.data.energy.toLowerCase());
        } else {
          setShowEnergyPrompt(true);
        }
      } catch (err) {
        console.error('Error fetching today energy', err);
      }
    };
    fetchEnergy();
  }, []);
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const saveEnergyForToday = async (level) => {
    try {
      const formatted = level === 'low' ? 'Low' : level === 'high' ? 'High' : 'Medium';
      await API.post('/energy', { energy: formatted });
      setTodayEnergy(formatted);
      setEnergyLevel(level);
      setShowEnergyPrompt(false);
    } catch (error) {
      console.error('Error saving energy:', error);
    }
  };

  const getEnergyBasedSuggestions = async () => {
    try {
      // If today’s energy isn’t saved yet, save the current selection first
      if (!todayEnergy) {
        await saveEnergyForToday(energyLevel);
      }
    } catch (e) {
      console.error('Failed to save today\'s energy:', e);
    }

    setLoading(true);
    try {
      const response = await API.post('/insights/energy-suggestions', {});
      setSuggestions(response.data.suggestions);
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) alert(msg);
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodBasedTasks = async () => {
    setLoading(true);
    try {
      const response = await API.post('/insights/mood-tasks', { mood });
      setSuggestions(response.data.recommendations);
      if (!response.data?.recommendations?.recommendedTasks?.length && !response.data?.recommendations?.moodTips) {
        // Provide a gentle hint if AI returns empty
        setSuggestions({ recommendedTasks: [], moodTips: 'No strong matches right now — pick a small, easy task to build momentum.' });
      }
    } catch (error) {
      const msg = error?.response?.data?.message;
      if (msg) alert(msg);
      console.error('Error getting mood-based tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFatigue = async () => {
    setLoading(true);
    try {
      const response = await API.get('/insights/fatigue-analysis');
      setFatigueAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing fatigue:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (force = false) => {
    setLoading(true);
    try {
      const response = await API.get('/stats/daily-summary', {
        params: force ? { force: true } : {},
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupTasks = async () => {
    setLoading(true);
    try {
      const response = await API.get('/stats/group-tasks');
      setGroupedTasks(response.data.groups);
    } catch (error) {
      console.error('Error grouping tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkload = async (force = false) => {
    setLoading(true);
    try {
      const response = await API.get('/ai/workload/tomorrow', {
        params: force ? { force: true } : {},
      });
      setWorkload(response.data);
    } catch (error) {
      console.error('Error getting workload prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const logMoodEnergy = async () => {
    try {
      await API.post('/insights/mood-energy', {
        mood,
        energyLevel,
        stressLevel: 5,
        motivationLevel: 5,
        focusLevel: 5,
      });
      alert('Mood and energy logged successfully!');
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {showEnergyPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Select today’s energy level</p>
                <p className={isDark ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>Asked once per day to personalize AI suggestions.</p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Low', value: 'low', icon: '😴' },
                  { label: 'Medium', value: 'medium', icon: '🙂' },
                  { label: 'High', value: 'high', icon: '⚡' },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveEnergyForToday(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 flex items-center gap-1
                      ${
                        energyLevel === option.value
                          ? isDark
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
            AI Analytics Hub
          </h1>
          <p className="text-gray-400">Personalized insights powered by artificial intelligence</p>
        </motion.div>

        {/* Mood & Energy Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Mood Card */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-cyan-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Mood Check</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">How are you feeling?</label>
              <div className="grid grid-cols-3 gap-3">
                {['happy', 'neutral', 'stressed'].map((m, idx) => (
                  <motion.button
                    key={m}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMood(m)}
                    className={`
                      py-3 rounded-lg font-medium transition-all duration-300
                      ${mood === m
                        ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 border border-cyan-500/50 text-white'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                      }
                    `}
                  >
                    {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : '😰'}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={getMoodBasedTasks}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Get Mood Tasks
              </motion.button>
            </div>
          </GlassCard>

          {/* Energy Card */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-violet-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Energy Level</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">Your energy right now</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map((e, idx) => (
                  <motion.button
                    key={e}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEnergyLevel(e)}
                    className={`
                      py-3 rounded-lg font-medium transition-all duration-300
                      ${energyLevel === e
                        ? 'bg-gradient-to-r from-violet-500/40 to-purple-500/40 border border-violet-500/50 text-white'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                      }
                    `}
                  >
                    {e === 'low' ? '🔋' : e === 'medium' ? '⚡' : '🚀'}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={getEnergyBasedSuggestions}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300"
              >
                Get Energy Tasks
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Log Mood Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logMoodEnergy}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Log Mood & Energy
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 mb-8">
            {['suggestions', 'fatigue', 'summary', 'workload', 'groups'].map((tab, idx) => (
              <motion.button
                key={tab}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => setSelectedTab(tab)}
                className={`
                  px-5 py-2.5 rounded-lg font-medium transition-all duration-300 capitalize
                  ${selectedTab === tab
                    ? 'bg-gradient-to-r from-indigo-500/40 to-violet-500/40 border border-indigo-500/50 text-white'
                    : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                  }
                `}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Suggestions Tab */}
            {selectedTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="text-indigo-400" size={28} />
                    <h3 className="text-2xl font-bold text-white">Recommendations</h3>
                  </div>
                  {suggestions ? (
                    <div className="space-y-4">
                      {suggestions.prioritizedTasks && (
                        <>
                          <div className="space-y-3">
                            {suggestions.prioritizedTasks.map((task, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-lg"
                              >
                                <p className="text-white">{task}</p>
                              </motion.div>
                            ))}
                          </div>
                          <div className="p-4 bg-white/10 border border-white/20 rounded-lg mt-4">
                            <p className="text-gray-300 text-sm">{suggestions.reasoning || suggestions.moodTips}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Lightbulb}
                      title="Select your mood and energy"
                      description="Click the buttons above to get personalized task recommendations"
                    />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Fatigue Tab */}
            {selectedTab === 'fatigue' && (
              <motion.div
                key="fatigue"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="text-red-400" size={28} />
                    <h3 className="text-2xl font-bold text-white">Fatigue Analysis</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={checkFatigue}
                    className="px-6 py-2.5 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
                  >
                    Analyze Fatigue
                  </motion.button>
                  {fatigueAnalysis && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-lg border ${
                        fatigueAnalysis.hasFatigue
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-green-500/10 border-green-500/30'
                      }`}>
                        <p className={`text-lg font-semibold ${
                          fatigueAnalysis.hasFatigue ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {fatigueAnalysis.hasFatigue ? '⚠️ Fatigue Detected' : '✅ You are fresh!'}
                        </p>
                        <p className="text-gray-300 mt-2">
                          Severity: <span className="font-semibold capitalize">{fatigueAnalysis.severity}</span>
                        </p>
                      </div>
                      <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                        <p className="text-gray-300">💡 {fatigueAnalysis.advice}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Summary Tab */}
            {selectedTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-cyan-400" size={28} />
                    <h3 className="text-2xl font-bold text-white">Daily Summary</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => generateSummary(false)}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      {summary ? 'Refresh summary' : 'Generate summary'}
                    </motion.button>
                    {summary && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateSummary(true)}
                        className="px-6 py-2.5 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-all"
                      >
                        Regenerate (once)
                      </motion.button>
                    )}
                  </div>
                  {summary && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                        <span>AI Daily Summary</span>
                        {summary.source && (
                          <Badge variant="primary" className="text-[11px] px-2 py-1">
                            {summary.source}
                          </Badge>
                        )}
                      </div>
                      <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg text-left space-y-4">
                        {summary.content
                          ?.split(/\n\s*\n/)
                          .filter(Boolean)
                          .map((para, idx) => (
                            <p key={idx} className="text-gray-200 text-sm leading-relaxed">{para.trim()}</p>
                          ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Workload Tab */}
            {selectedTab === 'workload' && (
              <motion.div
                key="workload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="text-emerald-400" size={28} />
                    <h3 className="text-2xl font-bold text-white">Tomorrow's Workload</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => getWorkload(false)}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
                    >
                      {workload ? 'Refresh prediction' : 'Predict workload'}
                    </motion.button>
                    {workload && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => getWorkload(true)}
                        className="px-6 py-2.5 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-all"
                      >
                        Regenerate (once)
                      </motion.button>
                    )}
                  </div>
                  {workload && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                        <span>Tomorrow's workload looks</span>
                        <Badge
                          variant={workload.prediction === 'Light' ? 'success' : workload.prediction === 'Heavy' ? 'danger' : 'warning'}
                          className="text-[11px] px-2 py-1"
                        >
                          {workload.prediction}
                        </Badge>
                        {workload.source && (
                          <Badge variant="primary" className="text-[11px] px-2 py-1">
                            {workload.source}
                          </Badge>
                        )}
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm leading-relaxed">
                        {workload.prediction === 'Light' && 'Plenty of breathing room tomorrow—tackle a meaningful task early and enjoy the slack.'}
                        {workload.prediction === 'Medium' && 'A balanced day ahead—plan blocks for the medium pieces and keep a quick win for momentum.'}
                        {workload.prediction === 'Heavy' && 'A heavy load is coming—prioritize the hardest items during your peak focus window and buffer some time.'}
                      </div>
                    </div>
                  )}
                  {!workload && (
                    <EmptyState
                      icon={Lightbulb}
                      title="No prediction yet"
                      description="Generate a workload forecast to see tomorrow's load as Light, Medium, or Heavy."
                    />
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Groups Tab */}
            {selectedTab === 'groups' && (
              <motion.div
                key="groups"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="p-8 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={groupTasks}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                  >
                    Group Tasks by Similarity
                  </motion.button>
                </GlassCard>
                {groupedTasks && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupedTasks.map((group, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <GlassCard className="p-6 h-full">
                          <h4 className="text-lg font-semibold text-white mb-4">{group.groupName}</h4>
                          <div className="space-y-2">
                            {group.tasks.map((task, tidx) => (
                              <div key={tidx} className="flex items-start gap-3 p-2 bg-white/5 rounded">
                                <div className="w-2 h-2 bg-violet-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <p className="text-gray-300 text-sm">{task}</p>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-8 h-8 text-violet-500" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AIInsights;
