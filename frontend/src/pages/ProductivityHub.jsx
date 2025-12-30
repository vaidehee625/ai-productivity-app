import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/store';
import { Clock, Play, Pause, RotateCcw, CheckCircle, BookOpen, Lightbulb } from 'lucide-react';
import api from '../utils/api';

const ProductivityHub = () => {
  const { isDark } = useAuthStore();
  const [activeTab, setActiveTab] = useState('techniques'); // techniques, timer, articles

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Productivity Hub
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Enhance your productivity with proven techniques, focus tools, and personalized insights
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <TabButton
            active={activeTab === 'techniques'}
            onClick={() => setActiveTab('techniques')}
            icon={BookOpen}
            label="Techniques"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'timer'}
            onClick={() => setActiveTab('timer')}
            icon={Clock}
            label="Focus Timer"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'articles'}
            onClick={() => setActiveTab('articles')}
            icon={Lightbulb}
            label="AI Articles"
            isDark={isDark}
          />
        </div>

        {/* Content Sections */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'techniques' && <TechniquesSection isDark={isDark} />}
          {activeTab === 'timer' && <PomodoroTimerSection isDark={isDark} />}
          {activeTab === 'articles' && <ArticlesSection isDark={isDark} />}
        </motion.div>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, isDark }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
      ${active
        ? isDark
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-blue-500 text-white shadow-lg'
        : isDark
        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        : 'bg-white text-gray-600 hover:bg-gray-100'
      }
    `}
  >
    <Icon className="text-lg" />
    <span>{label}</span>
  </button>
);

// ==================== SECTION A: PRODUCTIVITY TECHNIQUES ====================
const TechniquesSection = ({ isDark }) => {
  const techniques = [
    {
      name: 'Pomodoro Technique',
      description: 'Work in focused 25-minute intervals followed by 5-minute breaks to maintain peak concentration and avoid burnout.',
      howTo: 'Set a timer for 25 minutes, work without distractions, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.',
      icon: '🍅',
    },
    {
      name: 'Eisenhower Matrix',
      description: 'Prioritize tasks by urgency and importance to focus on what truly matters and eliminate time-wasters.',
      howTo: 'Divide tasks into four quadrants: Urgent & Important (do first), Important but not urgent (schedule), Urgent but not important (delegate), Neither (eliminate).',
      icon: '📊',
    },
    {
      name: 'Two-Minute Rule',
      description: 'If a task takes less than two minutes, do it immediately instead of adding it to your to-do list.',
      howTo: 'When a small task appears, ask: "Can I finish this in 2 minutes?" If yes, complete it right away to prevent task buildup.',
      icon: '⚡',
    },
    {
      name: 'Daily Top 3',
      description: 'Identify the three most important tasks each day to maintain focus and ensure meaningful progress.',
      howTo: 'Every morning, write down the 3 tasks that would make today successful. Complete these before anything else.',
      icon: '🎯',
    },
    {
      name: 'Task Breakdown',
      description: 'Divide large, overwhelming tasks into smaller, manageable subtasks to reduce procrastination and build momentum.',
      howTo: 'Take any big task and break it into 5-10 specific, actionable steps. Complete one step at a time.',
      icon: '🧩',
    },
    {
      name: 'Time Blocking',
      description: 'Schedule specific time slots for different types of work to create structure and minimize context switching.',
      howTo: 'Assign dedicated blocks of time (e.g., 9-11 AM for deep work, 2-3 PM for meetings) and treat them as unmovable appointments.',
      icon: '📅',
    },
  ];

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Proven Productivity Techniques
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((technique, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-6 rounded-lg shadow-md transition-all hover:shadow-lg
              ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}
            `}
          >
            <div className="text-4xl mb-3">{technique.icon}</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {technique.name}
            </h3>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {technique.description}
            </p>
            <div className={`text-xs p-3 rounded ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
              <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>How to use: </span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>{technique.howTo}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== SECTION B: POMODORO TIMER ====================
const PomodoroTimerSection = ({ isDark }) => {
  const [mode, setMode] = useState('classic'); // classic, custom, focus-only
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const intervalRef = useRef(null);

  // Update timer when mode/settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(workMinutes * 60);
      setIsWorkSession(true);
    }
  }, [workMinutes, isRunning]);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Session complete
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (isWorkSession) {
      // Work session just completed
      setSessionMinutes(workMinutes);
      if (mode !== 'focus-only') {
        // Switch to break
        setIsWorkSession(false);
        setTimeLeft(breakMinutes * 60);
        setIsRunning(true);
      } else {
        // Focus-only mode: prompt to log
        setShowCompletePrompt(true);
      }
    } else {
      // Break session completed, go back to work
      setIsWorkSession(true);
      setTimeLeft(workMinutes * 60);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(workMinutes * 60);
    setIsWorkSession(true);
    setShowCompletePrompt(false);
  };

  const handleLogFocusTime = async () => {
    try {
      await api.post('/productivity/focus/add', { minutes: sessionMinutes });
      setShowCompletePrompt(false);
      alert('Focused time logged successfully!');
      handleReset();
    } catch (error) {
      console.error('Error logging focus time:', error);
      alert('Failed to log focus time');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isWorkSession ? workMinutes * 60 : breakMinutes * 60) - timeLeft) / (isWorkSession ? workMinutes * 60 : breakMinutes * 60) * 100;

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Pomodoro Focus Timer
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer Display */}
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Mode Selector */}
            <div className="flex gap-2 mb-6">
              <ModeButton
                active={mode === 'classic'}
                onClick={() => { setMode('classic'); setWorkMinutes(25); setBreakMinutes(5); }}
                label="Classic (25/5)"
                isDark={isDark}
              />
              <ModeButton
                active={mode === 'custom'}
                onClick={() => setMode('custom')}
                label="Custom"
                isDark={isDark}
              />
              <ModeButton
                active={mode === 'focus-only'}
                onClick={() => { setMode('focus-only'); setBreakMinutes(0); }}
                label="Focus Only"
                isDark={isDark}
              />
            </div>

            {/* Custom Settings */}
            {mode === 'custom' && !isRunning && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Work Minutes (20-50)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="50"
                    value={workMinutes}
                    onChange={(e) => setWorkMinutes(Math.max(20, Math.min(50, parseInt(e.target.value) || 25)))}
                    className={`w-full px-3 py-2 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Break Minutes (5-10)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="10"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Math.max(5, Math.min(10, parseInt(e.target.value) || 5)))}
                    className={`w-full px-3 py-2 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  />
                </div>
              </div>
            )}

            {/* Timer Circle */}
            <div className="flex flex-col items-center justify-center my-8">
              <div className="relative w-64 h-64">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke={isDark ? '#374151' : '#E5E7EB'}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke={isWorkSession ? '#3B82F6' : '#10B981'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isWorkSession ? 'Work Session' : 'Break Time'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play size={20} /> Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause size={20} /> Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <RotateCcw size={20} /> Reset
              </button>
            </div>

            {/* Log Focus Time Prompt */}
            {showCompletePrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="text-green-500 text-2xl" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Great work! You completed {sessionMinutes} minutes of focused work.
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogFocusTime}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Log to Focused Time
                  </button>
                  <button
                    onClick={() => { setShowCompletePrompt(false); handleReset(); }}
                    className={`px-4 py-2 rounded transition-colors ${
                      isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Best Practices */}
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Best Practices
          </h3>
          <ul className="space-y-3">
            {[
              'Eliminate all distractions before starting',
              'Keep a notepad for random thoughts',
              'Stand up and move during breaks',
              'Hydrate between sessions',
              'Track your most productive hours',
              'Adjust intervals to match your focus span',
            ].map((tip, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="text-blue-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const ModeButton = ({ active, onClick, label, isDark }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded text-sm font-medium transition-all
      ${active
        ? 'bg-blue-600 text-white'
        : isDark
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }
    `}
  >
    {label}
  </button>
);

// ==================== SECTION C: AI PRODUCTIVITY ARTICLES ====================
const ArticlesSection = ({ isDark }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, []);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await api.get('/productivity/article');
      const payload = response?.data?.article || null;
      setArticle(payload);
      setLastFetchDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error fetching article:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastFetchDate === today && article?.source === 'ai') {
      alert('You can only generate one AI article per day. Check back tomorrow!');
      return;
    }
    fetchArticle();
  };

  const canRefresh = !lastFetchDate || lastFetchDate !== new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Today's Productivity Article
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading || !canRefresh}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${loading || !canRefresh
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          <RotateCcw className={loading ? 'animate-spin' : ''} size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`p-8 rounded-lg shadow-md text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Generating your personalized article...
          </p>
        </div>
      ) : article ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Source Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              article.source === 'ai'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {article.source === 'ai' ? '✨ AI Generated' : '📝 Fallback'}
            </span>
            {article.context && (
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Based on your {article.context.energyLevel} energy and {article.context.mood} mood
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </h3>

          {/* Content */}
          <div className={`prose max-w-none mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Takeaways */}
          {article.takeaways && article.takeaways.length > 0 && (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
              <h4 className={`font-semibold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                Key Takeaways:
              </h4>
              <ul className="space-y-2">
                {article.takeaways.map((takeaway, index) => (
                  <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : (
        <div className={`p-8 rounded-lg shadow-md text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No article available. Click Refresh to generate one!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductivityHub;
