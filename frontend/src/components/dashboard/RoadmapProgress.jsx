import { Link } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';

export default function RoadmapProgress({ roadmaps = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Roadmap Progress
        </h3>
        <Link
          to="/roadmaps"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All
        </Link>
      </div>
      {roadmaps.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p>No roadmaps yet.</p>
          <Link
            to="/roadmaps"
            className="text-sm text-indigo-600 hover:underline mt-1 inline-block"
          >
            Create your first roadmap
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.slice(0, 5).map((roadmap) => {
            const completedTopics = roadmap.completedTopics || 0;
            const totalTopics = roadmap.totalTopics || 0;
            return (
              <Link
                key={roadmap.id}
                to={`/roadmaps/${roadmap.id}`}
                className="block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {roadmap.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {completedTopics}/{totalTopics}
                  </span>
                </div>
                <ProgressBar
                  value={completedTopics}
                  max={totalTopics}
                  size="sm"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
