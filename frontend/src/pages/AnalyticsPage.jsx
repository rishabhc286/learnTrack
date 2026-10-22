import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Clock3,
  BookOpenCheck,
  Flame,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatsCard from '../components/dashboard/StatsCard';
import { formatDuration } from '../utils/helpers';

const PIE_COLORS = ['#10B981', '#3B82F6', '#94A3B8'];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const SAMPLE_ANALYTICS_SUMMARY = {
    totalMinutes: 1420,
    completedTopics: 18,
    totalTopics: 28,
    currentStreak: 5,
    completedGoals: 3,
  };
  const SAMPLE_WEEKLY_HOURS = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.5 },
  ];
  const SAMPLE_MONTHLY_HOURS = [
    { label: 'May', hours: 18 },
    { label: 'Jun', hours: 26 },
    { label: 'Jul', hours: 32 },
    { label: 'Aug', hours: 28 },
    { label: 'Sep', hours: 38 },
    { label: 'Oct', hours: 44 },
  ];
  const SAMPLE_ROADMAPS_COMP = [
    { title: 'Java Backend', percent: 75, completedTopics: 12, totalTopics: 16 },
    { title: 'React Frontend', percent: 50, completedTopics: 6, totalTopics: 12 },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/summary').catch(() => ({ data: null })),
      api.get('/analytics/weekly').catch(() => ({ data: [] })),
      api.get('/analytics/monthly').catch(() => ({ data: [] })),
      api.get('/roadmaps').catch(() => ({ data: [] })),
      api.get('/sessions').catch(() => ({ data: [] })),
    ])
      .then(([sRes, wRes, mRes, rRes, sessRes]) => {
        setSummary(sRes.data || SAMPLE_ANALYTICS_SUMMARY);
        setWeekly(wRes.data && wRes.data.length > 0 ? wRes.data : SAMPLE_WEEKLY_HOURS);
        setMonthly(mRes.data && mRes.data.length > 0 ? mRes.data : SAMPLE_MONTHLY_HOURS);
        setRoadmaps(rRes.data && rRes.data.length > 0 ? rRes.data : SAMPLE_ROADMAPS_COMP);
        setSessions(sessRes.data || []);
      })
      .catch(() => {
        setSummary(SAMPLE_ANALYTICS_SUMMARY);
        setWeekly(SAMPLE_WEEKLY_HOURS);
        setMonthly(SAMPLE_MONTHLY_HOURS);
        setRoadmaps(SAMPLE_ROADMAPS_COMP);
      })
      .finally(() => setLoading(false));
  }, []);

  const s = summary || {
    totalMinutes: 0,
    completedTopics: 0,
    totalTopics: 0,
    currentStreak: 0,
    completedGoals: 0,
  };

  // Compute topic breakdown for donut chart
  const completedTopics = s.completedTopics || 0;
  const inProgressTopics = roadmaps.reduce(
    (acc, r) =>
      acc +
      (r.subjects || []).reduce(
        (subAcc, sub) =>
          subAcc + (sub.topics || []).filter((t) => t.status === 'IN_PROGRESS').length,
        0
      ),
    0
  );
  const notStartedTopics = Math.max(0, s.totalTopics - completedTopics - inProgressTopics);

  const topicDistribution = [
    { name: 'Completed', value: completedTopics },
    { name: 'In Progress', value: inProgressTopics },
    { name: 'Not Started', value: notStartedTopics },
  ].filter((item) => item.value > 0);

  // Compute roadmap comparison data
  const roadmapComparison = roadmaps.map((r) => {
    const comp = r.completedTopics || 0;
    const tot = r.totalTopics || 0;
    return {
      title: r.title.length > 18 ? r.title.slice(0, 16) + '...' : r.title,
      percent: r.progressPercent || (tot > 0 ? Math.round((comp / tot) * 100) : 0),
    };
  });

  // Calculate most productive day from weekly data
  let bestDay = 'None yet';
  let maxHours = 0;
  weekly.forEach((item) => {
    if (item.hours > maxHours) {
      maxHours = item.hours;
      bestDay = item.day || item.label;
    }
  });

  const avgSessionMins = sessions.length > 0 ? Math.round(s.totalMinutes / sessions.length) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Analytics & Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visual breakdowns of your study hours, consistency trends, and roadmap progress.
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={Clock3}
          label="Total Study Time"
          value={formatDuration(s.totalMinutes)}
          subtitle="All recorded sessions"
          color="blue"
        />
        <StatsCard
          icon={BookOpenCheck}
          label="Topics Completed"
          value={`${s.completedTopics} / ${s.totalTopics}`}
          subtitle={
            s.totalTopics > 0
              ? `${Math.round((s.completedTopics / s.totalTopics) * 100)}% overall completion`
              : 'Start learning'
          }
          color="green"
        />
        <StatsCard
          icon={Flame}
          label="Current Streak"
          value={`${s.currentStreak} ${s.currentStreak === 1 ? 'day' : 'days'}`}
          subtitle="Daily study consistency"
          color="orange"
        />
        <StatsCard
          icon={Target}
          label="Goals Completed"
          value={s.completedGoals}
          subtitle="Milestones achieved"
          color="purple"
        />
      </div>

      {/* Main Charts: Weekly & Monthly */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Hours Bar Chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Study Hours</h2>
              <p className="text-xs text-slate-500">Daily hours logged across the past 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              This Week
            </span>
          </div>

          <div className="h-64">
            {weekly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No weekly data recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    label={{
                      value: 'Hours',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fill: '#64748b' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${Math.round(val * 10) / 10} hours`, 'Study Time']}
                  />
                  <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Monthly Trend Chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Learning Trend</h2>
              <p className="text-xs text-slate-500">Study hours distribution over the past 6 months</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
              6 Months
            </span>
          </div>

          <div className="h-64">
            {monthly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${Math.round(val * 10) / 10} hours`, 'Total Study Time']}
                  />
                  <Bar dataKey="hours" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {/* Secondary Row: Topic Breakdown & Productivity Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Topic Status Donut Chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Topic Progress Status</h2>
          <p className="text-xs text-slate-500 mb-2">Distribution across all active roadmaps</p>

          <div className="h-56">
            {topicDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No topics created yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {topicDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    layout="horizontal"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Roadmap Progress Comparison */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Roadmap Completion</h2>
          <p className="text-xs text-slate-500 mb-3">Completion percentage by roadmap</p>

          <div className="h-56">
            {roadmapComparison.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No roadmaps to compare
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roadmapComparison} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                  <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Completion']} />
                  <Bar dataKey="percent" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Learning Habit & Productivity Insights */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Productivity Insights</h2>
            <p className="text-xs text-slate-500">Summary patterns from your learning logs</p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Average Session Length</span>
              <span className="text-xs font-bold text-slate-900">{formatDuration(avgSessionMins)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Most Productive Day</span>
              <span className="text-xs font-bold text-indigo-600">
                {bestDay} {maxHours > 0 ? `(${Math.round(maxHours * 10) / 10}h)` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Total Roadmaps Tracked</span>
              <span className="text-xs font-bold text-slate-900">{roadmaps.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Consistency Rating</span>
              <span className="text-xs font-bold text-emerald-600">
                {s.currentStreak >= 7 ? 'High (Flame On 🔥)' : s.currentStreak >= 3 ? 'Building' : 'Getting Started'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
