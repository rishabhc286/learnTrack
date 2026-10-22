import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock3,
  Layers,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import {
  formatDate,
  getToday,
  getCurrentTime,
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  getNextStatus,
} from '../utils/helpers';

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topicSearch, setTopicSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, NOT_STARTED, IN_PROGRESS, COMPLETED

  // Subject collapsed state tracking (map of subjectId -> boolean)
  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  // Modals state
  const [editRoadmapOpen, setEditRoadmapOpen] = useState(false);
  const [roadmapForm, setRoadmapForm] = useState({ title: '', description: '', targetDate: '' });

  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState('');

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({ title: '', priority: 'MEDIUM', targetDate: '' });

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'DOCUMENTATION' });

  // Quick study session modal for a specific topic
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    topicId: null,
    topicTitle: '',
    date: getToday(),
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const SAMPLE_DETAIL_ROADMAP = {
    id: Number(roadmapId) || 1,
    title: 'Java Backend Developer Roadmap',
    description: 'Comprehensive industry path from Core Java to Spring Boot microservices, JPA/Hibernate, and cloud deployment.',
    targetDate: '2026-11-30',
    totalTopics: 10,
    completedTopics: 6,
    progressPercent: 60,
    subjects: [
      {
        id: 101,
        title: 'Core Java Foundations',
        orderIndex: 1,
        topics: [
          {
            id: 1001,
            title: 'OOP Principles, Classes & Interfaces',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetDate: '2026-10-10',
            resources: [
              { id: 201, title: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', type: 'DOCUMENTATION' },
              { id: 202, title: 'Baeldung OOP Guide', url: 'https://www.baeldung.com/java-oop', type: 'ARTICLE' },
            ],
          },
          {
            id: 1002,
            title: 'Java Collections Framework & Generics',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetDate: '2026-10-15',
            resources: [
              { id: 203, title: 'Java Collections Tutorial', url: 'https://www.geeksforgeeks.org/collections-in-java-2/', type: 'ARTICLE' },
            ],
          },
          {
            id: 1003,
            title: 'Exception Handling & Custom Exceptions',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            targetDate: '2026-10-18',
            resources: [],
          },
          {
            id: 1004,
            title: 'Java Streams & Lambdas',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            targetDate: '2026-10-25',
            resources: [
              { id: 204, title: 'Modern Java Streams in Action', url: 'https://www.baeldung.com/java-8-streams', type: 'ARTICLE' },
            ],
          },
        ],
      },
      {
        id: 102,
        title: 'Spring Boot & Microservices',
        orderIndex: 2,
        topics: [
          {
            id: 1005,
            title: 'Dependency Injection & Spring Core',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetDate: '2026-10-20',
            resources: [],
          },
          {
            id: 1006,
            title: 'Spring Boot REST Controllers & Validation',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetDate: '2026-10-22',
            resources: [
              { id: 205, title: 'Building RESTful Web Services', url: 'https://spring.io/guides/gs/rest-service/', type: 'DOCUMENTATION' },
            ],
          },
          {
            id: 1007,
            title: 'Spring Data JPA & Hibernate ORM',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetDate: '2026-10-24',
            resources: [],
          },
          {
            id: 1008,
            title: 'Spring Security & JWT Authentication',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            targetDate: '2026-11-05',
            resources: [
              { id: 206, title: 'Spring Security Architecture', url: 'https://spring.io/projects/spring-security', type: 'DOCUMENTATION' },
            ],
          },
        ],
      },
      {
        id: 103,
        title: 'Databases & Testing',
        orderIndex: 3,
        topics: [
          {
            id: 1009,
            title: 'PostgreSQL Advanced Queries & Indexing',
            status: 'NOT_STARTED',
            priority: 'MEDIUM',
            targetDate: '2026-11-15',
            resources: [],
          },
          {
            id: 1010,
            title: 'JUnit 5 & Mockito Unit Testing',
            status: 'NOT_STARTED',
            priority: 'HIGH',
            targetDate: '2026-11-20',
            resources: [],
          },
        ],
      },
    ],
  };

  function loadRoadmap() {
    setLoading(true);
    api
      .get(`/roadmaps/${roadmapId}`)
      .then((res) => {
        setRoadmap(res.data);
      })
      .catch(() => {
        setRoadmap(SAMPLE_DETAIL_ROADMAP);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoadmap();
  }, [roadmapId]);

  // Expand / collapse helpers
  function toggleSubjectCollapse(subjectId) {
    setCollapsedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  }

  function expandAll() {
    setCollapsedSubjects({});
  }

  function collapseAll() {
    if (!roadmap) return;
    const collapsed = {};
    roadmap.subjects.forEach((s) => {
      collapsed[s.id] = true;
    });
    setCollapsedSubjects(collapsed);
  }

  // --- Roadmap Actions ---
  async function handleUpdateRoadmap(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/roadmaps/${roadmapId}`, {
        title: roadmapForm.title.trim(),
        description: roadmapForm.description.trim() || null,
        targetDate: roadmapForm.targetDate || null,
      });
      toast.success('Roadmap updated');
      setEditRoadmapOpen(false);
      loadRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update roadmap');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoadmap() {
    if (!window.confirm('Delete this entire roadmap and all its contents?')) return;
    try {
      await api.delete(`/roadmaps/${roadmapId}`);
      toast.success('Roadmap deleted');
      navigate('/roadmaps');
    } catch {
      toast.error('Could not delete roadmap');
    }
  }

  // --- Subject Actions ---
  async function handleSaveSubject(e) {
    e.preventDefault();
    if (!subjectTitle.trim()) return;
    setSaving(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, {
          title: subjectTitle.trim(),
          orderIndex: editingSubject.orderIndex || 0,
        });
        toast.success('Subject updated');
      } else {
        await api.post(`/roadmaps/${roadmapId}/subjects`, {
          title: subjectTitle.trim(),
        });
        toast.success('Subject added');
      }
      setAddSubjectOpen(false);
      setEditingSubject(null);
      setSubjectTitle('');
      loadRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save subject');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSubject(subjectId, title) {
    if (!window.confirm(`Delete subject "${title}" and all its topics?`)) return;
    try {
      await api.delete(`/subjects/${subjectId}`);
      toast.success('Subject deleted');
      loadRoadmap();
    } catch {
      toast.error('Could not delete subject');
    }
  }

  // --- Topic Actions ---
  async function handleSaveTopic(e) {
    e.preventDefault();
    if (!topicForm.title.trim()) return;
    setSaving(true);
    const payload = {
      title: topicForm.title.trim(),
      priority: topicForm.priority,
      targetDate: topicForm.targetDate || null,
    };
    try {
      if (editingTopic) {
        await api.put(`/topics/${editingTopic.id}`, {
          ...payload,
          status: editingTopic.status,
        });
        toast.success('Topic updated');
      } else {
        await api.post(`/subjects/${activeSubjectId}/topics`, payload);
        toast.success('Topic created');
      }
      setTopicModalOpen(false);
      setEditingTopic(null);
      setTopicForm({ title: '', priority: 'MEDIUM', targetDate: '' });
      loadRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save topic');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(topic) {
    const nextStatus = getNextStatus(topic.status);
    try {
      await api.patch(`/topics/${topic.id}/status`, { status: nextStatus });
      loadRoadmap();
    } catch (err) {
      // Interactive local state update so it works seamlessly offline
      setRoadmap((prev) => {
        if (!prev) return prev;
        const newSubjects = prev.subjects.map((sub) => ({
          ...sub,
          topics: sub.topics.map((t) => (t.id === topic.id ? { ...t, status: nextStatus } : t)),
        }));
        const allT = newSubjects.flatMap((s) => s.topics);
        const comp = allT.filter((t) => t.status === 'COMPLETED').length;
        const tot = allT.length;
        return {
          ...prev,
          subjects: newSubjects,
          completedTopics: comp,
          totalTopics: tot,
          progressPercent: tot > 0 ? Math.round((comp / tot) * 100) : 0,
        };
      });
    }
  }

  async function handleDeleteTopic(topicId, title) {
    if (!window.confirm(`Delete topic "${title}"?`)) return;
    try {
      await api.delete(`/topics/${topicId}`);
      toast.success('Topic deleted');
      loadRoadmap();
    } catch {
      toast.error('Could not delete topic');
    }
  }

  // --- Resource Actions ---
  async function handleSaveResource(e) {
    e.preventDefault();
    if (!resourceForm.title.trim()) return;
    setSaving(true);
    try {
      await api.post(`/topics/${activeTopicId}/resources`, {
        title: resourceForm.title.trim(),
        url: resourceForm.url.trim() || null,
        type: resourceForm.type,
      });
      toast.success('Resource added');
      setResourceModalOpen(false);
      setActiveTopicId(null);
      setResourceForm({ title: '', url: '', type: 'DOCUMENTATION' });
      loadRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add resource');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteResource(resourceId) {
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource removed');
      loadRoadmap();
    } catch {
      toast.error('Could not delete resource');
    }
  }

  // --- Quick Study Session ---
  function openSessionForTopic(topic) {
    setSessionForm({
      topicId: topic.id,
      topicTitle: topic.title,
      date: getToday(),
      startTime: getCurrentTime(),
      endTime: getCurrentTime(),
      notes: `Studied topic: ${topic.title}`,
    });
    setSessionModalOpen(true);
  }

  async function handleSaveSession(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/sessions', {
        topicId: sessionForm.topicId,
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        notes: sessionForm.notes.trim() || null,
      });
      toast.success(`Study session logged for "${sessionForm.topicTitle}"!`);
      setSessionModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not log session');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !roadmap) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
        <p className="text-sm text-slate-500">Loading roadmap details...</p>
      </div>
    );
  }

  const subjects = roadmap.subjects || [];
  const totalTopics = roadmap.totalTopics || 0;
  const completedTopics = roadmap.completedTopics || 0;
  const progressPercent =
    roadmap.progressPercent || (totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back button & Controls Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all roadmaps
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRoadmapForm({
                title: roadmap.title,
                description: roadmap.description || '',
                targetDate: roadmap.targetDate ? roadmap.targetDate.split('T')[0] : '',
              });
              setEditRoadmapOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Roadmap
          </button>
          <button
            onClick={handleDeleteRoadmap}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Roadmap Overview Hero Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>Roadmap View</span>
              {roadmap.targetDate && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3 w-3" /> Due {formatDate(roadmap.targetDate)}
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {roadmap.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
              {roadmap.description || 'No detailed description provided for this roadmap.'}
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSubject(null);
              setSubjectTitle('');
              setAddSubjectOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </button>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <span className="font-semibold text-slate-700">
              {completedTopics} of {totalTopics} topics completed
            </span>
            <span className="text-base font-extrabold text-indigo-600">{progressPercent}%</span>
          </div>
          <ProgressBar value={completedTopics} max={totalTopics} size="lg" />
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search topics by title..."
            className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1">
            {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'NOT_STARTED'
                  ? 'Not Started'
                  : st === 'IN_PROGRESS'
                  ? 'In Progress'
                  : 'Completed'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Expand all
            </button>
            <button
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {/* Subjects & Topics Hierarchy */}
      {subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 px-6 text-center shadow-sm">
          <Layers className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No subjects yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Break down this roadmap by adding core subjects (e.g. "Core Java", "Spring Boot", "Databases & SQL").
          </p>
          <button
            onClick={() => {
              setEditingSubject(null);
              setSubjectTitle('');
              setAddSubjectOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => {
            const isCollapsed = !!collapsedSubjects[subject.id];
            const allSubTopics = subject.topics || [];
            const subCompleted = allSubTopics.filter((t) => t.status === 'COMPLETED').length;
            const subTotal = allSubTopics.length;
            const subPercent = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

            // Apply filter and search to topics inside this subject
            const filteredTopics = allSubTopics.filter((t) => {
              const matchesSearch = t.title.toLowerCase().includes(topicSearch.toLowerCase());
              const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
              return matchesSearch && matchesStatus;
            });

            return (
              <section
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Subject Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50/70 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSubjectCollapse(subject.id)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 truncate">
                          {subject.title}
                        </h2>
                        <span className="text-xs font-semibold text-slate-500">
                          ({subCompleted}/{subTotal} complete • {subPercent}%)
                        </span>
                      </div>
                      <div className="mt-1.5 w-48 max-w-full">
                        <ProgressBar value={subCompleted} max={subTotal} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Subject Controls */}
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => {
                        setActiveSubjectId(subject.id);
                        setEditingTopic(null);
                        setTopicForm({ title: '', priority: 'MEDIUM', targetDate: '' });
                        setTopicModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                      title="Add Topic"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add Topic</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubject(subject);
                        setSubjectTitle(subject.title);
                        setAddSubjectOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title="Edit Subject"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id, subject.title)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Topics Container */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {filteredTopics.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {allSubTopics.length === 0
                          ? 'No topics in this subject yet. Click "+ Add Topic" to add one.'
                          : 'No topics match your current search/filter.'}
                      </div>
                    ) : (
                      filteredTopics.map((topic) => {
                        const isDone = topic.status === 'COMPLETED';
                        const inProgress = topic.status === 'IN_PROGRESS';
                        const resources = topic.resources || [];

                        return (
                          <div
                            key={topic.id}
                            className={`p-4 transition-colors hover:bg-slate-50/50 ${
                              isDone ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Left: Checkmark & Title */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleStatus(topic)}
                                  className={`shrink-0 transition-transform hover:scale-110 ${
                                    isDone
                                      ? 'text-emerald-600'
                                      : inProgress
                                      ? 'text-blue-600'
                                      : 'text-slate-300 hover:text-slate-400'
                                  }`}
                                  title={`Status: ${getStatusLabel(topic.status)}. Click to cycle.`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : inProgress ? (
                                    <CircleDot className="h-5 w-5" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-sm font-semibold truncate ${
                                        isDone
                                          ? 'line-through text-slate-400 font-normal'
                                          : 'text-slate-800'
                                      }`}
                                    >
                                      {topic.title}
                                    </span>

                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(
                                        topic.status
                                      )}`}
                                    >
                                      {getStatusLabel(topic.status)}
                                    </span>

                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(
                                        topic.priority
                                      )}`}
                                    >
                                      {topic.priority}
                                    </span>

                                    {topic.targetDate && (
                                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(topic.targetDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openSessionForTopic(topic)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                  title="Log Study Session for this Topic"
                                >
                                  <Clock3 className="h-3 w-3" />
                                  <span className="hidden md:inline">Log Study</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveTopicId(topic.id);
                                    setResourceForm({ title: '', url: '', type: 'DOCUMENTATION' });
                                    setResourceModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                  title="Add Resource"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="hidden md:inline">Resource</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveSubjectId(subject.id);
                                    setEditingTopic(topic);
                                    setTopicForm({
                                      title: topic.title,
                                      priority: topic.priority || 'MEDIUM',
                                      targetDate: topic.targetDate ? topic.targetDate.split('T')[0] : '',
                                    });
                                    setTopicModalOpen(true);
                                  }}
                                  className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                  title="Edit Topic"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteTopic(topic.id, topic.title)}
                                  className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Resources list attached to topic */}
                            {resources.length > 0 && (
                              <div className="mt-3 pl-8 flex flex-wrap gap-2">
                                {resources.map((res) => (
                                  <div
                                    key={res.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs text-slate-700"
                                  >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                      {res.type}
                                    </span>
                                    <span>•</span>
                                    {res.url ? (
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-slate-800 hover:text-indigo-600 inline-flex items-center gap-1 underline underline-offset-2"
                                      >
                                        {res.title}
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                      </a>
                                    ) : (
                                      <span className="font-medium text-slate-800">{res.title}</span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteResource(res.id)}
                                      className="ml-1 text-slate-400 hover:text-rose-600"
                                      title="Remove resource"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Edit Roadmap Modal */}
      <Modal
        isOpen={editRoadmapOpen}
        onClose={() => setEditRoadmapOpen(false)}
        title="Edit Roadmap Details"
      >
        <form onSubmit={handleUpdateRoadmap} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Roadmap Title
            </label>
            <input
              required
              type="text"
              value={roadmapForm.title}
              onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={roadmapForm.description}
              onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={roadmapForm.targetDate}
              onChange={(e) => setRoadmapForm({ ...roadmapForm, targetDate: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditRoadmapOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={addSubjectOpen}
        onClose={() => {
          setAddSubjectOpen(false);
          setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject Title' : 'Add Subject to Roadmap'}
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Subject Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={subjectTitle}
              onChange={(e) => setSubjectTitle(e.target.value)}
              placeholder="e.g. Core Java, Spring Boot, Databases"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setAddSubjectOpen(false);
                setEditingSubject(null);
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
              {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => {
          setTopicModalOpen(false);
          setEditingTopic(null);
        }}
        title={editingTopic ? 'Edit Topic' : 'Add Topic to Subject'}
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              placeholder="e.g. Java Collections Framework"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={topicForm.priority}
                onChange={(e) => setTopicForm({ ...topicForm, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={topicForm.targetDate}
                onChange={(e) => setTopicForm({ ...topicForm, targetDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setTopicModalOpen(false);
                setEditingTopic(null);
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
              {saving ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Resource Modal */}
      <Modal
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        title="Add Learning Resource to Topic"
      >
        <form onSubmit={handleSaveResource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              placeholder="e.g. Official Documentation, YouTube Tutorial, Baeldung Guide"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Resource URL (Optional)
            </label>
            <input
              type="url"
              value={resourceForm.url}
              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Resource Type
            </label>
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="DOCUMENTATION">Documentation</option>
              <option value="ARTICLE">Article / Tutorial</option>
              <option value="VIDEO">Video</option>
              <option value="COURSE">Course</option>
              <option value="BOOK">Book</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResourceModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Study Session Modal for this Topic */}
      <Modal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title={`Log Study Session for "${sessionForm.topicTitle}"`}
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Date
            </label>
            <input
              required
              type="date"
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
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
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
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
                value={sessionForm.endTime}
                onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={sessionForm.notes}
              onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSessionModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Study Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
