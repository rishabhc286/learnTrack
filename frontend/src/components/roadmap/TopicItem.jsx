import { useState } from 'react';
import {
  Circle,
  CircleDot,
  CheckCircle2,
  Trash2,
  Calendar,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor, getStatusLabel, getNextStatus, getPriorityColor } from '../../utils/helpers';

const statusIcons = {
  NOT_STARTED: Circle,
  IN_PROGRESS: CircleDot,
  COMPLETED: CheckCircle2,
};

const statusIconColors = {
  NOT_STARTED: 'text-gray-400 hover:text-blue-500',
  IN_PROGRESS: 'text-blue-500 hover:text-green-500',
  COMPLETED: 'text-green-500 hover:text-gray-400',
};

export default function TopicItem({ topic, onUpdate }) {
  const [showResources, setShowResources] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'ARTICLE' });

  const StatusIcon = statusIcons[topic.status] || Circle;

  async function handleToggleStatus() {
    const nextStatus = getNextStatus(topic.status);
    try {
      await api.patch(`/topics/${topic.id}/status`, { status: nextStatus });
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  }

  async function handleDeleteTopic() {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await api.delete(`/topics/${topic.id}`);
      toast.success('Topic deleted');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete topic');
    }
  }

  async function handleAddResource(e) {
    e.preventDefault();
    if (!resourceForm.title.trim()) return;
    try {
      await api.post(`/topics/${topic.id}/resources`, {
        title: resourceForm.title.trim(),
        url: resourceForm.url.trim(),
        type: resourceForm.type,
      });
      setResourceForm({ title: '', url: '', type: 'ARTICLE' });
      setAddingResource(false);
      toast.success('Resource added');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add resource');
    }
  }

  async function handleDeleteResource(resourceId) {
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    }
  }

  const resources = topic.resources || [];

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Status toggle */}
        <button
          onClick={handleToggleStatus}
          className={`flex-shrink-0 transition-colors ${statusIconColors[topic.status]}`}
          title={`Click to change to ${getStatusLabel(getNextStatus(topic.status))}`}
        >
          <StatusIcon className="w-5 h-5" />
        </button>

        {/* Title and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${
                topic.status === 'COMPLETED'
                  ? 'line-through text-gray-400'
                  : 'text-gray-900'
              }`}
            >
              {topic.title}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                topic.status
              )}`}
            >
              {getStatusLabel(topic.status)}
            </span>
            {topic.priority && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
                  topic.priority
                )}`}
              >
                {topic.priority}
              </span>
            )}
          </div>
          {topic.targetDate && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(topic.targetDate)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowResources(!showResources)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors relative"
            title="Resources"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            {resources.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {resources.length}
              </span>
            )}
          </button>
          <button
            onClick={handleDeleteTopic}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete topic"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Resources section */}
      {showResources && (
        <div className="mt-2 ml-8 space-y-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 truncate flex-1"
                >
                  {r.title}
                </a>
              ) : (
                <span className="truncate flex-1">{r.title}</span>
              )}
              <span className="text-xs text-gray-400">{r.type}</span>
              <button
                onClick={() => handleDeleteResource(r.id)}
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {addingResource ? (
            <form
              onSubmit={handleAddResource}
              className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <input
                type="text"
                value={resourceForm.title}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, title: e.target.value })
                }
                placeholder="Resource title"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <input
                type="url"
                value={resourceForm.url}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, url: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <select
                  value={resourceForm.type}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, type: e.target.value })
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ARTICLE">Article</option>
                  <option value="VIDEO">Video</option>
                  <option value="COURSE">Course</option>
                  <option value="BOOK">Book</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setAddingResource(false)}
                  className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingResource(true)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Plus className="w-3 h-3" />
              Add Resource
            </button>
          )}
        </div>
      )}
    </div>
  );
}
