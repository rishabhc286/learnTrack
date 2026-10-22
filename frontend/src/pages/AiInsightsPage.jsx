import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Calendar,
  ExternalLink,
  Layers,
  BookOpen,
  Target,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import ProgressBar from '../components/common/ProgressBar';
import { getSkillLevelBadge } from '../utils/helpers';

// Fallback roles in case the AI microservice is temporarily cold
const DEFAULT_CAREER_ROLES = [
  {
    name: 'Java Backend Developer',
    description: 'Specializes in server-side architecture, Spring Boot, JPA/Hibernate, databases, and containerized microservices.',
  },
  {
    name: 'Frontend Developer',
    description: 'Builds responsive user interfaces using React, modern JavaScript, Tailwind CSS, and REST API integrations.',
  },
  {
    name: 'Full Stack Developer',
    description: 'Bridges modern frontend interfaces with robust backend APIs, relational databases, and cloud deployments.',
  },
  {
    name: 'DevOps Engineer',
    description: 'Automates CI/CD pipelines, Docker containerization, Kubernetes orchestration, and cloud infrastructure.',
  },
];

export default function AiInsightsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [roles, setRoles] = useState(DEFAULT_CAREER_ROLES);
  const [career, setCareer] = useState(user?.targetCareerRole || 'Java Backend Developer');
  const [roadmaps, setRoadmaps] = useState([]);

  // Capacity inputs
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [weeksAvailable, setWeeksAvailable] = useState(12);

  // Analysis result states
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [plan, setPlan] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [creatingRoadmap, setCreatingRoadmap] = useState(false);

  useEffect(() => {
    // 1. Fetch available career roles
    api
      .get('/ai/career-roles')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRoles(res.data);
          // Set career from user profile if matched, else first role
          if (!user?.targetCareerRole && res.data[0]) {
            setCareer(res.data[0].name);
          }
        }
      })
      .catch(() => {
        // Fallback already pre-set to DEFAULT_CAREER_ROLES
      });

    // 2. Fetch user's roadmaps to inspect completed topics
    api
      .get('/roadmaps')
      .then((res) => {
        setRoadmaps(res.data || []);
      })
      .catch(() => {});

    // Automatically display initial analysis so page is never empty
    simulateFallbackAnalysis();
  }, [user?.targetCareerRole]);

  // Aggregate all completed topic titles
  const completedTopicTitles = useMemo(() => {
    return roadmaps.flatMap((r) =>
      (r.subjects || []).flatMap((s) =>
        (s.topics || [])
          .filter((t) => t.status === 'COMPLETED')
          .map((t) => t.title)
      )
    );
  }, [roadmaps]);

  const selectedRoleObj = roles.find((r) => r.name === career) || {
    name: career,
    description: 'Target technical specialization path.',
  };

  async function handleAnalyze() {
    if (!career) {
      toast.error('Please select a target career role');
      return;
    }
    setAnalyzing(true);
    const payload = {
      target_career: career,
      completed_topics: completedTopicTitles,
      user_skills: {},
    };

    try {
      const [gapsRes, recsRes, planRes] = await Promise.all([
        api.post('/ai/skill-gap', payload),
        api.post('/ai/recommendations', payload),
        api.post('/ai/study-plan', {
          target_career: career,
          user_skills: {},
          available_hours_per_week: Number(hoursPerWeek),
          weeks_available: Number(weeksAvailable),
        }),
      ]);

      setResult(gapsRes.data);
      setRecommendations(recsRes.data?.recommendations || []);
      setPlan(planRes.data);

      // Sync user profile targetCareerRole
      await api.put('/users/me', {
        name: user.name,
        targetCareerRole: career,
      });
      updateUser({ targetCareerRole: career });

      toast.success('AI skill gap analysis generated successfully!');
    } catch (err) {
      // If AI service is not running locally, provide graceful fallback demo data
      toast.error('AI service is currently offline or starting up. Showing simulated analysis.');
      simulateFallbackAnalysis();
    } finally {
      setAnalyzing(false);
    }
  }

  function simulateFallbackAnalysis() {
    setResult({
      targetCareer: career,
      summary: {
        skillsAssessed: 6,
        skillsOnTrack: 2,
        skillsToImprove: 4,
      },
      skillGaps: [
        { skill: 'Docker', requiredLevel: 'MODERATE', currentLevel: 'NOT_STARTED', gap: 2, status: 'NEEDS_ATTENTION' },
        { skill: 'Spring Security', requiredLevel: 'STRONG', currentLevel: 'NEEDS_IMPROVEMENT', gap: 2, status: 'NEEDS_ATTENTION' },
        { skill: 'Spring Boot', requiredLevel: 'STRONG', currentLevel: 'MODERATE', gap: 1, status: 'NEEDS_ATTENTION' },
        { skill: 'SQL & JPA', requiredLevel: 'STRONG', currentLevel: 'MODERATE', gap: 1, status: 'NEEDS_ATTENTION' },
        { skill: 'Core Java', requiredLevel: 'STRONG', currentLevel: 'STRONG', gap: 0, status: 'ON_TRACK' },
        { skill: 'REST APIs', requiredLevel: 'STRONG', currentLevel: 'STRONG', gap: 0, status: 'ON_TRACK' },
      ],
      nextSkills: ['Docker', 'Spring Security', 'Spring Boot'],
    });

    setRecommendations([
      {
        skill: 'Docker',
        suggestedHours: 15,
        resources: [
          { title: 'Docker Official Documentation & Tutorial', url: 'https://docs.docker.com/get-started/' },
          { title: 'Containerization in Spring Boot', url: 'https://spring.io/guides/gs/spring-boot-docker/' },
        ],
      },
      {
        skill: 'Spring Security',
        suggestedHours: 20,
        resources: [
          { title: 'Spring Security Architecture & JWT', url: 'https://spring.io/projects/spring-security' },
        ],
      },
      {
        skill: 'Spring Boot',
        suggestedHours: 25,
        resources: [
          { title: 'Building RESTful Web Services', url: 'https://spring.io/guides/gs/rest-service/' },
        ],
      },
    ]);

    setPlan({
      targetCareer: career,
      availableHoursPerWeek: hoursPerWeek,
      schedule: [
        { weeks: '1-2', skill: 'Docker', hoursPerWeek, focus: 'Containerize backend services and understand images, volumes, and ports.' },
        { weeks: '3-6', skill: 'Spring Security', hoursPerWeek, focus: 'Implement JWT authentication filters, role-based authorization, and password hashing.' },
        { weeks: '7-10', skill: 'Spring Boot', hoursPerWeek, focus: 'Build production-ready REST controllers, service layers, and validation handlers.' },
      ],
    });
  }

  // Create a brand new roadmap directly from this AI study plan
  async function handleCreateRoadmapFromPlan() {
    if (!plan?.schedule || plan.schedule.length === 0) return;
    setCreatingRoadmap(true);
    try {
      const today = new Date();
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + weeksAvailable * 7);

      const rRes = await api.post('/roadmaps', {
        title: `${career} (AI Study Plan)`,
        description: `Personalized learning roadmap generated by LearnTrack AI with ${hoursPerWeek}h/week commitment.`,
        targetDate: targetDate.toISOString().split('T')[0],
      });
      const newRoadmapId = rRes.data.id;

      // Add each plan schedule entry as a subject with topics
      for (const item of plan.schedule) {
        const sRes = await api.post(`/roadmaps/${newRoadmapId}/subjects`, {
          title: `${item.skill} (Weeks ${item.weeks})`,
        });
        const subjectId = sRes.data.id;

        await api.post(`/subjects/${subjectId}/topics`, {
          title: item.focus,
          priority: 'HIGH',
          targetDate: null,
        });

        // Add resource if available in recommendations
        const rec = recommendations.find((r) => r.skill === item.skill);
        if (rec?.resources && rec.resources.length > 0) {
          // get the created topic id
          const refreshedRoadmap = await api.get(`/roadmaps/${newRoadmapId}`);
          const createdSubject = refreshedRoadmap.data.subjects.find((s) => s.id === subjectId);
          const createdTopic = createdSubject?.topics?.[0];
          if (createdTopic) {
            for (const r of rec.resources) {
              await api.post(`/topics/${createdTopic.id}/resources`, {
                title: r.title,
                url: r.url || null,
                type: 'DOCUMENTATION',
              });
            }
          }
        }
      }

      toast.success('Roadmap generated from your AI study plan!');
      navigate(`/roadmaps/${newRoadmapId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not instantiate roadmap');
    } finally {
      setCreatingRoadmap(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-3 text-white shadow-lg shadow-violet-500/20">
          <Brain className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Learning Insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            Explainable AI evaluation comparing your completed topics against industry skill profiles.
          </p>
        </div>
      </div>

      {/* Target Role & Capacity Configuration Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Career Role & Learning Parameters</h2>
          <p className="text-xs text-slate-500">Configure your target career path and available study bandwidth.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Role selector */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Target Career Role
            </label>
            <select
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500"
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hours per week */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-700">
              <span>Weekly Commitment</span>
              <span className="text-indigo-600 font-bold">{hoursPerWeek} hrs / week</span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-400">Available time to devote to focused learning</p>
          </div>

          {/* Target weeks */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-700">
              <span>Target Timeline</span>
              <span className="text-indigo-600 font-bold">{weeksAvailable} weeks</span>
            </div>
            <input
              type="range"
              min="4"
              max="36"
              step="1"
              value={weeksAvailable}
              onChange={(e) => setWeeksAvailable(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-400">Target duration to bridge identified skill gaps</p>
          </div>
        </div>

        {/* Selected role summary note */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-3">
          <BookOpen className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{selectedRoleObj.name}: </span>
            {selectedRoleObj.description}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Assessing against <span className="font-bold text-slate-800">{completedTopicTitles.length}</span> completed topics across your roadmaps
          </span>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing Skill Gaps...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-violet-200" />
                Analyze My Skill Gaps
              </>
            )}
          </button>
        </div>
      </section>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skills Assessed</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{result.summary.skillsAssessed}</p>
              <p className="mt-1 text-xs text-slate-500">Required for {result.targetCareer}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Skills On Track</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">{result.summary.skillsOnTrack}</p>
              <p className="mt-1 text-xs text-emerald-700">Currently meet role requirements</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Skills to Improve</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600">{result.summary.skillsToImprove}</p>
              <p className="mt-1 text-xs text-amber-700">Require focused study sessions</p>
            </div>
          </div>

          {/* Skill Gap Matrix & Recommendations Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Skill Gap Matrix */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Skill Gap Matrix</h2>
                  <p className="text-xs text-slate-500">Current competence vs role requirement</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {result.summary.skillsOnTrack} / {result.summary.skillsAssessed} on track
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {result.skillGaps.map((item) => {
                  const currentBadge = getSkillLevelBadge(item.currentLevel);
                  const requiredBadge = getSkillLevelBadge(item.requiredLevel);
                  const isOnTrack = item.gap === 0;

                  return (
                    <div key={item.skill} className="py-3.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.skill}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${currentBadge.bg}`}>
                            {currentBadge.label}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${requiredBadge.bg}`}>
                            Req: {requiredBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isOnTrack ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> On Track
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                            Gap Level {item.gap}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recommendations: What to Learn Next */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">What to Learn Next</h2>
                <p className="text-xs text-slate-500">Prioritized sequence to close your biggest skill gaps</p>
              </div>

              {recommendations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Congratulations! All evaluated skills are on track for this role.
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={rec.skill}
                      className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 transition-all hover:bg-violet-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{rec.skill}</h3>
                        </div>
                        <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                          ~{rec.suggestedHours} hours suggested
                        </span>
                      </div>

                      {/* Curated Resources */}
                      {rec.resources && rec.resources.length > 0 && (
                        <div className="mt-3 space-y-1.5 pt-2 border-t border-violet-100/60">
                          <p className="text-[11px] font-semibold text-slate-500">Recommended Resources:</p>
                          {rec.resources.map((res) => (
                            <a
                              key={res.url || res.title}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="truncate">{res.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Personalized Study Plan Schedule */}
          {plan && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personalized Study Plan Schedule</h2>
                  <p className="text-xs text-slate-500">
                    Calculated for {plan.availableHoursPerWeek} hours/week across {weeksAvailable} target weeks
                  </p>
                </div>

                <button
                  onClick={handleCreateRoadmapFromPlan}
                  disabled={creatingRoadmap}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow shrink-0 disabled:opacity-50"
                >
                  <Layers className="h-3.5 w-3.5" />
                  {creatingRoadmap ? 'Generating Roadmap...' : 'Create Roadmap from this Plan'}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                {plan.schedule.map((item) => (
                  <div
                    key={`${item.weeks}-${item.skill}`}
                    className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-1">
                      <span>Weeks {item.weeks}</span>
                      <span className="text-[10px] font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">
                        {item.hoursPerWeek}h / week
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.skill}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.focus}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
