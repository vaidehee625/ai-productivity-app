import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return colors[priority] || colors.medium;
};

export const getDifficultyColor = (difficulty) => {
  const normalized = (difficulty || '').toLowerCase();
  const colors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };
  return colors[normalized] || colors.medium;
};

export const getStatusIcon = (status) => {
  const icons = {
    todo: <AlertCircle className="w-4 h-4" />,
    'in-progress': <Clock className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    postponed: <Calendar className="w-4 h-4" />,
  };
  return icons[status] || icons.todo;
};

export const getStatusColor = (status) => {
  const colors = {
    todo: 'text-gray-500',
    'in-progress': 'text-blue-500',
    completed: 'text-green-500',
    postponed: 'text-orange-500',
  };
  return colors[status] || colors.todo;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateProductivityScore = (tasks) => {
  if (!tasks.length) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};
