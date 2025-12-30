import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Eye, Clock, Palette, HelpCircle, LogOut, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/store';
import { GlassCard, Badge } from '../components/UI/UIComponents';

function Settings() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    emailDigest: true,
    taskReminders: true,
    soundEnabled: false,
    showMotivation: true,
  });
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLogout = () => {
    logout();
  };

  const settingGroups = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'text-blue-400',
      settings: [
        {
          id: 'notifications',
          label: 'Enable Notifications',
          description: 'Receive push notifications for tasks and insights',
        },
        {
          id: 'taskReminders',
          label: 'Task Reminders',
          description: 'Get reminders for upcoming tasks',
        },
        {
          id: 'emailDigest',
          label: 'Daily Email Digest',
          description: 'Receive a summary of your productivity',
        },
        {
          id: 'soundEnabled',
          label: 'Sound Effects',
          description: 'Play sounds for notifications',
        },
      ],
    },
    {
      title: 'Display',
      icon: Palette,
      color: 'text-violet-400',
      settings: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          description: 'Use dark theme throughout the app',
        },
        {
          id: 'showMotivation',
          label: 'Motivation Messages',
          description: 'Show inspiring messages and tips',
        },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-400">Customize your ProAI experience</p>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-cyan-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Account</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Email Address</p>
                <p className="text-white font-medium">{user?.email || 'Not set'}</p>
              </div>
              <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-white font-medium">Active</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings Groups */}
        {settingGroups.map((group, groupIdx) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + groupIdx * 0.1 }}
            className="mb-8"
          >
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <group.icon className={group.color} size={28} />
                <h2 className="text-2xl font-bold text-white">{group.title}</h2>
              </div>
              <div className="space-y-4">
                {group.settings.map((setting, idx) => (
                  <motion.div
                    key={setting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + groupIdx * 0.1 + idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{setting.label}</p>
                      <p className="text-sm text-gray-400 mt-1">{setting.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSetting(setting.id)}
                      className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                        settings[setting.id]
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          : 'bg-white/20'
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ x: settings[setting.id] ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full"
                      />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Help & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-yellow-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Help & Support</h2>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <span className="font-medium">Documentation</span>
                <span>→</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <span className="font-medium">Contact Support</span>
                <span>→</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <span className="font-medium">Report Issue</span>
                <span>→</span>
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="text-red-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-red-500/40 hover:border-red-500/60 text-red-300 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/60 hover:border-red-500/80 text-red-300 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-400 text-sm mt-12"
        >
          <p>ProAI v1.0.0</p>
          <p className="mt-2">© 2024 ProAI. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
