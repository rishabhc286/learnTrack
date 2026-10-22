/**
 * LearnTrack Helper Utilities
 */

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toInputDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHours(hours) {
  if (!hours || hours <= 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${Math.round(hours * 10) / 10}h`;
}

export function calculateDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const duration = (eh * 60 + em) - (sh * 60 + sm);
  return duration > 0 ? duration : 0;
}

export function getStatusColor(status) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'NOT_STARTED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not Started';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'EXPIRED':
      return 'Expired';
    default:
      return (status || '').replace(/_/g, ' ');
  }
}

export function getNextStatus(status) {
  switch (status) {
    case 'NOT_STARTED':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'COMPLETED';
    case 'COMPLETED':
      return 'NOT_STARTED';
    default:
      return 'NOT_STARTED';
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'LOW':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getSkillLevelBadge(level) {
  switch (level) {
    case 'STRONG':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Strong',
        score: 3,
      };
    case 'MODERATE':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: 'Moderate',
        score: 2,
      };
    case 'NEEDS_IMPROVEMENT':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Needs Improvement',
        score: 1,
      };
    case 'NOT_STARTED':
    default:
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Not Started',
        score: 0,
      };
  }
}

export function getDaysRemaining(targetDateStr) {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDeadlineBadge(targetDateStr, status) {
  if (status === 'COMPLETED') {
    return { text: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  const days = getDaysRemaining(targetDateStr);
  if (days === null) return null;
  if (days < 0) {
    return { text: `Overdue by ${Math.abs(days)}d`, color: 'bg-rose-100 text-rose-800 border-rose-200' };
  }
  if (days === 0) {
    return { text: 'Due Today', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (days === 1) {
    return { text: 'Due Tomorrow', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (days <= 7) {
    return { text: `${days} days left`, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  }
  return { text: `${days} days left`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
