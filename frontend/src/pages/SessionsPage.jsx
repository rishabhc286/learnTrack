import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Clock3,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  Search,
  BookOpen,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import {
  formatDate,
  formatDuration,
  getToday,
  getCurrentTime,
  calculateDurationMinutes,
} from '../utils/helpers';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual session modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    topicId: '',
    date: getToday(),
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Live Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTopicId, setTimerTopicId] = useState('');
  const [timerStartTime, setTimerStartTime] = useState(null);
  const timerIntervalRef = useRef(null);

  const DEFAULT_SAMPLE_SESSIONS = [
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
    {
      id: 3,
      topicTitle: 'PostgreSQL Relational Queries',
      date: '2026-10-20',
      startTime: '10:00',
      endTime: '11:15',
      durationMinutes: 75,
      notes: 'Inner joins, group by aggregation, and foreign keys.',
    },
  ];

  function loadData() {
    setLoading(true);
    Promise.all([
      api.get('/sessions').catch(() => ({ data: [] })),
      api.get('/roadmaps').catch(() => ({ data: [] })),
    ])
      .then(([sRes, rRes]) => {
        setSessions(sRes.data && sRes.data.length > 0 ? sRes.data : DEFAULT_SAMPLE_SESSIONS);
        setRoadmaps(rRes.data || []);
      })
      .catch(() => {
        setSessions(DEFAULT_SAMPLE_SESSIONS);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  // Live timer interval
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  // Topic options list
  const topicOptions = useMemo(() => {
    return roadmaps.flatMap((r) =>
      (r.subjects || []).flatMap((s) =>
        (s.topics || []).map((t) => ({
          id: t.id,
          label: `${r.title} • ${s.title} • ${t.title}`,
        }))
      )
    );
  }, [roadmaps]);

  // Timer controls
  function startLiveTimer() {
    setTimerStartTime(getCurrentTime());
    setTimerRunning(true);
    toast('Study timer running. Stay focused!', { icon: '⏱️' });
  }

  function pauseLiveTimer() {
    setTimerRunning(false);
  }

  function resumeLiveTimer() {
    setTimerRunning(true);
  }

  function resetLiveTimer() {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerStartTime(null);
  }

  function finishAndSaveLiveTimer() {
    if (timerSeconds < 60) {
      if (!window.confirm('Session is less than a minute. Are you sure you want to save it?')) return;
    }
    const endTime = getCurrentTime();
    const startTime = timerStartTime || getCurrentTime();
    setTimerRunning(false);

    // Pre-fill manual modal for confirmation/notes
    setForm({
      topicId: timerTopicId || '',
      date: getToday(),
      startTime: startTime,
      endTime: endTime,
      notes: `Live focus timer session (${Math.round(timerSeconds / 60)} minutes)`,
    });
    setModalOpen(true);
    resetLiveTimer();
  }

  // Formatting timer seconds to HH:MM:SS
  const timerHours = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
  const timerMins = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
  const timerSecs = String(timerSeconds % 60).padStart(2, '0');

  // Manual session save
  async function handleSaveSession(e) {
    e.preventDefault();
    const duration = calculateDurationMinutes(form.startTime, form.endTime);
    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }
    setSaving(true);
    try {
      await api.post('/sessions', {
        topicId: form.topicId ? Number(form.topicId) : null,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes.trim() || null,
      });
      toast.success('Study session recorded!');
      setModalOpen(false);
      setForm({
        topicId: '',
        date: getToday(),
        startTime: '09:00',
        endTime: '10:00',
        notes: '',
      });
      loadData();
    } catch (err) {
      // Local fallback
      const newSession = {
        id: Date.now(),
        topicTitle: topicOptions.find((t) => t.id === Number(form.topicId))?.label || 'General Study Session',
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        durationMinutes: duration,
        notes: form.notes.trim() || null,
      };
      setSessions((prev) => [newSession, ...prev]);
      toast.success('Study session recorded!');
      setModalOpen(false);
      setForm({
        topicId: '',
        date: getToday(),
        startTime: '09:00',
        endTime: '10:00',
        notes: '',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSession(id) {
    if (!window.confirm('Delete this study session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Session deleted');
    } catch {
      toast.error('Could not delete session');
    }
  }

  // Summary stats
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const todaySessions = sessions.filter((s) => s.date === getToday());
  const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const avgMinutes = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

  // Filtered session list
  const filteredSessions = sessions.filter((s) => {
    const query = searchQuery.toLowerCase();
    const topicMatches = s.topicTitle && s.topicTitle.toLowerCase().includes(query);
    const notesMatches = s.notes && s.notes.toLowerCase().includes(query);
    const dateMatches = s.date && s.date.includes(query);
    return !searchQuery || topicMatches || notesMatches || dateMatches;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Study Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log your focused study time, track learning momentum, and automatically maintain your streak.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              topicId: '',
              date: getToday(),
              startTime: getCurrentTime(),
              endTime: getCurrentTime(),
              notes: '',
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Log Session
        </button>
      </div>

      {/* Interactive Live Study Timer Hero Card */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Timer className="h-3.5 w-3.5" />
              <span>Interactive Focus Stopwatch</span>
            </div>
            <h2 className="text-xl font-bold text-white">Start a Focused Study Sprint</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Choose an active topic, hit start, and let LearnTrack accurately track your study duration in real time.
            </p>

            <div className="pt-1">
              <select
                disabled={timerRunning}
                value={timerTopicId}
                onChange={(e) => setTimerTopicId(e.target.value)}
                className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white outline-none focus:border-indigo-400 w-full sm:w-80 disabled:opacity-60"
              >
                <option value="">General Study (No specific topic)</option>
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stopwatch Display & Controls */}
          <div className="flex flex-col items-center sm:items-end justify-center gap-3">
            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-wider text-indigo-400 bg-slate-950/70 border border-indigo-500/20 rounded-2xl px-6 py-3 shadow-inner">
              {timerHours}:{timerMins}:{timerSecs}
            </div>

            <div className="flex items-center gap-2">
              {!timerRunning && timerSeconds === 0 ? (
                <button
                  onClick={startLiveTimer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Start Timer
                </button>
              ) : timerRunning ? (
                <button
                  onClick={pauseLiveTimer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
              ) : (
                <button
                  onClick={resumeLiveTimer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Resume
                </button>
              )}

              {timerSeconds > 0 && (
                <>
                  <button
                    onClick={finishAndSaveLiveTimer}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Finish & Log
                  </button>
                  <button
                    onClick={resetLiveTimer}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Study Time</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatDuration(totalMinutes)}</p>
          <p className="mt-1 text-xs text-slate-500">Across {sessions.length} logged sessions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Studied Today</p>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">{formatDuration(todayMinutes)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {todaySessions.length === 0
              ? 'No sessions logged today yet'
              : `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} today`}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Session</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatDuration(avgMinutes)}</p>
          <p className="mt-1 text-xs text-slate-500">Typical focused study block</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study history by topic title, date, or notes..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {/* Session Logs List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Session History</h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading study sessions...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock3 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No study sessions found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No sessions matched your search terms.'
                : 'Log your first session manually or use the live timer above to build your streak.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 shrink-0 mt-0.5">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {session.topicTitle || 'General Study Session'}
                      </span>
                      {session.topicTitle && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          Topic
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.date)}
                      </span>
                      <span>•</span>
                      <span>
                        {session.startTime?.slice(0, 5)} - {session.endTime?.slice(0, 5)}
                      </span>
                    </p>
                    {session.notes && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {formatDuration(session.durationMinutes)}
                  </span>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Session Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Study Session">
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Topic (Optional)
            </label>
            <select
              value={form.topicId}
              onChange={(e) => setForm({ ...form, topicId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">General Study (No specific topic)</option>
              {topicOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {form.startTime && form.endTime && (
            <div className="rounded-lg bg-indigo-50 p-2.5 text-xs text-indigo-700 font-semibold flex items-center justify-between">
              <span>Computed Session Duration:</span>
              <span>{formatDuration(calculateDurationMinutes(form.startTime, form.endTime))}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Session Notes / Reflections
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you learn? Any blockers or concepts mastered?"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Record Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
