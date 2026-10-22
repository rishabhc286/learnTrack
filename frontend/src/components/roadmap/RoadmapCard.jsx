import { Link } from 'react-router-dom';
import { MapPin, Calendar, BookOpen } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import { formatDate } from '../../utils/helpers';

export default function RoadmapCard({ roadmap }) {
  const completedTopics = roadmap.completedTopics || 0;
  const totalTopics = roadmap.totalTopics || 0;
  const percentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <Link
      to={`/roadmaps/${roadmap.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <MapPin className="w-5 h-5 text-indigo-600" />
        </div>
        <span className="text-sm font-semibold text-indigo-600">
          {percentage}%
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {roadmap.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {roadmap.description || 'No description'}
      </p>
      <ProgressBar value={completedTopics} max={totalTopics} size="sm" />
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {totalTopics} topics
        </span>
        {roadmap.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(roadmap.targetDate)}
          </span>
        )}
      </div>
    </Link>
  );
}
