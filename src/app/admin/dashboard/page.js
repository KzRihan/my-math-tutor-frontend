'use client';

import Link from 'next/link';
import StatCard from '@/components/admin/StatCard';
import ActivityLog from '@/components/admin/ActivityLog';
import { useGetDashboardDataQuery } from '@/store/adminApi';
import { FaSpinner } from 'react-icons/fa';

export default function AdminDashboardPage() {
  // Fetch dashboard data from API
  const { data, isLoading, error, refetch } = useGetDashboardDataQuery();

  // Extract data with safe defaults
  const dashboardStats = data?.data?.stats || {
    totalTopics: 0,
    publishedTopics: 0,
    draftTopics: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalLessons: 0,
    totalExercises: 0,
    totalQuizzes: 0,
    aiGenerationsToday: 0,
    avgQuizScore: 0,
    topicsTrend: { value: 0, direction: 'neutral' },
    studentsTrend: { value: '0%', direction: 'neutral' },
    quizScoreTrend: { value: '0%', direction: 'neutral' },
  };

  const recentTopics = data?.data?.recentTopics || [];
  const activityLog = data?.data?.activityLog || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load dashboard data</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-foreground-secondary">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="btn btn-secondary">
            <span>📥</span>
            Export Report
          </button> */}
          <Link href="/admin/topics/new" className="btn btn-primary">
            <span>➕</span>
            Create Topic
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Topics"
          value={dashboardStats.totalTopics}
          subtitle={`${dashboardStats.publishedTopics} published, ${dashboardStats.draftTopics} drafts`}
          icon="📚"
          trend={dashboardStats.topicsTrend?.direction || 'neutral'}
          trendValue={dashboardStats.topicsTrend?.value ? `+${dashboardStats.topicsTrend.value}` : '0'}
          variant="primary"
        />
        <StatCard
          title="Total Students"
          value={dashboardStats.totalStudents.toLocaleString()}
          subtitle={`${dashboardStats.activeStudents} active this week`}
          icon="👥"
          trend={dashboardStats.studentsTrend?.direction || 'neutral'}
          trendValue={dashboardStats.studentsTrend?.value || '0%'}
          variant="success"
        />
        <StatCard
          title="Avg Quiz Score"
          value={`${dashboardStats.avgQuizScore}%`}
          subtitle="Across all topics"
          icon="📊"
          trend={dashboardStats.quizScoreTrend?.direction || 'neutral'}
          trendValue={dashboardStats.quizScoreTrend?.value || '0%'}
          variant="info"
        />
        <StatCard
          title="AI Generations"
          value={dashboardStats.aiGenerationsToday}
          subtitle="Generated today"
          icon="🤖"
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Topics */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Topics</h3>
              <Link 
                href="/admin/topics" 
                className="text-primary-500 text-sm font-medium hover:text-primary-400 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Topic</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Students</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Completion</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {recentTopics.length > 0 ? (
                    recentTopics.map((topic) => (
                      <tr key={topic.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{topic.title}</p>
                            <p className="text-xs text-foreground-secondary">{topic.lessonsCount} lessons · {topic.exercisesCount} exercises</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${
                            topic.status === 'published' ? 'badge-success' :
                            topic.status === 'generated' ? 'badge-warning' :
                            topic.status === 'draft' ? 'badge-primary' :
                            'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
                          }`}>
                            {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">{topic.studentsEnrolled}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${topic.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground-secondary">{topic.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link 
                            href={`/admin/topics/${topic.id}`}
                            className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-foreground-secondary">
                        No topics found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog activities={activityLog || []} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/topics/new"
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📚</span>
            </div>
            <p className="font-medium text-sm">New Topic</p>
            <p className="text-xs text-foreground-secondary">Create curriculum</p>
          </Link>

          <Link 
            href="/admin/topics?action=generate"
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="font-medium text-sm">AI Generate</p>
            <p className="text-xs text-foreground-secondary">Create with AI</p>
          </Link>

          <Link 
            href="/admin/students"
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👥</span>
            </div>
            <p className="font-medium text-sm">Students</p>
            <p className="text-xs text-foreground-secondary">Manage users</p>
          </Link>

          <Link 
            href="/admin/analytics"
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📈</span>
            </div>
            <p className="font-medium text-sm">Analytics</p>
            <p className="text-xs text-foreground-secondary">View reports</p>
          </Link>
        </div>
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{dashboardStats.totalLessons}</p>
              <p className="text-foreground-secondary text-sm">Total Lessons</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary-500/10 flex items-center justify-center">
              <span className="text-2xl">❓</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{dashboardStats.totalExercises}</p>
              <p className="text-foreground-secondary text-sm">Total Exercises</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{dashboardStats.totalQuizzes}</p>
              <p className="text-foreground-secondary text-sm">Total Quizzes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
