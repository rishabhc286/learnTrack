import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit3 } from 'lucide-react';
import TopicItem from './TopicItem';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SubjectSection({
  subject,
  roadmapId,
  onUpdate,
}) {
  const [expanded, setExpanded] = useState(true);
  const [addingTopic, setAddingTopic] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', priority: 'MEDIUM', targetDate: '' });
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subject.title);

  async function handleAddTopic(e) {
    e.preventDefault();
    if (!topicForm.title.trim()) return;
    try {
      await api.post(`/subjects/${subject.id}/topics`, {
        title: topicForm.title.trim(),
        priority: topicForm.priority,
        targetDate: topicForm.targetDate || null,
      });
      setTopicForm({ title: '', priority: 'MEDIUM', targetDate: '' });
      setAddingTopic(false);
      toast.success('Topic added');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add topic');
    }
  }

  async function handleDeleteSubject() {
    if (!window.confirm('Delete this subject and all its topics?')) return;
    try {
      await api.delete(`/subjects/${subject.id}`);
      toast.success('Subject deleted');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    }
  }

  async function handleEditSubject(e) {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await api.put(`/subjects/${subject.id}`, { title: editTitle.trim() });
      setEditing(false);
      toast.success('Subject updated');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subject');
    }
  }

  const topics = subject.topics || [];
  const completedCount = topics.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          {editing ? (
            <form onSubmit={handleEditSubject} className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                autoFocus
              />
              <button type="submit" className="text-xs text-indigo-600 hover:underline">Save</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(false); setEditTitle(subject.title); }} className="text-xs text-gray-500 hover:underline">Cancel</button>
            </form>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{subject.title}</span>
              <span className="text-xs text-gray-500 ml-2">
                {completedCount}/{topics.length} completed
              </span>
            </>
          )}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit subject"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setAddingTopic(true); setExpanded(true); }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Add topic"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteSubject(); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topics */}
      {expanded && (
        <div className="divide-y divide-gray-100">
          {topics.length === 0 && !addingTopic && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No topics yet. Click + to add one.
            </div>
          )}
          {topics.map((topic) => (
            <TopicItem key={topic.id} topic={topic} onUpdate={onUpdate} />
          ))}
          {addingTopic && (
            <form
              onSubmit={handleAddTopic}
              className="px-4 py-3 bg-indigo-50/50 space-y-2"
            >
              <input
                type="text"
                value={topicForm.title}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, title: e.target.value })
                }
                placeholder="Topic title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={topicForm.priority}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, priority: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <input
                  type="date"
                  value={topicForm.targetDate}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, targetDate: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddingTopic(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Add Topic
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
