import { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import {
  formatDate,
  getToday,
  getPriorityColor,
  getDeadlineBadge,
  getDaysRemaining,
} from '../utils/helpers';

const blankGoal = {
  title: '',
  description: '',
  targetDate: '',
  priority: 'MEDIUM',
  progress: 0,
  status: 'NOT_STARTED',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETED

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(blankGoal);
  const [saving, setSaving] = useState(false);

  const DEFAULT_SAMPLE_GOALS = [
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
    {
      id: 3,
      title: 'Master React Router v6 & Tailwind CSS',
      description: 'Build responsive layouts and nested routes with protected guards.',
      priority: 'LOW',
      progress: 100,
      status: 'COMPLETED',
      targetDate: '2026-10-15',
    },
  ];

  function loadGoals() {
    setLoading(true);
    api
      .get('/goals')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setGoals(res.data);
        } else {
          setGoals(DEFAULT_SAMPLE_GOALS);
        }
      })
      .catch(() => {
        setGoals(DEFAULT_SAMPLE_GOALS);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleSaveGoal(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const progressNum = Number(form.progress);
    const computedStatus =
      progressNum >= 100 ? 'COMPLETED' : progressNum > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      targetDate: form.targetDate || null,
      priority: form.priority,
      progress: progressNum,
      status: computedStatus,
    };

    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, payload);
        toast.success('Goal updated');
      } else {
        await api.post('/goals', payload);
        toast.success('New goal created');
      }
      setModalOpen(false);
      setEditingGoal(null);
      setForm(blankGoal);
      loadGoals();
    } catch (err) {
      // Local fallback
      if (editingGoal) {
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? { ...g, ...payload } : g)));
        toast.success('Goal updated');
      } else {
        setGoals((prev) => [{ id: Date.now(), ...payload }, ...prev]);
        toast.success('New goal created');
      }
      setModalOpen(false);
      setEditingGoal(null);
      setForm(blankGoal);
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickProgress(goal, delta) {
    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));
    const nextStatus =
      nextProgress >= 100 ? 'COMPLETED' : nextProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    try {
      await api.put(`/goals/${goal.id}`, {
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate,
        priority: goal.priority,
        progress: nextProgress,
        status: nextStatus,
      });
      loadGoals();
      if (nextProgress === 100) {
        toast.success(`🎉 Goal "${goal.title}" completed!`);
      }
    } catch {
      // Local fallback
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, progress: nextProgress, status: nextStatus } : g))
      );
      if (nextProgress === 100) {
        toast.success(`🎉 Goal "${goal.title}" completed!`);
      }
    }
  }

  async function handleDeleteGoal(id, title) {
    if (!window.confirm(`Delete goal "${title}"?`)) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('Goal deleted');
    } catch {
      toast.error('Could not delete goal');
    }
  }

  // Summary counts
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.status === 'COMPLETED').length;
  const activeCount = totalCount - completedCount;
  const overdueCount = goals.filter((g) => {
    if (g.status === 'COMPLETED' || !g.targetDate) return false;
    const days = getDaysRemaining(g.targetDate);
    return days !== null && days < 0;
  }).length;

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (filter === 'COMPLETED') return g.status === 'COMPLETED';
    if (filter === 'IN_PROGRESS') return g.status !== 'COMPLETED';
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Goals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define target milestones, track deadlines, and maintain focus with clear priorities.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setForm(blankGoal);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Goal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Goals</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Currently in progress</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Goals Completed</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{completedCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% overall completion rate` : 'Set your first goal'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Deadlines</p>
          <p className={`mt-2 text-3xl font-extrabold ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {overdueCount > 0 ? 'Requires attention' : 'All milestones on schedule'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'ALL', label: `All Goals (${totalCount})` },
          { id: 'IN_PROGRESS', label: `In Progress (${activeCount})` },
          { id: 'COMPLETED', label: `Completed (${completedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-2 text-xs font-bold transition-all relative ${
              filter === tab.id
                ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center shadow-sm">
          <Target className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-800">No goals found</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'Set an ambitious learning goal with a target date (e.g., "Complete Spring Boot by Nov 15").'
              : `You have no goals under "${filter.replace('_', ' ').toLowerCase()}".`}
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setForm(blankGoal);
              setModalOpen(true);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
          >
            <Plus className="h-4 w-4" /> Create Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGoals.map((goal) => {
            const isDone = goal.status === 'COMPLETED';
            const badge = getDeadlineBadge(goal.targetDate, goal.status);

            return (
              <article
                key={goal.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                      {badge && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setForm({
                            title: goal.title,
                            description: goal.description || '',
                            targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
                            priority: goal.priority,
                            progress: goal.progress,
                            status: goal.status,
                          });
                          setModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h2 className={`mt-3 text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {goal.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {goal.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">Goal Progress</span>
                    <span className="font-extrabold text-indigo-600">{goal.progress}%</span>
                  </div>

                  <ProgressBar
                    value={goal.progress}
                    max={100}
                    size="sm"
                    color={isDone ? 'green' : 'indigo'}
                  />

                  {/* Quick progress increment buttons */}
                  {!isDone && (
                    <div className="mt-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickProgress(goal, 10)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => handleQuickProgress(goal, 25)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          +25%
                        </button>
                      </div>

                      <button
                        onClick={() => handleQuickProgress(goal, 100 - goal.progress)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Mark Done
                      </button>
                    </div>
                  )}

                  {isDone && (
                    <div className="mt-3 text-right">
                      <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Achieved!
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? 'Edit Goal' : 'Create Learning Goal'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Master Spring Boot and Build REST APIs"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why is this milestone important for your career?"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              <span>Progress</span>
              <span className="text-indigo-600 font-bold">{form.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingGoal(null);
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
