'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useSubmitAnswerMutation, useGetUserHistoryQuery } from '@/store/questionApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaTrophy } from 'react-icons/fa';

/**
 * PracticeQuestion Component
 * 
 * Displays a practice question with answer input and XP reward system
 */
export default function PracticeQuestion({
  exercise,
  questionIndex,
  topicId,
  lessonId,
  questionType = 'practice',
  correctAnswer,
  onAnswerSubmitted,
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { isCorrect, xpAwarded, message }
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if quiz answer has been submitted
  const [submittedAnswer, setSubmittedAnswer] = useState(''); // Store the submitted answer
  const toast = useToast();
  const [submitAnswer] = useSubmitAnswerMutation();
  
  // Check if user has already submitted an answer for this quiz question
  const { data: historyData } = useGetUserHistoryQuery(100, {
    skip: questionType !== 'quiz', // Only fetch for quiz questions
  });

  // Check on mount if user has already submitted this quiz question
  useEffect(() => {
    if (questionType === 'quiz' && historyData?.data) {
      const history = historyData.data;
      const existingResponse = history.find(
        (response) => {
          const responseTopicId = response.topicId?._id?.toString() || response.topicId?.toString();
          return (
            responseTopicId === topicId &&
            response.lessonId === lessonId &&
            response.questionIndex === questionIndex &&
            response.questionType === 'quiz'
          );
        }
      );
      
      if (existingResponse) {
        setIsSubmitted(true);
        setSubmittedAnswer(existingResponse.userAnswer || '');
        setResult({
          isCorrect: existingResponse.isCorrect || false,
          xpAwarded: existingResponse.xpAwarded || 0,
          message: existingResponse.reviewStatus === 'pending' 
            ? 'Your answer has been submitted for review. You will receive XP points once an admin reviews your answer.'
            : existingResponse.reviewStatus === 'approved'
            ? `Answer approved! You earned ${existingResponse.xpAwarded || 0} XP!`
            : existingResponse.reviewStatus === 'rejected'
            ? 'Your answer was reviewed and rejected.'
            : 'Your answer has been submitted for review.',
        });
      }
    }
  }, [questionType, historyData, topicId, lessonId, questionIndex]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast.warning('Please enter an answer');
      return;
    }

    // For quiz questions, prevent multiple submissions
    if (questionType === 'quiz' && isSubmitted) {
      toast.warning('You have already submitted an answer for this quiz question.');
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Submit answer - backend will get correct answer and question text from lesson content if not provided
      const response = await submitAnswer({
        topicId,
        lessonId,
        questionIndex,
        questionType,
        userAnswer: userAnswer.trim(),
        // Pass correct answer if available, otherwise backend will get it from lesson content
        correctAnswer: correctAnswer?.trim() || '',
        // Pass question text if available, otherwise backend will get it from lesson content
        questionText: (exercise.exercise || exercise.question || '').trim() || '',
      }).unwrap();

      // Extract data from response (response structure: { success, message, data: {...} })
      const responseData = response.data || response;

      setResult({
        isCorrect: responseData.isCorrect,
        xpAwarded: responseData.xpAwarded,
        message: responseData.message,
        totalXPEarned: responseData.totalXPEarned,
        userLevel: responseData.userLevel,
        userXP: responseData.userXP,
      });

      // For quiz questions, mark as submitted after successful submission
      if (questionType === 'quiz') {
        setIsSubmitted(true);
        setSubmittedAnswer(userAnswer.trim()); // Store the submitted answer
        // Quiz questions are submitted for admin review
        toast.info(responseData.message || 'Your answer has been submitted for review.');
      } else if (responseData.isCorrect && responseData.xpAwarded > 0) {
        // Practice question - correct and earned XP
        toast.success(`🎉 Correct! You earned ${responseData.xpAwarded} XP!`);
      } else if (responseData.isCorrect && responseData.xpAwarded === 0) {
        // Practice question - correct but already earned XP
        toast.info('Correct! (You already earned XP for this question)');
      } else {
        // Practice question - incorrect
        toast.error('Incorrect answer. Try again!');
        setShowCorrectAnswer(true);
      }

      // Notify parent component
      if (onAnswerSubmitted) {
        onAnswerSubmitted({
          questionIndex,
          isCorrect: responseData.isCorrect,
          xpAwarded: responseData.xpAwarded,
        });
      }

      // Trigger automatic refetch of XP-related queries using RTK Query's dispatch
      // The cache tags will automatically invalidate and refetch the queries
      // This is handled automatically by RTK Query's invalidatesTags
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      // Extract error message from different possible error structures
      const errorData = error?.data || error;
      const errorMessage = 
        errorData?.error?.message || 
        errorData?.message || 
        error?.message ||
        'Failed to submit answer. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('Correct answer is required') || errorMessage.includes('answer is missing')) {
        toast.error('This question is missing the correct answer. Please contact support or try again later.');
        console.error('Missing correct answer in lesson content:', {
          questionType,
          questionIndex,
          topicId,
          lessonId,
        });
      } else if (errorMessage.includes('already answered') || errorMessage.includes('already earned')) {
        // If user already earned XP, show info message
        setResult({
          isCorrect: true,
          xpAwarded: 0,
          message: 'You have already earned XP for this question.',
        });
        toast.info('You have already answered this question correctly.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  const isAnswered = result !== null;
  const isCorrect = result?.isCorrect || false;
  const xpAwarded = result?.xpAwarded || 0;

  return (
    <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 transition-all">
      <div className="flex items-start gap-4">
        {/* Question Number */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          Q{questionIndex + 1}
        </div>

        <div className="flex-1 space-y-4">
          {/* Question Text */}
          <div className="text-lg font-medium">
            {exercise.exercise || exercise.question || ''}
          </div>

          {/* Answer Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={questionType === 'quiz' && isSubmitted ? "Answer already submitted" : "Type your answer..."}
              value={userAnswer}
              onChange={(e) => {
                // For quiz questions, prevent editing after submission
                if (questionType === 'quiz' && isSubmitted) {
                  return;
                }
                setUserAnswer(e.target.value);
                // Reset result when user types new answer (only for practice)
                if (result && questionType === 'practice') {
                  setResult(null);
                  setShowCorrectAnswer(false);
                }
              }}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting || (questionType === 'quiz' && isSubmitted)}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : result && !isCorrect
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : questionType === 'quiz' && isSubmitted
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <Button
              variant={isCorrect ? 'secondary' : questionType === 'quiz' && isSubmitted ? 'secondary' : 'primary'}
              onClick={handleSubmit}
              disabled={isSubmitting || !userAnswer.trim() || (questionType === 'quiz' && isSubmitted)}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Checking...
                </>
              ) : questionType === 'quiz' && isSubmitted ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Submitted
                </>
              ) : isCorrect ? (
                <>
                  <FaCheckCircle className="mr-2" />
                  Correct!
                </>
              ) : (
                'Check Answer'
              )}
            </Button>
          </div>

          {/* Quiz Submission Status */}
          {questionType === 'quiz' && isSubmitted && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <FaCheckCircle className="text-lg" />
                <span className="font-medium">Answer Submitted</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Your answer has been submitted for review. You will receive XP points once an admin reviews your answer.
              </p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div
              className={`p-4 rounded-xl border transition-all animate-fade-in ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-0.5" />
                ) : (
                  <FaTimesCircle className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCorrect
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}
                  >
                    {result.message}
                  </p>

                  {/* XP Award Display */}
                  {isCorrect && xpAwarded > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                      <FaTrophy className="text-lg" />
                      <span className="font-semibold">+{xpAwarded} XP</span>
                      {result.userLevel && (
                        <span className="text-sm">
                          (Level {result.userLevel} • {result.userXP} total XP)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Show correct answer if wrong */}
                  {!isCorrect && showCorrectAnswer && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        <span className="font-semibold">Correct Answer:</span>{' '}
                        <span className="font-mono">{correctAnswer}</span>
                      </p>
                    </div>
                  )}

                  {/* Already earned XP message */}
                  {isCorrect && xpAwarded === 0 && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      You can still practice, but XP is only awarded once per question.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

