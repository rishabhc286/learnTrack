import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Sparkles,
  Save,
  LogOut,
  Flame,
  Clock3,
  BookOpenCheck,
  Map,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { formatDuration } from '../utils/helpers';

const PRESET_ROLES = [
  'Java Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Cloud Solutions Architect',
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [targetCareerRole, setTargetCareerRole] = useState(user?.targetCareerRole || '');
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetCareerRole(user.targetCareerRole || '');
    }
    api
      .get('/analytics/summary')
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/users/me', {
        name: name.trim(),
        targetCareerRole: targetCareerRole.trim() || null,
      });
      updateUser(res.data);
      toast.success('Profile preferences updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  const s = summary || {
    totalMinutes: 0,
    completedTopics: 0,
    activeRoadmaps: 0,
    currentStreak: 0,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Student Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account information, target specialization, and personal learning preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-2xl font-black text-white shadow-md shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Student Learner'}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                Target Role: {user?.targetCareerRole || 'Not set yet'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Hours</span>
            <p className="text-lg font-black text-slate-900">{formatDuration(s.totalMinutes)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Topics Done</span>
            <p className="text-lg font-black text-emerald-600">{s.completedTopics}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Roadmaps</span>
            <p className="text-lg font-black text-indigo-600">{s.activeRoadmaps}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Streak</span>
            <p className="text-lg font-black text-amber-500">🔥 {s.currentStreak}d</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Edit Profile & Target Role</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                required
                type="text"
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                disabled
                type="email"
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Used for secure JWT authentication</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Career Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                maxLength={100}
                value={targetCareerRole}
                onChange={(e) => setTargetCareerRole(e.target.value)}
                placeholder="e.g. Java Backend Developer"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Quick role preset pills */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 py-1">Quick Select:</span>
              {PRESET_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetCareerRole(role)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    targetCareerRole === role
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Team / Course Attribution Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">LearnTrack • Mini Project II (BCSJ 0962)</p>
        <p>Team No. 36: Rishabh Chaudhary, Akshit Jaiswal, Devesh Tiwari, Palak Khandelwal</p>
        <p className="text-[11px] text-slate-400 pt-1">
          Stack: Spring Boot (Java 17) • PostgreSQL • FastAPI (Python) • React 18 & Tailwind CSS
        </p>
      </div>
    </div>
  );
}
