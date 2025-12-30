import React from 'react';
import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { useUIStore, useAuthStore } from '../store/store';
import { motion } from 'framer-motion';

function Navbar({ toggleSidebar }) {
  const user = useAuthStore((state) => state.user);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.div 
      className={`${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-900'} backdrop-blur-md border-b sticky top-0 z-30`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side - Menu */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={`${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} p-2.5 rounded-lg transition-all duration-300`}
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:transition-all duration-300 ${isDark ? 'bg-white/10 border border-white/20 hover:bg-white/15' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'}`}>
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search tasks, insights..."
              className={`bg-transparent outline-none w-full text-sm ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
            />
          </div>
        </div>

        {/* Right Side - Actions & User */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`relative p-2.5 rounded-lg transition-all duration-300 ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-2.5 rounded-lg transition-all duration-300 ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Bell className="w-5 h-5" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full"
            />
          </motion.button>

          {/* User Profile */}
          {user && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${isDark ? 'bg-white/10 border border-white/20 hover:bg-white/15' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email?.split('@')[0]}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Navbar;
