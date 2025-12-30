import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  User,
  LogOut,
  Settings,
  Zap,
  Target,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/store';

function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Lightbulb, label: 'Insights', path: '/insights' },
    { icon: Target, label: 'Productivity', path: '/productivity' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div 
      className={`w-72 backdrop-blur-md h-screen flex flex-col shadow-2xl ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'} border-r`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Section */}
      <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProAI</h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Productivity OS</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
                  ${isActive
                    ? isDark 
                      ? 'bg-gradient-to-r from-indigo-500/40 to-violet-500/40 border border-indigo-500/50 text-white'
                      : 'bg-gradient-to-r from-indigo-100 to-violet-100 border border-indigo-300 text-indigo-900'
                    : isDark
                      ? 'text-gray-300 hover:bg-white/10 border border-transparent hover:border-white/20'
                      : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <motion.button
          onClick={logout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
            border border-transparent transition-all duration-300 font-medium text-sm
            ${isDark 
              ? 'text-red-300 hover:bg-red-500/20 hover:border-red-500/50'
              : 'text-red-600 hover:bg-red-100 hover:border-red-300'
            }
          `}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Sidebar;
