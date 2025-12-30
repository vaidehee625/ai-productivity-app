import { motion } from 'framer-motion';
import { useUIStore } from '../../store/store';

// GlassCard - Base glassmorphic card component
export const GlassCard = ({ children, className = '', ...props }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl transition-all duration-300
        ${isDark
          ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 shadow-lg text-white'
          : 'bg-white border border-gray-200 hover:border-gray-300 shadow-md text-gray-900'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// StatCard - For displaying stats with icons
export const StatCard = ({ icon: Icon, label, value, trend, className = '' }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
          <Icon size={24} />
        </div>
      </div>
    </GlassCard>
  );
};

// PrimaryButton
export const PrimaryButton = ({ children, loading = false, ...props }) => (
  <button
    className={`
      px-6 py-2.5 rounded-lg font-medium
      bg-gradient-to-r from-indigo-500 to-violet-500
      text-white hover:shadow-lg hover:shadow-indigo-500/50
      transition-all duration-300 disabled:opacity-50
    `}
    disabled={loading}
    {...props}
  >
    {children}
  </button>
);

// SecondaryButton
export const SecondaryButton = ({ children, ...props }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');

  return (
    <button
      className={`
        px-6 py-2.5 rounded-lg font-medium transition-all duration-300
        ${isDark
          ? 'border border-white/20 text-gray-200 hover:bg-white/10'
          : 'border border-gray-300 text-gray-800 hover:bg-gray-100'}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Badge - For status/priority
export const Badge = ({ children, variant = 'primary' }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');
  const variants = {
    primary: isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    success: isDark ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200',
    warning: isDark ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: isDark ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// IconButton - For compact icon actions
export const IconButton = ({ Icon, onClick, className = '' }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');

  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-lg transition-all duration-300
        ${isDark ? 'hover:bg-white/10 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
        ${className}
      `}
    >
      <Icon size={20} />
    </button>
  );
};

// EmptyState - For empty lists
export const EmptyState = ({ icon: Icon, title, description }) => {
  const isDark = useUIStore((state) => state.theme === 'dark');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className={isDark ? 'p-4 bg-indigo-500/10 rounded-full mb-4' : 'p-4 bg-indigo-100 rounded-full mb-4'}>
        <Icon size={32} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
    </motion.div>
  );
};
