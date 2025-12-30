import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Zap, Trophy, Target, Flame, TrendingUp, Edit2, Check, X } from 'lucide-react';
import API from '../utils/api';
import { useAuthStore, useUIStore } from '../store/store';
import { GlassCard, Badge, StatCard } from '../components/UI/UIComponents';

function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'UTC',
    theme: 'dark',
    dailyGoal: 5,
  });
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, streakRes, statsRes] = await Promise.all([
        API.get('/auth/profile'),
        API.get('/stats/streak'),
        API.get('/stats/daily-stats'),
      ]);
      setProfile(profileRes.data.user);
      setStreak(streakRes.data.streak);
      setStats(statsRes.data.stats);
      setFormData({
        name: profileRes.data.user.name,
        timezone: profileRes.data.user.timezone,
        theme: profileRes.data.user.theme,
        dailyGoal: profileRes.data.user.dailyGoal,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await API.put('/auth/profile', formData);
      setProfile(response.data.user);
      setUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-white'}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap className="w-8 h-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

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
            Personal Growth Dashboard
          </h1>
          <p className="text-gray-400">Track your progress and achievements</p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{profile?.name || 'User'}</h2>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(!editing)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {editing ? 'Cancel' : 'Edit Profile'}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        {streak && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <StatCard
                icon={Flame}
                label="Current Streak"
                value={streak.currentStreak}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
              <StatCard
                icon={Trophy}
                label="Longest Streak"
                value={streak.longestStreak}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <StatCard
                icon={Check}
                label="Tasks Completed"
                value={stats.tasksCompleted || 0}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
              <StatCard
                icon={TrendingUp}
                label="Productivity Score"
                value={`${stats.productivityScore || 0}%`}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Edit Profile Section */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="UTC" className="bg-slate-900">UTC</option>
                    <option value="EST" className="bg-slate-900">EST (UTC-5)</option>
                    <option value="CST" className="bg-slate-900">CST (UTC-6)</option>
                    <option value="MST" className="bg-slate-900">MST (UTC-7)</option>
                    <option value="PST" className="bg-slate-900">PST (UTC-8)</option>
                    <option value="IST" className="bg-slate-900">IST (UTC+5:30)</option>
                    <option value="JST" className="bg-slate-900">JST (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Daily Goal (Tasks)</label>
                  <input
                    type="number"
                    value={formData.dailyGoal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyGoal: parseInt(e.target.value) || 5,
                      })
                    }
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditing(false)}
                    className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Streak Progress */}
        {streak && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="p-8 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <Flame className="text-orange-400" size={32} />
                <h2 className="text-2xl font-bold text-white">Streak Progress</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-300">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-400">{streak.currentStreak} days</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((streak.currentStreak / 30) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">30 days = 🏆 Master streak!</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Personal Best</p>
                    <p className="text-2xl font-bold text-white">{streak.longestStreak}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Badges Earned</p>
                    <p className="text-2xl font-bold text-white">{streak.badges?.length || 0}</p>
                  </div>
                </div>

                {streak.badges && streak.badges.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-300 font-medium mb-3">Achievements</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {streak.badges.map((badge, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                          className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-center cursor-help"
                          title={badge.description}
                        >
                          <p className="text-3xl mb-1">{badge.icon}</p>
                          <p className="text-xs text-yellow-300 font-semibold">{badge.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-cyan-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Account Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Member Since</p>
                <p className="text-white font-semibold">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Last Updated</p>
                <p className="text-white font-semibold">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-white font-semibold">Active</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
