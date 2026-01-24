'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGetStudentListQuery } from '@/store/adminApi';
import { cn } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';

export default function StudentsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch students from API
  const { data, isLoading, error, refetch } = useGetStudentListQuery({
    page,
    limit,
    search: searchQuery || undefined,
    gradeBand: gradeFilter !== 'all' ? gradeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const students = data?.data?.data || [];
  const stats = data?.data?.stats || {
    totalStudents: 0,
    activeStudents: 0,
    avgQuizScore: 0,
    avgXPPoints: 0,
  };
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Filter students client-side for search (if needed as fallback)
  const filteredStudents = useMemo(() => {
    if (!searchQuery && gradeFilter === 'all' && statusFilter === 'all') {
      return students;
    }
    return students.filter((student) => {
      const matchesSearch = !searchQuery || 
        student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || student.gradeBand === gradeFilter;
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, searchQuery, gradeFilter, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading students...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load students</p>
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
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-foreground-secondary">Manage and monitor student progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <span>📥</span>
            Export Data
          </button>
          <button className="btn btn-primary">
            <span>📧</span>
            Send Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-foreground-secondary">Total Students</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeStudents}</p>
              <p className="text-xs text-foreground-secondary">Active This Week</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgQuizScore}%</p>
              <p className="text-xs text-foreground-secondary">Avg Quiz Score</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgXPPoints}</p>
              <p className="text-xs text-foreground-secondary">Avg XP Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-2 pl-10 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="all">All Grades</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="college">College</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Student</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Grade</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Progress</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Performance</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Last Active</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                          {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/students/${student.id}`}
                            className="font-medium hover:text-primary-500 transition-colors"
                          >
                            {student.firstName} {student.lastName}
                          </Link>
                          <p className="text-xs text-foreground-secondary">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-lg capitalize',
                        student.gradeBand === 'primary' ? 'bg-success/10 text-success' :
                        student.gradeBand === 'secondary' ? 'bg-info/10 text-info' :
                        'bg-warning/10 text-warning'
                      )}>
                        {student.gradeBand || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'text-xs font-medium px-3 py-1 rounded-full capitalize',
                        student.status === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
                      )}>
                        {student.status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <span className="font-medium">{student.enrolledTopicsCount || 0}</span>
                        <span className="text-foreground-secondary"> enrolled</span>
                        <span className="text-foreground-secondary mx-1">·</span>
                        <span className="font-medium">{student.completedTopicsCount || 0}</span>
                        <span className="text-foreground-secondary"> completed</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <p><span className="font-medium">{student.avgQuizScore || 0}%</span> <span className="text-foreground-secondary">avg score</span></p>
                          <p><span className="font-medium">Lvl {student.level || 1}</span> <span className="text-foreground-secondary">· {student.xpPoints || 0} XP</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm">{formatDate(student.lastActive)}</p>
                      <p className="text-xs text-foreground-secondary">{formatTime(student.totalTimeSpent)} total</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/students/${student.id}`}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="View Profile"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button 
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Send Message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-foreground-secondary">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--card-border)] flex items-center justify-between">
          <p className="text-sm text-foreground-secondary">
            Showing {filteredStudents.length} of {total} students
          </p>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary btn-sm" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-sm text-foreground-secondary px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button 
              className="btn btn-secondary btn-sm" 
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
