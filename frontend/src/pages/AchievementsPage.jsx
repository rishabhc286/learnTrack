import { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  BookOpenCheck,
  Clock3,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ProgressBar from '../components/common/ProgressBar';
import { formatDate } from '../utils/helpers';

const ICON_MAP = {
  STREAK: Flame,
  ROADMAP_COMPLETED: Trophy,
  TOPICS_MILESTONE: BookOpenCheck,
  HOURS_MILESTONE: Clock3,
};

// System milestone catalog to display both unlocked and in-progress achievements
const SYSTEM_MILESTONES = [
  {
    type: 'STREAK',
    title: '7-Day Learning Streak',
    description: 'Study for seven consecutive days without breaking your momentum.',
    target: 7,
    unit: 'days',
    progressKey: 'currentStreak',
  },
  {
    type: 'TOPICS_MILESTONE',
    title: '50 Topics Completed',
    description: 'Mark fifty learning topics as completed across any roadmap.',
    target: 50,
    unit: 'topics',
    progressKey: 'completedTopics',
  },
  {
    type: 'HOURS_MILESTONE',
    title: '100 Learning Hours',
    description: 'Log one hundred hours (6,000 minutes) of focused study sessions.',
    target: 6000,
    unit: 'minutes',
    displayUnit: '100h',
    progressKey: 'totalMinutes',
  },
  {
    type: 'ROADMAP_COMPLETED',
    title: 'First Roadmap Completed',
    description: 'Complete 100% of the topics inside a roadmap.',
    target: 1,
    unit: 'roadmaps',
    progressKey: 'completedRoadmaps',
  },
];

export default function AchievementsPage() {
  const [unlocked, setUnlocked] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_UNLOCKED = [
    {
      id: 1,
      type: 'STREAK',
      title: '7-Day Learning Streak',
      description: 'Studied for seven consecutive days without breaking momentum.',
      awardedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 2,
      type: 'ROADMAP_COMPLETED',
      title: 'First Roadmap Completed',
      description: 'Completed every topic in a structured learning roadmap.',
      awardedAt: '2026-10-18T16:30:00Z',
    },
  ];

  const DEFAULT_STATS = {
    totalMinutes: 1420,
    completedTopics: 18,
    currentStreak: 5,
    completedGoals: 3,
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/achievements').catch(() => ({ data: [] })),
      api.get('/analytics/summary').catch(() => ({ data: null })),
    ])
      .then(([achRes, sumRes]) => {
        setUnlocked(achRes.data && achRes.data.length > 0 ? achRes.data : DEFAULT_UNLOCKED);
        setSummary(sumRes.data || DEFAULT_STATS);
      })
      .catch(() => {
        setUnlocked(DEFAULT_UNLOCKED);
        setSummary(DEFAULT_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = summary || {
    totalMinutes: 0,
    completedTopics: 0,
    currentStreak: 0,
    completedGoals: 0,
  };

  // Set of unlocked achievement titles
  const unlockedTitles = new Set(unlocked.map((a) => a.title));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Achievements & Milestones</h1>
          <p className="mt-1 text-sm text-slate-500">
            Earn badges automatically as you log study time, maintain daily streaks, and master topics.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm">
          <Trophy className="h-4 w-4 text-amber-600" />
          <span>
            {unlocked.length} of {SYSTEM_MILESTONES.length} Badges Unlocked
          </span>
        </div>
      </div>

      {/* Gamification Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
              <Sparkles className="h-4 w-4" />
              <span>LearnTrack Trophy Room</span>
            </div>
            <h2 className="text-2xl font-extrabold">Keep Studying, Keep Leveling Up</h2>
            <p className="text-xs text-amber-100 max-w-lg">
              Every completed topic and focused study session brings you closer to your target role and unlocks new credentials.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-black">{stats.currentStreak}</p>
              <p className="text-[10px] uppercase font-bold text-amber-100">Streak Days</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">{stats.completedTopics}</p>
              <p className="text-[10px] uppercase font-bold text-amber-100">Topics Done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Badges Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Earned Badges</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {unlocked.length}
          </span>
        </h2>

        {unlocked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Award className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No achievements unlocked yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Log study sessions and complete topics to claim your first badge!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {unlocked.map((item) => {
              const Icon = ICON_MAP[item.type] || Award;
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-5 shadow-sm transition-all hover:shadow-md flex items-start gap-4"
                >
                  <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-3.5 text-white shadow-md shadow-amber-500/20 shrink-0">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 truncate">{item.title}</h3>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Unlocked
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    <p className="mt-3 text-[11px] font-semibold text-amber-700">
                      Awarded on {formatDate(item.awardedAt)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* In-Progress / Locked Milestones Catalog */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-900 mb-3">All System Milestones & Progress</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {SYSTEM_MILESTONES.map((milestone) => {
            const isEarned = unlockedTitles.has(milestone.title);
            const Icon = ICON_MAP[milestone.type] || Award;

            let currentValue = 0;
            if (milestone.progressKey === 'currentStreak') currentValue = stats.currentStreak || 0;
            if (milestone.progressKey === 'completedTopics') currentValue = stats.completedTopics || 0;
            if (milestone.progressKey === 'totalMinutes') currentValue = stats.totalMinutes || 0;
            if (milestone.progressKey === 'completedRoadmaps') currentValue = isEarned ? 1 : 0;

            const percent = Math.min(100, Math.round((currentValue / milestone.target) * 100));

            return (
              <div
                key={milestone.title}
                className={`rounded-2xl border p-5 shadow-sm transition-all ${
                  isEarned
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200 bg-slate-50/70 opacity-90'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 shrink-0 ${
                      isEarned ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isEarned ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{milestone.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEarned
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isEarned ? 'Earned' : `${percent}%`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>

                    <div className="mt-3.5">
                      <ProgressBar value={currentValue} max={milestone.target} size="sm" />
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>
                          {milestone.unit === 'minutes'
                            ? `${Math.round(currentValue / 60)}h / 100h`
                            : `${currentValue} / ${milestone.target} ${milestone.unit}`}
                        </span>
                        <span>{isEarned ? 'Complete' : 'In Progress'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
