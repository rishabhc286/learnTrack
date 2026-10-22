import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Trash2,
  Edit3,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import { formatDate, getToday, getDaysRemaining } from '../utils/helpers';

const STARTER_TEMPLATES = [
  {
    title: 'Java Backend Developer',
    description: 'Comprehensive industry path from Core Java to Spring Boot microservices and Docker.',
    targetWeeks: 16,
    subjects: [
      {
        title: 'Core Java Foundations',
        topics: ['OOP Principles & Classes', 'Collections Framework', 'Generics & Enums', 'Exception Handling', 'Streams & Lambdas'],
      },
      {
        title: 'Databases & Persistence',
        topics: ['Relational SQL & PostgreSQL', 'JDBC Fundamentals', 'Hibernate ORM', 'Spring Data JPA'],
      },
      {
        title: 'Spring Ecosystem',
        topics: ['Dependency Injection & Spring Core', 'Spring Boot 3 Web', 'RESTful API Design & Validation', 'Spring Security & JWT'],
      },
      {
        title: 'DevOps & Deployment',
        topics: ['Docker & Containerization', 'Maven Build Tool', 'Unit & Integration Testing (JUnit/Mockito)'],
      },
    ],
  },
  {
    title: 'Modern React Frontend Developer',
    description: 'Production-ready single-page application development with React, Tailwind, and REST APIs.',
    targetWeeks: 12,
    subjects: [
      {
        title: 'Frontend Fundamentals',
        topics: ['Semantic HTML5 & Accessibility', 'Modern CSS & Flexbox/Grid', 'Tailwind CSS Mastery'],
      },
      {
        title: 'JavaScript Mastery',
        topics: ['ES6+ Syntax & Modules', 'Async/Await & Promises', 'DOM & Fetch API'],
      },
      {
        title: 'React Core & Ecosystem',
        topics: ['Components, Props & State', 'Hooks (useState, useEffect, useMemo)', 'React Router v6', 'Context API & State Management', 'Axios & REST Integration'],
      },
    ],
  },
  {
    title: 'Full-Stack Web Engineering',
    description: 'Full-stack application development bridging Spring Boot, React, and cloud databases.',
    targetWeeks: 20,
    subjects: [
      {
        title: 'Frontend Client (React)',
        topics: ['UI Components & Tailwind', 'Client Routing & Protected Routes', 'State & Form Handling'],
      },
      {
        title: 'Backend Services (Spring Boot)',
        topics: ['Controller-Service-Repository Architecture', 'Spring Security JWT Authentication', 'PostgreSQL Data Modeling'],
      },
      {
        title: 'System Integration & AI',
        topics: ['REST API Documentation', 'FastAPI Microservice Integration', 'Cloud Deployment & CI/CD'],
      },
    ],
  },
];

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETED

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    targetDate: '',
  });
  const [saving, setSaving] = useState(false);

  const DEFAULT_SAMPLE_ROADMAPS = [
    {
      id: 1,
      title: 'Java Backend Developer',
      description: 'Comprehensive industry path from Core Java to Spring Boot microservices and Docker.',
      completedTopics: 12,
      totalTopics: 16,
      progressPercent: 75,
      targetDate: '2026-11-30',
    },
    {
      id: 2,
      title: 'Modern React Frontend Developer',
      description: 'Production-ready single-page application development with React, Tailwind, and REST APIs.',
      completedTopics: 6,
      totalTopics: 12,
      progressPercent: 50,
      targetDate: '2026-12-15',
    },
    {
      id: 3,
      title: 'Full-Stack Web Engineering',
      description: 'Full-stack application development bridging Spring Boot, React, and cloud databases.',
      completedTopics: 5,
      totalTopics: 15,
      progressPercent: 33,
      targetDate: '2027-01-20',
    },
  ];

  function loadRoadmaps() {
    setLoading(true);
    api
      .get('/roadmaps')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setRoadmaps(res.data);
        } else {
          setRoadmaps(DEFAULT_SAMPLE_ROADMAPS);
        }
      })
      .catch(() => {
        setRoadmaps(DEFAULT_SAMPLE_ROADMAPS);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoadmaps();
  }, []);

  async function handleSaveRoadmap(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      targetDate: form.targetDate || null,
    };
    try {
      if (editingRoadmap) {
        await api.put(`/roadmaps/${editingRoadmap.id}`, payload);
        toast.success('Roadmap updated');
      } else {
        await api.post('/roadmaps', payload);
        toast.success('Roadmap created');
      }
      setCreateModalOpen(false);
      setEditingRoadmap(null);
      setForm({ title: '', description: '', targetDate: '' });
      loadRoadmaps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save roadmap');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoadmap(id, title) {
    if (!window.confirm(`Delete roadmap "${title}" and all its subjects and topics?`)) return;
    try {
      await api.delete(`/roadmaps/${id}`);
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
      toast.success('Roadmap deleted');
    } catch {
      toast.error('Could not delete roadmap');
    }
  }

  async function handleApplyTemplate(template) {
    setSaving(true);
    try {
      const today = new Date();
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + template.targetWeeks * 7);

      // 1. Create roadmap
      const roadmapRes = await api.post('/roadmaps', {
        title: template.title,
        description: template.description,
        targetDate: targetDate.toISOString().split('T')[0],
      });
      const roadmapId = roadmapRes.data.id;

      // 2. Add subjects and topics sequentially
      for (const subject of template.subjects) {
        const subRes = await api.post(`/roadmaps/${roadmapId}/subjects`, {
          title: subject.title,
        });
        const subjectId = subRes.data.id;
        for (const topicTitle of subject.topics) {
          await api.post(`/subjects/${subjectId}/topics`, {
            title: topicTitle,
            priority: 'MEDIUM',
            targetDate: null,
          });
        }
      }

      toast.success(`"${template.title}" roadmap created with all topics!`);
      setTemplateModalOpen(false);
      loadRoadmaps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not instantiate starter template');
    } finally {
      setSaving(false);
    }
  }

  // Filter & search
  const filteredRoadmaps = roadmaps.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const isCompleted = r.totalTopics > 0 && r.completedTopics === r.totalTopics;
    if (filterStatus === 'COMPLETED') return matchesSearch && isCompleted;
    if (filterStatus === 'IN_PROGRESS') return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Roadmaps</h1>
          <p className="mt-1 text-sm text-slate-500">
            Structure your career progression into subjects, topics, and verified milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Starter Templates
          </button>
          <button
            onClick={() => {
              setEditingRoadmap(null);
              setForm({ title: '', description: '', targetDate: '' });
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Roadmap
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps by title or topic..."
            className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-9 pr-3.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Roadmaps' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmaps Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading your roadmaps...</div>
      ) : filteredRoadmaps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center shadow-sm">
          <Layers className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-800">
            {searchQuery ? 'No roadmaps matching your filter' : 'No learning roadmaps found'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search keywords or switching filter status.'
              : 'Create your first roadmap from scratch or kick off immediately using our curated starter templates.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Sparkles className="h-4 w-4" /> Browse Starter Templates
            </button>
            <button
              onClick={() => {
                setEditingRoadmap(null);
                setForm({ title: '', description: '', targetDate: '' });
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Create Custom Roadmap
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoadmaps.map((r) => {
            const completed = r.completedTopics || 0;
            const total = r.totalTopics || 0;
            const percent = r.progressPercent || (total > 0 ? Math.round((completed / total) * 100) : 0);
            const days = getDaysRemaining(r.targetDate);

            return (
              <article
                key={r.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BookOpen className="h-5 w-5" />
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingRoadmap(r);
                          setForm({
                            title: r.title,
                            description: r.description || '',
                            targetDate: r.targetDate ? r.targetDate.split('T')[0] : '',
                          });
                          setCreateModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit Roadmap"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoadmap(r.id, r.title)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Roadmap"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/roadmaps/${r.id}`} className="mt-3 block">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {r.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {r.description || 'No description provided.'}
                    </p>
                  </Link>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">
                      {completed} / {total} topics complete
                    </span>
                    <span className="font-bold text-indigo-600">{percent}%</span>
                  </div>

                  <ProgressBar value={completed} max={total} size="sm" />

                  <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400">
                    {r.targetDate ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {days !== null && days >= 0
                          ? `${days} days left`
                          : days !== null && days < 0
                          ? `Overdue by ${Math.abs(days)}d`
                          : formatDate(r.targetDate)}
                      </span>
                    ) : (
                      <span>No target date</span>
                    )}

                    <Link
                      to={`/roadmaps/${r.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Open Roadmap <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Custom Roadmap Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingRoadmap(null);
        }}
        title={editingRoadmap ? 'Edit Roadmap' : 'Create New Roadmap'}
      >
        <form onSubmit={handleSaveRoadmap} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Roadmap Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Java Backend Developer"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline the core objective of this learning path..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setEditingRoadmap(null);
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
              {saving ? 'Saving...' : editingRoadmap ? 'Update Roadmap' : 'Create Roadmap'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Starter Templates Modal */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Curated Starter Templates"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a pre-built industry roadmap. LearnTrack will automatically generate the subjects and topics so you can start logging progress immediately.
          </p>

          <div className="grid gap-3 sm:grid-cols-1">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.title}
                className="rounded-xl border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{tmpl.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {tmpl.targetWeeks} weeks
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{tmpl.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Includes {tmpl.subjects.length} subjects & {tmpl.subjects.reduce((acc, s) => acc + s.topics.length, 0)} structured topics
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {saving ? 'Creating...' : 'Use This Template'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
