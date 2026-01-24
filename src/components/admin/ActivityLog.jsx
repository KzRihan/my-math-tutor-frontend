'use client';

import { cn } from '@/lib/utils';

export default function ActivityLog({ activities, className }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-primary-500 text-sm font-medium hover:text-primary-400 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-4 pb-4',
              index !== activities.length - 1 && 'border-b border-[var(--card-border)]'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">
                {activity.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-foreground-secondary">
                  {activity.user}
                </span>
                <span className="text-xs text-foreground-secondary">•</span>
                <span className="text-xs text-foreground-secondary">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
