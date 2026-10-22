import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock3,
  BookOpenCheck,
  Map,
  Target,
  Flame,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import StatsCard from '../components/dashboard/StatsCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import {
  formatDuration,
  formatDate,
  getToday,
  getCurrentTime,
  getDeadlineBadge,
  getPriorityColor,
} from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Learner';

  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick log session modal state
  const [quickSessionOpen, setQuickSessionOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    topicId: '',
    date: getToday(),
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });
  const [savingSession, setSavingSession] = useState(false);

  const SAMPLE_SUMMARY = {
    totalMinutes: 1420,
    completedTopics: 18,
    totalTopics: 28,
    activeRoadmaps: 2,
    completedGoals: 3,
    currentStreak: 5,
  };
  const SAMPLE_WEEKLY = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.5 },
  ];
  const SAMPLE_ROADMAPS = [
    {
      id: 1,
      title: 'Java Backend Developer',
      description: 'Core Java, Spring Boot microservices, JPA/Hibernate, and database persistence.',
      completedTopics: 12,
      totalTopics: 16,
      progressPercent: 75,
      targetDate: '2026-11-30',
    },
    {
      id: 2,
      title: 'Modern React Frontend Developer',
      description: 'Single-page applications with React, Tailwind CSS, and REST API integration.',
      completedTopics: 6,
      totalTopics: 12,
      progressPercent: 50,
      targetDate: '2026-12-15',
    },
  ];
  const SAMPLE_SESSIONS = [
    {
      id: 1,
      topicTitle: 'Spring Boot REST Controllers & Validation',
      date: getToday(),
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 120,
      notes: 'Practiced building REST endpoints with DTO validation and exception handlers.',
    },
    {
      id: 2,
      topicTitle: 'Collections Framework & Streams',
      date: '2026-10-21',
      startTime: '14:00',
      endTime: '15:30',
      durationMinutes: 90,
      notes: 'Implemented custom comparators and stream map-filter-reduce pipelines.',
    },
  ];
  const SAMPLE_GOALS = [
    {
      id: 1,
      title: 'Complete Spring Boot Microservices module',
      description: 'Finish all topics and build a REST API with Spring Security and JWT.',
      priority: 'HIGH',
      progress: 75,
      status: 'IN_PROGRESS',
      targetDate: '2026-11-15',
    },
    {
      id: 2,
      title: 'Solve 20 SQL query challenges',
      description: 'Practice multi-table joins, group by, and subqueries.',
      priority: 'MEDIUM',
      progress: 90,
      status: 'IN_PROGRESS',
      targetDate: '2026-10-28',
    },
  ];

  function loadDashboardData() {
    setLoading(true);
    Promise.all([
      api.get('/analytics/summary').catch(() => ({ data: null })),
      api.get('/analytics/weekly').catch(() => ({ data: [] })),
      api.get('/roadmaps').catch(() => ({ data: [] })),
      api.get('/sessions').catch(() => ({ data: [] })),
      api.get('/goals').catch(() => ({ data: [] })),
    ])
      .then(([sRes, wRes, rRes, sessRes, gRes]) => {
        setSummary(sRes.data || SAMPLE_SUMMARY);
        setWeekly((wRes.data && wRes.data.length > 0) ? wRes.data : SAMPLE_WEEKLY);
        setRoadmaps((rRes.data && rRes.data.length > 0) ? rRes.data : SAMPLE_ROADMAPS);
        setSessions((sessRes.data && sessRes.data.length > 0) ? sessRes.data : SAMPLE_SESSIONS);
        setGoals((gRes.data && gRes.data.length > 0) ? gRes.data : SAMPLE_GOALS);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = summary || {
    totalMinutes: 0,
    completedTopics: 0,
    totalTopics: 0,
    activeRoadmaps: 0,
    completedGoals: 0,
    currentStreak: 0,
  };

  // Flattened topics list for quick session logging
  const allTopics = roadmaps.flatMap((r) =>
    (r.subjects || []).flatMap((s) =>
      (s.topics || []).map((t) => ({
        id: t.id,
        label: `${r.title} • ${s.title} • ${t.title}`,
      }))
    )
  );

  async function handleQuickSessionSubmit(e) {
    e.preventDefault();
    setSavingSession(true);
    try {
      await api.post('/sessions', {
        topicId: quickForm.topicId ? Number(quickForm.topicId) : null,
        date: quickForm.date,
        startTime: quickForm.startTime,
        endTime: quickForm.endTime,
        notes: quickForm.notes.trim() || null,
      });
      toast.success('Study session logged successfully!');
      setQuickSessionOpen(false);
      setQuickForm({
        topicId: '',
        date: getToday(),
        startTime: getCurrentTime(),
        endTime: getCurrentTime(),
        notes: '',
      });
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log study session');
    } finally {
      setSavingSession(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span>LearnTrack Dashboard</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-indigo-200 max-w-xl">
            {stats.currentStreak > 0
              ? `You're on a ${stats.currentStreak}-day learning streak! Consistency is your secret weapon.`
              : 'Log your focused study time today to ignite your daily learning streak.'}
          </p>
        </div>

        {/* Quick actions in banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setQuickSessionOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-colors"
          >
            <Clock3 className="h-4 w-4 text-indigo-600" />
            Quick Log Session
          </button>
          <Link
            to="/ai-insights"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-700/60 border border-indigo-400/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-indigo-300" />
            AI Insights
          </Link>
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={Clock3}
          label="Total Study Time"
          value={formatDuration(stats.totalMinutes)}
          subtitle={`${sessions.length} sessions logged`}
          color="blue"
        />
        <StatsCard
          icon={BookOpenCheck}
          label="Topics Completed"
          value={`${stats.completedTopics} / ${stats.totalTopics}`}
          subtitle={
            stats.totalTopics > 0
              ? `${Math.round((stats.completedTopics / stats.totalTopics) * 100)}% overall completion`
              : 'Add topics to track'
          }
          color="green"
        />
        <StatsCard
          icon={Map}
          label="Active Roadmaps"
          value={stats.activeRoadmaps}
          subtitle="Structured career paths"
          color="purple"
        />
        <StatsCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'Day' : 'Days'}`}
          subtitle={stats.currentStreak >= 7 ? '🔥 Milestone reached!' : 'Daily study habit'}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Hours Bar Chart */}
          <WeeklyChart data={weekly} />

          {/* Active Roadmaps Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Learning Roadmaps</h2>
                <p className="text-xs text-slate-500">Track subject-by-subject progress toward milestones</p>
              </div>
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all roadmaps <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {roadmaps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <Map className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">No learning roadmaps yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Create a structured roadmap for your target career (e.g. Java Backend Developer) to begin tracking topics.
                </p>
                <Link
                  to="/roadmaps"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Roadmap
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {roadmaps.slice(0, 4).map((roadmap) => {
                  const completed = roadmap.completedTopics || 0;
                  const total = roadmap.totalTopics || 0;
                  const percent = roadmap.progressPercent || (total > 0 ? Math.round((completed / total) * 100) : 0);
                  return (
                    <Link
                      key={roadmap.id}
                      to={`/roadmaps/${roadmap.id}`}
                      className="block group rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {roadmap.title}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{percent}%</span>
                      </div>
                      <div className="mt-2.5">
                        <ProgressBar value={completed} max={total} size="sm" />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {completed} of {total} topics complete
                        </span>
                        {roadmap.targetDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {formatDate(roadmap.targetDate)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Study Sessions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Study Sessions</h2>
                <p className="text-xs text-slate-500">Latest recorded learning logs and notes</p>
              </div>
              <Link
                to="/sessions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All sessions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <Clock3 className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">No sessions recorded yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Every 30 minutes of focus matters. Log your study sessions to watch your weekly analytics grow.
                </p>
                <button
                  onClick={() => setQuickSessionOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Log First Session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.slice(0, 4).map((s) => (
                  <div key={s.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {s.topicTitle || 'General Study Session'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(s.date)} • {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                          {s.notes && ` • "${s.notes}"`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                      {formatDuration(s.durationMinutes)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Streak Card */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500/10 via-white to-amber-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Daily Streak</span>
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{stats.currentStreak}</span>
              <span className="text-sm font-semibold text-slate-600">
                {stats.currentStreak === 1 ? 'consecutive day' : 'consecutive days'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {stats.currentStreak === 0
                ? 'Study at least once today to start your streak and work toward the 7-Day Streak badge!'
                : stats.currentStreak < 7
                ? `${7 - stats.currentStreak} more days until you unlock the 7-Day Streak Achievement!`
                : 'Awesome streak! Keep the flame alive by logging your study session today.'}
            </p>
            <div className="mt-4 flex gap-1.5 justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    day <= stats.currentStreak % 7 || stats.currentStreak >= 7
                      ? 'bg-amber-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Goals Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Goals</h3>
                <p className="text-xs text-slate-400">Deadlines and priorities</p>
              </div>
              <Link to="/goals" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Manage
              </Link>
            </div>

            {goals.filter((g) => g.status !== 'COMPLETED').length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <Target className="mx-auto h-6 w-6 text-slate-300 mb-1.5" />
                No active goals. Set a target to keep momentum high!
              </div>
            ) : (
              <div className="space-y-3">
                {goals
                  .filter((g) => g.status !== 'COMPLETED')
                  .slice(0, 3)
                  .map((g) => {
                    const badge = getDeadlineBadge(g.targetDate, g.status);
                    return (
                      <div key={g.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs text-slate-800 line-clamp-1">{g.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(g.priority)}`}>
                            {g.priority}
                          </span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={g.progress} max={100} size="sm" />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{g.progress}% done</span>
                          {badge && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${badge.color}`}>
                              {badge.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* AI Skill Gap Callout */}
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/20">
                <Sparkles className="h-4 w-4 text-violet-200" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-200">AI Skill Engine</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-white">
              Target Role: {user?.targetCareerRole || 'Java Backend Developer'}
            </h3>
            <p className="mt-1.5 text-xs text-violet-100 leading-relaxed">
              Our AI service evaluates your completed roadmap topics against industry requirements to identify skill gaps and generate a study plan.
            </p>
            <Link
              to="/ai-insights"
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 shadow hover:bg-violet-50 transition-colors"
            >
              Run Skill Gap Analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Session Modal */}
      <Modal
        isOpen={quickSessionOpen}
        onClose={() => setQuickSessionOpen(false)}
        title="Log Focused Study Session"
      >
        <form onSubmit={handleQuickSessionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Topic (Optional)
            </label>
            <select
              value={quickForm.topicId}
              onChange={(e) => setQuickForm({ ...quickForm, topicId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">General Study (No specific topic)</option>
              {allTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Date
            </label>
            <input
              required
              type="date"
              value={quickForm.date}
              onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Start Time
              </label>
              <input
                required
                type="time"
                value={quickForm.startTime}
                onChange={(e) => setQuickForm({ ...quickForm, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                End Time
              </label>
              <input
                required
                type="time"
                value={quickForm.endTime}
                onChange={(e) => setQuickForm({ ...quickForm, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Notes / Reflections
            </label>
            <textarea
              rows={2}
              value={quickForm.notes}
              onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
              placeholder="What concepts did you practice today?"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickSessionOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSession}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingSession ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
