'use client';

import { useState } from 'react';
import { useGetAnalyticsDataQuery, useGetTopicsQuery } from '@/store/adminApi';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const { data: analyticsResponse, isLoading: isLoadingAnalytics, error: analyticsError } = useGetAnalyticsDataQuery(timeRange);
  const { data: topicsResponse } = useGetTopicsQuery();

  const analyticsData = analyticsResponse?.data;
  const topics = topicsResponse?.data || [];

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-error mb-2">Failed to load analytics data</p>
          <p className="text-sm text-foreground-secondary">
            {analyticsError?.data?.error?.message || 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { summaryStats, weeklyActiveUsers, exerciseDifficulty, topicPerformance, dropOffAnalysis, flaggedQuestions } = analyticsData;

  // Calculate max users for chart scaling
  const maxUsers = Math.max(...weeklyActiveUsers.map(d => d.users), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-foreground-secondary">Monitor performance and engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn btn-secondary">
            <span>📥</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👥</span>
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-lg',
              summaryStats.trends.students.direction === 'up' ? 'bg-success/10 text-success' :
              summaryStats.trends.students.direction === 'down' ? 'bg-error/10 text-error' :
              'bg-neutral-500/10 text-neutral-500'
            )}>
              {summaryStats.trends.students.value}
            </span>
          </div>
          <p className="text-3xl font-bold">{summaryStats.totalStudents.toLocaleString()}</p>
          <p className="text-sm text-foreground-secondary">Total Students</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📖</span>
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-lg',
              summaryStats.trends.lessons.direction === 'up' ? 'bg-success/10 text-success' :
              summaryStats.trends.lessons.direction === 'down' ? 'bg-error/10 text-error' :
              'bg-neutral-500/10 text-neutral-500'
            )}>
              {summaryStats.trends.lessons.value}
            </span>
          </div>
          <p className="text-3xl font-bold">{summaryStats.lessonsCompleted.toLocaleString()}</p>
          <p className="text-sm text-foreground-secondary">Lessons Completed</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📝</span>
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-lg',
              summaryStats.trends.quizScore.direction === 'up' ? 'bg-success/10 text-success' :
              summaryStats.trends.quizScore.direction === 'down' ? 'bg-warning/10 text-warning' :
              'bg-neutral-500/10 text-neutral-500'
            )}>
              {summaryStats.trends.quizScore.value}
            </span>
          </div>
          <p className="text-3xl font-bold">{summaryStats.avgQuizScore.toFixed(1)}%</p>
          <p className="text-sm text-foreground-secondary">Avg Quiz Score</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⏱️</span>
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-lg',
              summaryStats.trends.timePerStudent.direction === 'up' ? 'bg-success/10 text-success' :
              summaryStats.trends.timePerStudent.direction === 'down' ? 'bg-error/10 text-error' :
              'bg-neutral-500/10 text-neutral-500'
            )}>
              {summaryStats.trends.timePerStudent.value}
            </span>
          </div>
          <p className="text-3xl font-bold">{summaryStats.avgTimePerStudent.toFixed(1)}h</p>
          <p className="text-sm text-foreground-secondary">Avg Time/Student</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Active Users Chart */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Weekly Active Users</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {weeklyActiveUsers.map((day, index) => (
              <div key={day.day || index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500"
                  style={{ height: `${maxUsers > 0 ? (day.users / maxUsers) * 100 : 0}%`, minHeight: '20px' }}
                />
                <span className="text-xs text-foreground-secondary">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Difficulty Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Exercise Performance by Difficulty</h3>
          <div className="space-y-6">
            {Object.entries(exerciseDifficulty).map(([level, data]) => (
              <div key={level}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-sm font-medium capitalize px-2 py-0.5 rounded-lg',
                    level === 'easy' ? 'bg-success/10 text-success' :
                    level === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  )}>
                    {level}
                  </span>
                  <span className="text-sm text-foreground-secondary">{data.count} exercises · {data.avgCorrect}% correct</span>
                </div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full',
                      level === 'easy' ? 'bg-success' :
                      level === 'medium' ? 'bg-warning' :
                      'bg-error'
                    )}
                    style={{ width: `${data.avgCorrect}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Performance */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Topic Performance</h3>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="all">All Topics</option>
            {topics.filter(t => t.status === 'published').map((topic) => (
              <option key={topic._id || topic.id} value={topic._id || topic.id}>{topic.title}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Topic</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Students</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Completion Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Avg Score</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {topicPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-foreground-secondary">
                    No topic performance data available
                  </td>
                </tr>
              ) : (
                topicPerformance.map((topic, index) => (
                  <tr key={topic.topicId || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <span className="text-lg">📚</span>
                        </div>
                        <span className="font-medium">{topic.topic}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold">{topic.students}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${topic.completion}%` }}
                          />
                        </div>
                        <span className="text-sm">{topic.completion}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'font-semibold',
                        topic.avgScore >= 80 ? 'text-success' :
                        topic.avgScore >= 70 ? 'text-warning' :
                        'text-error'
                      )}>
                        {topic.avgScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-lg',
                        topic.trend.direction === 'up' ? 'bg-success/10 text-success' :
                        topic.trend.direction === 'down' ? 'bg-error/10 text-error' :
                        'bg-neutral-500/10 text-neutral-500'
                      )}>
                        {topic.trend.direction === 'up' ? '↑' : topic.trend.direction === 'down' ? '↓' : '→'} {topic.trend.value}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop-off Analysis */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Drop-off Analysis</h3>
          <p className="text-sm text-foreground-secondary mb-4">Where students stop in each topic</p>
          <div className="space-y-4">
            {dropOffAnalysis.length === 0 ? (
              <p className="text-sm text-foreground-secondary text-center py-4">No drop-off data available</p>
            ) : (
              dropOffAnalysis.map((item, index) => (
                <div key={index} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{item.topic}</span>
                    <span className="text-xs text-error">{item.dropoff}% drop-off</span>
                  </div>
                  <p className="text-xs text-foreground-secondary">{item.lesson}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flagged Questions */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Questions Needing Review</h3>
          <p className="text-sm text-foreground-secondary mb-4">Low performance questions</p>
          <div className="space-y-3">
            {flaggedQuestions.length === 0 ? (
              <p className="text-sm text-foreground-secondary text-center py-4">No flagged questions</p>
            ) : (
              flaggedQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div>
                    <p className="font-medium text-sm">{item.question}</p>
                    <p className="text-xs text-foreground-secondary">{item.correct}% correct rate</p>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-lg',
                    item.type === 'Too Hard' ? 'bg-error/10 text-error' :
                    item.type === 'Too Easy' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  )}>
                    {item.type}
                  </span>
                </div>
              ))
            )}
          </div>
          <button className="btn btn-secondary btn-sm w-full mt-4">
            View All Flagged Questions
          </button>
        </div>
      </div>
    </div>
  );
}
