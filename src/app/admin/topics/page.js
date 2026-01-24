'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetTopicsQuery } from '@/store/adminApi';
import { FaBook, FaDownload, FaPlus, FaSpinner } from 'react-icons/fa';

export default function TopicsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Fetch topics from API
  const { data: topicsData, isLoading, error } = useGetTopicsQuery();
  
  // API returns: { success, message, data: [...], meta }
  // RTK Query might wrap it, so check both paths
  const topics = Array.isArray(topicsData?.data) 
    ? topicsData.data 
    : Array.isArray(topicsData) 
      ? topicsData 
      : [];

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || topic.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || topic.gradeBand === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-success/10 text-success border-success/20',
      generated: 'bg-warning/10 text-warning border-warning/20',
      draft: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
      archived: 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary border-transparent',
    };
    return styles[status] || styles.draft;
  };

  const getGradeBadge = (grade) => {
    const styles = {
      primary: 'bg-success/10 text-success',
      secondary: 'bg-info/10 text-info',
      college: 'bg-warning/10 text-warning',
    };
    return styles[grade] || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-foreground-secondary">Loading topics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 text-center">
          <p className="text-error mb-4">Failed to load topics. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
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
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="text-foreground-secondary">Manage your curriculum topics and lessons</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <FaDownload />
            Import
          </button>
          <Link href="/admin/topics/new" className="btn btn-primary">
            <FaPlus />
            Create Topic
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="generated">Generated</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="all">All Grades</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="college">College</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all' || gradeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setGradeFilter('all');
              }}
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Topics Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Topic</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Grade</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Content</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Students</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Performance</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                        <FaBook className="text-lg text-primary-500" />
                      </div>
                      <div>
                        <Link 
                          href={`/admin/topics/${topic.id}`}
                          className="font-medium hover:text-primary-500 transition-colors"
                        >
                          {topic.title}
                        </Link>
                        <p className="text-xs text-foreground-secondary mt-0.5">{topic.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getGradeBadge(topic.gradeBand)}`}>
                      {topic.gradeBand.charAt(0).toUpperCase() + topic.gradeBand.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(topic.status)}`}>
                      {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                      <div className="text-sm">
                      <span className="text-foreground">{topic.lessonsCount || topic.lessons?.length || 0}</span>
                      <span className="text-foreground-secondary"> lessons</span>
                      <span className="text-foreground-secondary mx-1">·</span>
                      <span className="text-foreground">{topic.exercisesCount || 0}</span>
                      <span className="text-foreground-secondary"> exercises</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium">{topic.studentsEnrolled}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground-secondary">Completion</span>
                          <span className="text-xs font-medium">{topic.completionRate}%</span>
                        </div>
                        <div className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${topic.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/topics/${topic.id}`}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Topic"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button 
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Duplicate Topic"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button 
                        className="p-2 rounded-lg hover:bg-error/10 text-foreground-secondary hover:text-error transition-colors"
                        title="Archive Topic"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredTopics.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <FaBook className="text-3xl text-primary-500" />
            </div>
            <h3 className="font-medium mb-1">No topics found</h3>
            <p className="text-foreground-secondary text-sm">Try adjusting your filters or create a new topic.</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[var(--card-border)] flex items-center justify-between">
          <p className="text-sm text-foreground-secondary">
            Showing {filteredTopics.length} of {topics.length} topics
            {topicsData?.meta && ` (Total: ${topicsData.meta.total})`}
          </p>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" disabled>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
