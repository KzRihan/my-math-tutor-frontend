'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  useGetPendingQuizResponsesQuery, 
  useReviewQuizAnswerMutation,
  useGetQuizReviewStatsQuery 
} from '@/store/adminApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaClock } from 'react-icons/fa';
import Input from '@/components/ui/Input';

export default function QuizReviewPage() {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const toast = useToast();

  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = 
    useGetPendingQuizResponsesQuery({ limit, skip: page * limit });
  
  const { data: statsData, isLoading: isLoadingStats } = useGetQuizReviewStatsQuery();
  
  const [reviewQuizAnswer, { isLoading: isReviewing }] = useReviewQuizAnswerMutation();

  const responses = pendingData?.data?.responses || [];
  const total = pendingData?.data?.total || 0;
  const hasMore = pendingData?.data?.hasMore || false;

  const stats = statsData?.data || {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const handleReview = async (responseId, isCorrect, correctAnswer = '', adminNotes = '') => {
    try {
      const result = await reviewQuizAnswer({
        responseId,
        isCorrect,
        correctAnswer: correctAnswer || undefined,
        adminNotes: adminNotes || undefined,
      }).unwrap();

      toast.success(result.message || (isCorrect ? 'Answer approved!' : 'Answer rejected.'));
      refetchPending();
    } catch (error) {
      const errorMessage = error?.data?.error?.message || error?.data?.message || 'Failed to review answer';
      toast.error(errorMessage);
    }
  };

  if (isLoadingPending || isLoadingStats) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <FaSpinner className="text-6xl mb-4 mx-auto animate-spin text-primary-500" />
          <h2 className="text-2xl font-bold mb-2">Loading quiz responses...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
          Quiz Review 📝
        </h1>
        <p className="text-foreground-secondary">
          Review and approve/reject student quiz answers
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <FaClock className="text-3xl text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <FaTimesCircle className="text-3xl text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total Reviewed</p>
                <p className="text-2xl font-bold text-primary-600">{(stats.approved || 0) + (stats.rejected || 0)}</p>
              </div>
              <FaCheckCircle className="text-3xl text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Quiz Responses ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-12">
              <FaCheckCircle className="text-5xl mb-4 mx-auto text-green-500" />
              <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-foreground-secondary">
                There are no pending quiz responses to review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <QuizResponseCard
                  key={response._id || response.id}
                  response={response}
                  onReview={handleReview}
                  isReviewing={isReviewing}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--card-border)]">
              <p className="text-sm text-foreground-secondary">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizResponseCard({ response, onReview, isReviewing }) {
  const [isCorrect, setIsCorrect] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const user = response.userId || {};
  const topic = response.topicId || {};

  const handleSubmit = () => {
    onReview(
      response._id || response.id,
      isCorrect,
      correctAnswer,
      adminNotes
    );
    setShowReviewForm(false);
    // Reset form
    setIsCorrect(true);
    setCorrectAnswer('');
    setAdminNotes('');
  };

  return (
    <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="warning">Pending Review</Badge>
            <span className="text-sm text-foreground-secondary">
              {new Date(response.answeredAt).toLocaleString()}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2">{response.questionText}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-foreground-secondary">Student:</span>{' '}
              <span>{user.firstName} {user.lastName} ({user.email})</span>
            </div>
            <div>
              <span className="font-medium text-foreground-secondary">Topic:</span>{' '}
              <span>{topic.title}</span>
            </div>
            <div>
              <span className="font-medium text-foreground-secondary">Lesson:</span>{' '}
              <span>{response.lessonId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg mb-4">
        <p className="text-sm font-medium text-foreground-secondary mb-1">Student&apos;s Answer:</p>
        <p className="text-lg font-mono bg-neutral-100 dark:bg-neutral-900 p-3 rounded">
          {response.userAnswer}
        </p>
      </div>

      {!showReviewForm ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowReviewForm(true)}
            disabled={isReviewing}
          >
            Review Answer
          </Button>
        </div>
      ) : (
        <div className="space-y-4 p-4 bg-white dark:bg-neutral-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer (optional):</label>
            <Input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admin Notes (optional):</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isCorrect}
                onChange={() => setIsCorrect(true)}
                className="w-4 h-4"
              />
              <span className="text-green-600 font-medium">Approve</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isCorrect}
                onChange={() => setIsCorrect(false)}
                className="w-4 h-4"
              />
              <span className="text-red-600 font-medium">Reject</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant={isCorrect ? 'primary' : 'secondary'}
              onClick={handleSubmit}
              disabled={isReviewing}
              loading={isReviewing}
            >
              {isCorrect ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <FaTimesCircle className="mr-2" />
                  Reject
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowReviewForm(false);
                setIsCorrect(true);
                setCorrectAnswer('');
                setAdminNotes('');
              }}
              disabled={isReviewing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

