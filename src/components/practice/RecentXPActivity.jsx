'use client';

import { useGetUserHistoryQuery } from '@/store/questionApi';
import { formatRelativeTime } from '@/lib/utils';
import { FaTrophy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

/**
 * RecentXPActivity Component
 * 
 * Displays recent XP activity from question answers
 */
export default function RecentXPActivity({ limit = 5 }) {
  const { data: history, isLoading } = useGetUserHistoryQuery(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent XP Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = history?.data || [];

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent XP Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary text-center py-4 text-sm">
            No XP activity yet. Start answering practice questions to earn XP!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent XP Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity._id || activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.isCorrect && activity.xpAwarded > 0
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : activity.isCorrect
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}
              >
                {activity.isCorrect && activity.xpAwarded > 0 ? (
                  <FaTrophy className="text-sm" />
                ) : activity.isCorrect ? (
                  <FaCheckCircle className="text-sm" />
                ) : (
                  <FaTimesCircle className="text-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.questionText || 'Practice Question'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.isCorrect && activity.xpAwarded > 0 && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      +{activity.xpAwarded} XP
                    </span>
                  )}
                  <span className="text-xs text-foreground-secondary">
                    {formatRelativeTime(activity.answeredAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

