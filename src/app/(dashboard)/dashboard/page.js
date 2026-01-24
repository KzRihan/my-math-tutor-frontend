'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress, { CircularProgress } from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import StreakPopupModal from '@/components/modals/StreakPopupModal';
import { useGetUserProgressQuery, useMarkStreakPopupDisplayedMutation } from '@/store/userApi';
import { useGetTopicStatsQuery } from '@/store/questionApi';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import RecentXPActivity from '@/components/practice/RecentXPActivity';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);

  // Fetch user progress data
  const { data: progressData, isLoading, error } = useGetUserProgressQuery(undefined, {
    skip: !user,
  });

  // Mutation to mark streak popup as displayed
  const [markStreakPopupDisplayed] = useMarkStreakPopupDisplayedMutation();

  // Show streak popup when shouldDisplay is true (only once per day)
  useEffect(() => {
    // Debug logging
    if (progressData?.data) {
      console.log('Dashboard Progress Data:', {
        streakPopup: progressData.data.streakPopup,
        streakInfo: progressData.data.streakInfo,
        shouldDisplay: progressData.data.streakPopup?.shouldDisplay,
        isDisplayed: progressData.data.streakPopup?.isDisplayed,
      });
    }

    if (progressData?.data?.streakPopup?.shouldDisplay && !showStreakPopup) {
      console.log('Showing streak popup!', progressData.data.streakInfo);
      setStreakInfo(progressData.data.streakInfo);
      setShowStreakPopup(true);
    }
  }, [progressData, showStreakPopup]);

  // Auto-close popup after 3-5 seconds and mark as displayed
  useEffect(() => {
    if (showStreakPopup && streakInfo) {
      // Random delay between 3-5 seconds (3000-5000ms)
      const delay = 3000 + Math.random() * 2000;
      
      const timer = setTimeout(async () => {
        // Mark as displayed in backend
        try {
          await markStreakPopupDisplayed().unwrap();
        } catch (error) {
          console.error('Failed to mark streak popup as displayed:', error);
        }
        // Close popup
        setShowStreakPopup(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [showStreakPopup, streakInfo, markStreakPopupDisplayed]);

  // Handle manual close - also mark as displayed
  const handleCloseStreakPopup = async () => {
    try {
      await markStreakPopupDisplayed().unwrap();
    } catch (error) {
      console.error('Failed to mark streak popup as displayed:', error);
    }
    setShowStreakPopup(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !progressData?.data) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-foreground-secondary">Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  const { user: userData, stats, enrollments, weeklyStudyData } = progressData.data;

  // Get recommended topics (active enrollments that are in progress)
  // If no active in-progress topics, show recently accessed active topics
  let recommendedTopics = enrollments
    .filter(e => e.status === 'active' && e.progress > 0 && e.progress < 100)
    .sort((a, b) => b.progress - a.progress);
  
  // Fallback: if no in-progress topics, show recently accessed active topics
  if (recommendedTopics.length === 0) {
    recommendedTopics = enrollments
      .filter(e => e.status === 'active')
      .sort((a, b) => {
        const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt) : new Date(0);
        const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt) : new Date(0);
        return dateB - dateA;
      });
  }
  
  recommendedTopics = recommendedTopics.slice(0, 3);

  // Get today's problems from stats (calculated from lesson progress)
  const todayProblems = stats?.todayProblems || 0;

  // Get day names for weekly progress
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayIndex = new Date().getDay();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Streak Popup Modal */}
      <StreakPopupModal
        isOpen={showStreakPopup}
        onClose={handleCloseStreakPopup}
        previousStreak={streakInfo?.previousStreak || 0}
        newStreak={streakInfo?.newStreak || 0}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">
            Welcome back, {userData?.firstName || user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-foreground-secondary mt-1">
            Ready to continue your math journey? You&apos;re on a{' '}
            <span className="text-primary-500 font-semibold">{stats?.currentStreak || 0} day streak</span>! 🔥
          </p>
        </div>
        <Link href="/solve">
          <Button size="lg">
            <span className="mr-2">🤖</span>
            Start Learning
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent>
            <p className="text-foreground-secondary text-sm mb-1">Today&apos;s Study</p>
            <p className="text-3xl font-bold">{stats?.todayMinutes || 0}m</p>
            <p className="text-xs text-foreground-secondary mt-1">
              {stats?.weeklyProgress || 0}/{stats?.weeklyGoal || 120}m weekly goal
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent>
            <p className="text-foreground-secondary text-sm mb-1">Problems Solved</p>
            <p className="text-3xl font-bold">{todayProblems}</p>
            <p className="text-xs text-foreground-secondary mt-1">
              {stats?.problemsSolved || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent>
            <p className="text-foreground-secondary text-sm mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{Math.round((stats?.averageAccuracy || 0) * 100)}%</p>
            <p className="text-xs text-foreground-secondary mt-1">
              Top {100 - (stats?.rankPercentile || 85)}% of learners
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent>
            <p className="text-foreground-secondary text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold">{stats?.currentStreak || 0} 🔥</p>
            <p className="text-xs text-foreground-secondary mt-1">
              Best: {stats?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <CircularProgress
                  value={stats?.weeklyProgress || 0}
                  max={stats?.weeklyGoal || 120}
                  size={100}
                  strokeWidth={10}
                />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.weeklyProgress || 0} / {stats?.weeklyGoal || 120} min
                  </p>
                  <p className="text-foreground-secondary text-sm">
                    {Math.max(0, (stats?.weeklyGoal || 120) - (stats?.weeklyProgress || 0))} minutes to reach your goal
                  </p>
                  <div className="flex gap-2 mt-3">
                    {dayNames.map((day, i) => {
                      const dayData = weeklyStudyData?.find(d => d.day === day);
                      const hasActivity = dayData && dayData.minutes > 0;
                      const isToday = i === currentDayIndex;
                      return (
                        <div
                          key={day}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${hasActivity || isToday
                              ? 'bg-primary-500 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
                            }`}
                          title={`${day}: ${dayData?.minutes || 0} min`}
                        >
                          {day[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue Learning */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Continue Learning</CardTitle>
              <Link href="/topics" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                View All →
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedTopics.length > 0 ? (
                  recommendedTopics.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/topics/${enrollment.topicId}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                        {enrollment.topic?.icon || '📚'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {enrollment.topic?.title || 'Topic'}
                          </h3>
                          <Badge variant="primary">{Math.round(enrollment.progress)}%</Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {enrollment.lessonsCompleted} / {enrollment.totalLessons} lessons completed
                        </p>
                      </div>
                      <div className="w-16">
                        <Progress value={enrollment.progress / 100} size="sm" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-foreground-secondary text-center py-8">
                    No topics in progress. <Link href="/topics" className="text-primary-500 hover:underline">Start learning!</Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/capture">
              <Card interactive className="h-full group">
                <CardContent className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    📸
                  </div>
                  <h3 className="font-semibold mb-1">Snap a Problem</h3>
                  <p className="text-sm text-foreground-secondary">
                    Capture any math problem
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/solve">
              <Card interactive className="h-full group">
                <CardContent className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <h3 className="font-semibold mb-1">Ask AI Tutor</h3>
                  <p className="text-sm text-foreground-secondary">
                    Get step-by-step help
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          {/* Recent XP Activity */}
          <RecentXPActivity limit={5} />

          {/* Level Progress */}
          <Card className="gradient-bg text-white">
            <CardContent className="py-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center text-3xl mb-4">
                  🏆
                </div>
                <h3 className="font-bold text-lg mb-1">Level {stats?.level || 1}</h3>
                <p className="text-white/80 text-sm mb-4">
                  {stats?.xpPoints || 0} / {stats?.nextLevelXp || 500} XP
                </p>
                <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                    style={{ width: `${(stats?.levelProgress || 0) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
