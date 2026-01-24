'use client';

import { useEffect, useState } from 'react';
import { useGetLessonXPSummaryQuery } from '@/store/questionApi';
import { FaTrophy, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

/**
 * XPDisplay Component
 * 
 * Displays XP summary for a lesson
 */
export default function XPDisplay({ topicId, lessonId, className = '' }) {
  const { data: xpSummary, isLoading, refetch } = useGetLessonXPSummaryQuery(
    { topicId, lessonId },
    { 
      skip: !topicId || !lessonId,
      // Automatically refetch when component mounts or args change
      refetchOnMountOrArgChange: true,
    }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!xpSummary?.data) {
    return null;
  }

  // Extract data from response (response structure: { success, message, data: {...} })
  const summary = xpSummary.data;
  
  // Map API response fields (API returns: totalXP, questionsAnswered, correctAnswers, accuracy)
  const totalXP = summary.totalXP || summary.totalXPEarnedInLesson || 0;
  const questionsAnswered = summary.questionsAnswered || summary.totalQuestionsAnswered || 0;
  const correctAnswers = summary.correctAnswers || 0;
  // API already returns accuracy as a percentage, or calculate it
  const accuracy = summary.accuracy !== undefined 
    ? summary.accuracy 
    : (questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0);

  return (
    <Card className={className}>
      <CardHeader className="border-b border-[var(--card-border)] bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
        <CardTitle className="flex items-center gap-2">
          <FaTrophy className="text-primary-500" />
          Lesson XP Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Total XP */}
          <div className="text-center p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {totalXP}
            </div>
            <div className="text-sm text-foreground-secondary">Total XP</div>
          </div>

          {/* Accuracy */}
          <div className="text-center p-4 rounded-xl bg-secondary-500/10 border border-secondary-500/20">
            <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">
              {accuracy.toFixed(0)}%
            </div>
            <div className="text-sm text-foreground-secondary">Accuracy</div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Correct Answers
            </span>
            <span className="font-semibold">
              {correctAnswers} / {questionsAnswered}
            </span>
          </div>
          {questionsAnswered > 0 && (
            <Progress value={accuracy / 100} size="sm" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

