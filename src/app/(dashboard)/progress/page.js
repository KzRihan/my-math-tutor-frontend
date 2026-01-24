'use client';

import { useGetUserProgressQuery } from '@/store/userApi';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

/**
 * Progress Page
 * 
 * Displays user's learning progress with real data from backend API.
 * Shows topic mastery, weekly activity, streak, and achievements.
 */
export default function ProgressPage() {
  const { data: response, isLoading, error } = useGetUserProgressQuery();

  // Format duration helper
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
            Your Progress 📊
          </h1>
          <p className="text-foreground-secondary">
            Track your learning journey and achievements
          </p>
        </div>
        
        {/* Loading skeleton */}
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
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse">
              <CardHeader><div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-32" /></CardHeader>
              <CardContent><div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded" /></CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-20 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mb-4" />
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mx-auto" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Failed to load progress</h2>
          <p className="text-foreground-secondary mb-4">
            Please check your connection and try again.
          </p>
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
  const user = progressData?.user || {};

  // Calculate weekly total
  const weeklyTotal = weeklyStudyData.reduce((acc, day) => acc + (day.minutes || 0), 0);

  // Static achievements (keeping as mock for now)
  const achievements = [
    { id: 'ach-1', title: 'First Steps', icon: '🎯', unlocked: stats.totalTopicsCompleted > 0 },
    { id: 'ach-2', title: 'Problem Solver', icon: '🧩', unlocked: stats.problemsSolved >= 100 },
    { id: 'ach-3', title: 'Week Warrior', icon: '🔥', unlocked: stats.currentStreak >= 7 },
    { id: 'ach-4', title: 'Math Master', icon: '🏆', unlocked: stats.totalTopicsCompleted >= 5 },
    { id: 'ach-5', title: 'Perfect Score', icon: '⭐', unlocked: stats.averageAccuracy >= 0.95 },
    { id: 'ach-6', title: 'Dedicated', icon: '📚', unlocked: stats.totalMinutesLearned >= 600 },
    { id: 'ach-7', title: 'XP Master', icon: '✨', unlocked: stats.xpPoints >= 1000 },
    { id: 'ach-8', title: 'Speed Demon', icon: '⚡', unlocked: false },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
          Your Progress 📊
        </h1>
        <p className="text-foreground-secondary">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center border-2 border-primary-500/20 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10">
          <CardContent className="py-6">
            <div className="text-4xl font-bold gradient-text">{stats.xpPoints?.toLocaleString() || 0}</div>
            <p className="text-foreground-secondary text-sm mt-1">Total XP Points</p>
          </CardContent>
        </Card>
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Activity */}
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
                        minHeight: '4px'
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
                <span className="text-primary-500 font-medium">
                  Goal: {stats.weeklyGoal || 120} min
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Topic Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-foreground-secondary">
                  <div className="text-4xl mb-3">📚</div>
                  <p>No topics enrolled yet.</p>
                  <p className="text-sm">Start learning to track your progress!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg">
                        📐
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{enrollment.topic?.title || 'Topic'}</span>
                          <span className="text-sm text-primary-500 font-semibold">
                            {enrollment.progress}%
                          </span>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rank Card */}
          <Card className="gradient-bg text-white">
            <CardContent className="py-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl mb-4">
                🏆
              </div>
              <h3 className="text-2xl font-bold mb-1">Level {stats.level || 1}</h3>
              <p className="text-white/80 text-sm mb-1">
                Top {100 - (stats.rankPercentile || 85)}% of learners
              </p>
              <p className="text-white/60 text-xs mb-4">
                {stats.xpPoints || 0} XP earned
              </p>
              <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  style={{ width: `${(stats.levelProgress || 0) * 100}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">
                {Math.round((stats.nextLevelXp || 1000) - (stats.xpPoints || 0))} XP to next level
              </p>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                      ach.unlocked
                        ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800'
                        : 'bg-neutral-100 dark:bg-neutral-800 opacity-50 grayscale'
                    }`}
                    title={ach.title}
                  >
                    {ach.icon}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-foreground-secondary mt-4">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
              </p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardContent className="py-6 text-center">
              <div className="text-5xl mb-3">🔥</div>
              <div className="text-3xl font-bold">{stats.currentStreak || 0} Days</div>
              <p className="text-foreground-secondary text-sm">Current Streak</p>
              <p className="text-xs text-foreground-secondary mt-2">
                Best: {stats.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
