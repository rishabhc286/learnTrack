import { Flame } from 'lucide-react';

export default function StreakDisplay({ streak = 0 }) {
  const flames = [];
  const displayCount = Math.min(streak, 7);
  for (let i = 0; i < displayCount; i++) {
    flames.push(
      <span key={i} className="text-2xl" role="img" aria-label="fire">
        🔥
      </span>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
        <Flame className="w-5 h-5 text-orange-500" />
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-orange-500 mb-1">{streak}</p>
        <p className="text-sm text-gray-500 mb-3">
          {streak === 1 ? 'day' : 'days'} in a row
        </p>
        <div className="flex justify-center gap-1 flex-wrap">
          {streak === 0 ? (
            <p className="text-sm text-gray-400">
              Log a session today to start your streak!
            </p>
          ) : (
            flames
          )}
          {streak > 7 && (
            <span className="text-sm text-gray-500 ml-1">
              +{streak - 7} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
