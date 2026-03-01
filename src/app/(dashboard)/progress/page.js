'use client';

import { useGetUserProgressQuery } from '@/store/userApi';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

/**
 * Progress Page
 *
 * Displays the learner's core study progress without gamification metrics.
 */
export default function ProgressPage() {
  const { data: response, isLoading, error } = useGetUserProgressQuery();

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">Your Progress</h1>
          <p className="text-foreground-secondary">Track your learning journey</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="text-center animate-pulse">
              <CardContent className="py-6">
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Failed to load progress</h2>
          <p className="text-foreground-secondary mb-4">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progressData = response?.data;
  const stats = progressData?.stats || {};
  const enrollments = progressData?.enrollments || [];
  const weeklyStudyData = progressData?.weeklyStudyData || [];

  const weeklyTotal = weeklyStudyData.reduce((acc, day) => acc + (day.minutes || 0), 0);
  const activeDays = weeklyStudyData.filter((day) => (day.minutes || 0) > 0).length;
  const weeklyGoal = stats.weeklyGoal || 120;
  const weeklyProgress = stats.weeklyProgress || 0;
  const weeklyGoalPercent = weeklyGoal > 0 ? Math.min(100, (weeklyProgress / weeklyGoal) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">Your Progress</h1>
        <p className="text-foreground-secondary">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="py-6">
            <div className="text-4xl font-bold gradient-text">{stats.totalTopicsCompleted || 0}</div>
            <p className="text-foreground-secondary text-sm mt-1">Topics Mastered</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-6">
            <div className="text-4xl font-bold gradient-text">{stats.problemsSolved || 0}</div>
            <p className="text-foreground-secondary text-sm mt-1">Problems Solved</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-6">
            <div className="text-4xl font-bold gradient-text">{formatDuration(stats.totalMinutesLearned)}</div>
            <p className="text-foreground-secondary text-sm mt-1">Total Study Time</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-6">
            <div className="text-4xl font-bold gradient-text">{Math.round((stats.averageAccuracy || 0) * 100)}%</div>
            <p className="text-foreground-secondary text-sm mt-1">Average Accuracy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-40">
                {weeklyStudyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all"
                      style={{
                        height: `${Math.min((day.minutes / 60) * 100, 100)}%`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-foreground-secondary">{day.day}</span>
                    <span className="text-xs font-medium">{day.minutes}m</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex justify-between text-sm">
                <span className="text-foreground-secondary">
                  Total this week: <strong>{weeklyTotal} min</strong>
                </span>
                <span className="text-primary-500 font-medium">Goal: {weeklyGoal} min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <p>No topics enrolled yet.</p>
                  <p className="text-sm">Start learning to track your progress.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg">
                        {'📐'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{enrollment.topic?.title || 'Topic'}</span>
                          <span className="text-sm text-primary-500 font-semibold">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress / 100} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Weekly Goal Progress</span>
                  <span className="text-sm font-semibold">{Math.round(weeklyGoalPercent)}%</span>
                </div>
                <Progress value={weeklyGoalPercent / 100} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-xs text-foreground-secondary">Active Days</p>
                  <p className="text-xl font-bold">{activeDays}/7</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <p className="text-xs text-foreground-secondary">Today</p>
                  <p className="text-xl font-bold">{stats.todayMinutes || 0}m</p>
                </div>
              </div>
              <p className="text-xs text-foreground-secondary">
                Rank percentile: Top {100 - (stats.rankPercentile || 85)}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
