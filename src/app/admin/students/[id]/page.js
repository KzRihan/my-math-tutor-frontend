'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  useGetStudentDetailQuery,
  useSendEmailToStudentMutation,
  useUnlockTopicForStudentMutation,
  useResetAllQuizzesForStudentMutation,
  useSuspendStudentMutation,
  useActivateStudentMutation,
  useGetTopicsQuery,
} from '@/store/adminApi';
import { cn } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';
import { useToast } from '@/components/providers/ToastProvider';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  // Fetch student detail from API
  const { data, isLoading, error, refetch } = useGetStudentDetailQuery(params.id);
  const { data: topicsData } = useGetTopicsQuery();

  // Mutations
  const [sendEmail, { isLoading: isSendingEmail }] = useSendEmailToStudentMutation();
  const [unlockTopic, { isLoading: isUnlocking }] = useUnlockTopicForStudentMutation();
  const [resetQuizzes, { isLoading: isResetting }] = useResetAllQuizzesForStudentMutation();
  const [suspendStudent, { isLoading: isSuspending }] = useSuspendStudentMutation();
  const [activateStudent, { isLoading: isActivating }] = useActivateStudentMutation();

  const toast = useToast();

  const student = data?.data || null;
  const topics = topicsData?.data?.data || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 minutes';
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes} minutes`;
    return `${hours}h ${minutes % 60}m`;
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
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

  // Handlers for Quick Actions
  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in both subject and message');
      return;
    }

    try {
      await sendEmail({
        id: params.id,
        subject: emailSubject,
        message: emailMessage,
      }).unwrap();
      toast.success('Email sent successfully');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      toast.error(error?.data?.error?.message || 'Failed to send email');
    }
  };

  const handleUnlockTopic = async () => {
    if (!selectedTopicId) {
      toast.error('Please select a topic');
      return;
    }

    try {
      await unlockTopic({
        id: params.id,
        topicId: selectedTopicId,
      }).unwrap();
      toast.success('Topic unlocked successfully');
      setShowUnlockModal(false);
      setSelectedTopicId('');
      refetch(); // Refresh student data
    } catch (error) {
      toast.error(error?.data?.error?.message || 'Failed to unlock topic');
    }
  };

  const handleResetQuizzes = async () => {
    try {
      const result = await resetQuizzes(params.id).unwrap();
      toast.success(`Successfully reset ${result.data?.deletedCount || 0} quiz responses`);
      setShowResetConfirm(false);
      refetch(); // Refresh student data
    } catch (error) {
      toast.error(error?.data?.error?.message || 'Failed to reset quizzes');
    }
  };

  const handleSuspendAccount = async () => {
    try {
      await suspendStudent(params.id).unwrap();
      toast.success('Student account suspended successfully');
      setShowSuspendConfirm(false);
      refetch(); // Refresh student data
      router.push('/admin/students'); // Redirect to students list
    } catch (error) {
      toast.error(error?.data?.error?.message || 'Failed to suspend account');
    }
  };

  const handleActivateAccount = async () => {
    try {
      await activateStudent(params.id).unwrap();
      toast.success('Student account activated successfully');
      refetch(); // Refresh student data
    } catch (error) {
      toast.error(error?.data?.error?.message || 'Failed to activate account');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load student details</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Retry
            </button>
            <Link href="/admin/students" className="btn btn-secondary">
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const enrolledTopics = student.enrolledTopics || [];
  const quizHistory = student.quizHistory || [];
  const activity = student.activity || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/students"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
            {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
            <p className="text-foreground-secondary">{student.email}</p>
          </div>
          <span className={cn(
            'text-xs font-medium px-3 py-1 rounded-full capitalize',
            student.status === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
          )}>
            {student.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <span>📧</span>
            Send Message
          </button>
          <button className="btn btn-secondary">
            <span>🔄</span>
            Reset Quiz
          </button>
          <button className="btn btn-primary">
            <span>📚</span>
            Enroll in Topic
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-success">{student.avgQuizScore || 0}%</p>
          <p className="text-xs text-foreground-secondary">Avg Quiz Score</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold">{student.enrolledTopicsCount || 0}</p>
          <p className="text-xs text-foreground-secondary">Topics Enrolled</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold">{formatTime(student.totalTimeSpent)}</p>
          <p className="text-xs text-foreground-secondary">Time Spent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1 inline-flex gap-1">
        {['overview', 'topics', 'quizzes', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Learning Progress</h3>
              <div className="space-y-4">
                {enrolledTopics.length > 0 ? (
                  enrolledTopics.map((topic) => {
                    const isCompleted = topic.status === 'completed';
                    const progress = topic.progress || 0;
                    return (
                      <div key={topic.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                              <span className="text-lg">📚</span>
                            </div>
                            <div>
                              <p className="font-medium">{topic.title}</p>
                              <p className="text-xs text-foreground-secondary">{topic.lessonsCount || 0} lessons · {topic.exercisesCount || 0} exercises</p>
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full capitalize',
                            isCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          )}>
                            {isCompleted ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full rounded-full',
                                isCompleted ? 'bg-success' : 'bg-primary-500'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    <p>No enrolled topics yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Enrolled Topics</h3>
                <button className="btn btn-primary btn-sm">
                  <span>➕</span>
                  Enroll
                </button>
              </div>
              <div className="space-y-3">
                {enrolledTopics.length > 0 ? (
                  enrolledTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <span className="text-lg">📚</span>
                        </div>
                        <div>
                          <p className="font-medium">{topic.title}</p>
                          <p className="text-xs text-foreground-secondary capitalize">{topic.gradeBand || 'N/A'} · {topic.difficulty || 'N/A'}</p>
                        </div>
                      </div>
                      <button className="text-error text-sm hover:underline">Unenroll</button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    <p>No enrolled topics</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Quiz History</h3>
              <div className="space-y-3">
                {quizHistory.length > 0 ? (
                  quizHistory.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                      <div>
                        <p className="font-medium">{quiz.topicTitle}</p>
                        <p className="text-xs text-foreground-secondary">{formatDate(quiz.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'text-lg font-bold',
                          quiz.passed ? 'text-success' : 'text-error'
                        )}>
                          {quiz.score}%
                        </span>
                        <span className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          quiz.passed ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                        )}>
                          {quiz.passed ? 'Passed' : 'Failed'}
                        </span>
                        <button className="text-primary-500 text-sm hover:underline">Reset</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    <p>No quiz history</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activity.length > 0 ? (
                  activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{act.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{act.action}</p>
                        <p className="text-sm text-foreground-secondary">{act.detail}</p>
                      </div>
                      <span className="text-xs text-foreground-secondary">{formatActivityTime(act.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground-secondary">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Student Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary text-sm">Grade Band</span>
                <span className="font-medium capitalize">{student.gradeBand || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary text-sm">Registered</span>
                <span className="font-medium">{formatDate(student.registeredAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary text-sm">Last Active</span>
                <span className="font-medium">{formatDate(student.lastActive)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowEmailModal(true)}
                className="btn btn-secondary w-full justify-start"
                disabled={isSendingEmail}
              >
                <span>📧</span>
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </button>
              <button 
                onClick={() => setShowUnlockModal(true)}
                className="btn btn-secondary w-full justify-start"
                disabled={isUnlocking}
              >
                <span>🔓</span>
                {isUnlocking ? 'Unlocking...' : 'Unlock Topic'}
              </button>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="btn btn-secondary w-full justify-start"
                disabled={isResetting}
              >
                <span>🔄</span>
                {isResetting ? 'Resetting...' : 'Reset All Quizzes'}
              </button>
              {student?.status === 'active' ? (
                <button 
                  onClick={() => setShowSuspendConfirm(true)}
                  className="btn btn-secondary w-full justify-start text-error hover:bg-error/10"
                  disabled={isSuspending}
                >
                  <span>🚫</span>
                  {isSuspending ? 'Suspending...' : 'Suspend Account'}
                </button>
              ) : (
                <button 
                  onClick={handleActivateAccount}
                  className="btn btn-secondary w-full justify-start text-success hover:bg-success/10"
                  disabled={isActivating}
                >
                  <span>✅</span>
                  {isActivating ? 'Activating...' : 'Activate Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Email to {student?.firstName} {student?.lastName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Email message"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailSubject('');
                    setEmailMessage('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !emailSubject || !emailMessage}
                  className="btn btn-primary"
                >
                  {isSendingEmail ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Topic Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Unlock Topic for {student?.firstName} {student?.lastName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Topic</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a topic...</option>
                  {topics
                    .filter(topic => !enrolledTopics.some(et => et.id === topic._id || et.id === topic.id))
                    .map((topic) => (
                      <option key={topic._id || topic.id} value={topic._id || topic.id}>
                        {topic.title} ({topic.gradeBand})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowUnlockModal(false);
                    setSelectedTopicId('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlockTopic}
                  disabled={isUnlocking || !selectedTopicId}
                  className="btn btn-primary"
                >
                  {isUnlocking ? 'Unlocking...' : 'Unlock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Quizzes Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reset All Quizzes</h3>
            <p className="text-foreground-secondary mb-6">
              Are you sure you want to reset all quiz responses for {student?.firstName} {student?.lastName}? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleResetQuizzes}
                disabled={isResetting}
                className="btn btn-error"
              >
                {isResetting ? 'Resetting...' : 'Reset All Quizzes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Account Confirmation */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-error">Suspend Account</h3>
            <p className="text-foreground-secondary mb-6">
              Are you sure you want to suspend {student?.firstName} {student?.lastName}&apos;s account? 
              They will not be able to access the platform until reactivated.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSuspendConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendAccount}
                disabled={isSuspending}
                className="btn btn-error"
              >
                {isSuspending ? 'Suspending...' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
