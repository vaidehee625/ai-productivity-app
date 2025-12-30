// Global Design System & Theme Constants

export const colors = {
  primary: {
    light: '#6366f1', // indigo-500
    dark: '#818cf8',  // indigo-400
  },
  accent: {
    cyan: '#06b6d4',
    violet: '#a78bfa',
    pink: '#ec4899',
  },
  background: {
    light: '#ffffff',
    dark: '#0f172a', // slate-950
  },
  surface: {
    light: '#f8fafc', // slate-50
    dark: '#1e293b',  // slate-800
  },
  text: {
    primary: {
      light: '#1e293b',
      dark: '#f1f5f9',
    },
    secondary: {
      light: '#64748b',
      dark: '#cbd5e1',
    },
  },
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};
