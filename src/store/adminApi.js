/**
 * Admin API - RTK Query
 * 
 * RTK Query API slice for admin operations, specifically topic and lesson generation.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Backend AI service URL - should be configured via environment variable
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://192.168.0.125:8503';

/**
 * Admin API slice
 * Provides endpoints for admin operations including topic and lesson generation
 */
export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Get token from localStorage
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    headers.set('authorization', `Bearer ${token}`);
                }
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Topic', 'Lesson', 'QuizReview', 'Dashboard', 'Student', 'Analytics'],
    endpoints: (builder) => ({
        /**
         * Generate lessons for a topic
         * This calls the Node.js API which then calls the AI service
         * POST /admin/topics/generate-lessons
         */
        generateLessons: builder.mutation({
            query: (data) => ({
                url: '/admin/topics/generate-lessons',
                method: 'POST',
                body: {
                    topic_title: data.topicTitle,
                    grade: data.grade,
                    difficulty_level: data.difficultyLevel,
                    number_of_lessons: data.numberOfLessons,
                },
            }),
            invalidatesTags: ['Topic'],
        }),

        /**
         * Generate lesson content
         * This calls the Node.js API which then calls the AI service
         * POST /admin/topics/generate-lesson-content
         */
        generateLessonContent: builder.mutation({
            query: (data) => ({
                url: '/admin/topics/generate-lesson-content',
                method: 'POST',
                body: {
                    topic_title: data.topicTitle,
                    lesson_title: data.lessonTitle,
                    grade: data.grade,
                    difficulty_level: data.difficultyLevel,
                    exercises_count: data.exercisesCount,
                    quiz_count: data.quizCount,
                },
            }),
            invalidatesTags: ['Lesson'],
        }),

        /**
         * Create a new topic
         * POST /admin/topics
         */
        createTopic: builder.mutation({
            query: (data) => ({
                url: '/admin/topics',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Topic'],
        }),

        /**
         * Get all topics
         * GET /admin/topics
         */
        getTopics: builder.query({
            query: () => '/admin/topics',
            providesTags: ['Topic'],
        }),

        /**
         * Get a single topic by ID
         * GET /admin/topics/:id
         */
        getTopic: builder.query({
            query: (id) => `/admin/topics/${id}`,
            providesTags: (result, error, id) => [{ type: 'Topic', id }],
        }),

        /**
         * Update a topic
         * PUT /admin/topics/:id
         */
        updateTopic: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/topics/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Topic', id }, 'Topic'],
        }),

        /**
         * Save generated lessons to topic
         * POST /admin/topics/:id/lessons
         */
        saveLessons: builder.mutation({
            query: ({ topicId, lessons }) => ({
                url: `/admin/topics/${topicId}/lessons`,
                method: 'POST',
                body: { lessons },
            }),
            invalidatesTags: (result, error, { topicId }) => [{ type: 'Topic', id: topicId }, 'Lesson'],
        }),

        /**
         * Save generated lesson content
         * POST /admin/topics/:topicId/lessons/:lessonId/content
         */
        saveLessonContent: builder.mutation({
            query: ({ topicId, lessonId, content }) => ({
                url: `/admin/topics/${topicId}/lessons/${lessonId}/content`,
                method: 'POST',
                body: content,
            }),
            invalidatesTags: (result, error, { topicId, lessonId }) => [
                { type: 'Topic', id: topicId },
                { type: 'Lesson', id: lessonId },
            ],
        }),

        /**
         * Publish a topic
         * POST /admin/topics/:id/publish
         */
        publishTopic: builder.mutation({
            query: (id) => ({
                url: `/admin/topics/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Topic', id }, 'Topic'],
        }),

        /**
         * Unpublish a topic
         * POST /admin/topics/:id/unpublish
         */
        unpublishTopic: builder.mutation({
            query: (id) => ({
                url: `/admin/topics/${id}/unpublish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Topic', id }, 'Topic'],
        }),

        /**
         * Get pending quiz responses for review
         * GET /admin/quiz/pending
         */
        getPendingQuizResponses: builder.query({
            query: ({ limit = 50, skip = 0 } = {}) => ({
                url: `/admin/quiz/pending?limit=${limit}&skip=${skip}`,
                method: 'GET',
            }),
            providesTags: ['QuizReview'],
        }),

        /**
         * Get quiz responses by status
         * GET /admin/quiz/status/:status
         */
        getQuizResponsesByStatus: builder.query({
            query: ({ status, limit = 50, skip = 0 }) => ({
                url: `/admin/quiz/status/${status}?limit=${limit}&skip=${skip}`,
                method: 'GET',
            }),
            providesTags: ['QuizReview'],
        }),

        /**
         * Review and approve/reject a quiz answer
         * POST /admin/quiz/review
         */
        reviewQuizAnswer: builder.mutation({
            query: (data) => ({
                url: '/admin/quiz/review',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['QuizReview', 'User', 'UserXP'],
        }),

        /**
         * Get quiz review statistics
         * GET /admin/quiz/stats
         */
        getQuizReviewStats: builder.query({
            query: () => ({
                url: '/admin/quiz/stats',
                method: 'GET',
            }),
            providesTags: ['QuizReview'],
        }),

        /**
         * Get admin dashboard data
         * GET /admin/dashboard
         */
        getDashboardData: builder.query({
            query: () => ({
                url: '/admin/dashboard',
                method: 'GET',
            }),
            providesTags: ['Dashboard'],
        }),

        /**
         * Get admin analytics data
         * GET /admin/analytics
         */
        getAnalyticsData: builder.query({
            query: (timeRange = '7d') => ({
                url: `/admin/analytics?timeRange=${timeRange}`,
                method: 'GET',
            }),
            providesTags: ['Analytics'],
        }),

        /**
         * Get student list with filters
         * GET /admin/students
         */
        getStudentList: builder.query({
            query: ({ page = 1, limit = 20, search, gradeBand, status } = {}) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                if (search) params.append('search', search);
                if (gradeBand && gradeBand !== 'all') params.append('gradeBand', gradeBand);
                if (status && status !== 'all') params.append('status', status);
                return {
                    url: `/admin/students?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Student'],
        }),

        /**
         * Get student detail
         * GET /admin/students/:id
         */
        getStudentDetail: builder.query({
            query: (id) => ({
                url: `/admin/students/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Student', id }],
        }),

        /**
         * Send email to student
         * POST /admin/students/:id/send-email
         */
        sendEmailToStudent: builder.mutation({
            query: ({ id, subject, message }) => ({
                url: `/admin/students/${id}/send-email`,
                method: 'POST',
                body: { subject, message },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
        }),

        /**
         * Unlock topic for student
         * POST /admin/students/:id/unlock-topic
         */
        unlockTopicForStudent: builder.mutation({
            query: ({ id, topicId }) => ({
                url: `/admin/students/${id}/unlock-topic`,
                method: 'POST',
                body: { topicId },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }, 'Topic'],
        }),

        /**
         * Reset all quizzes for student
         * POST /admin/students/:id/reset-quizzes
         */
        resetAllQuizzesForStudent: builder.mutation({
            query: (id) => ({
                url: `/admin/students/${id}/reset-quizzes`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Student', id }, 'QuizReview'],
        }),

        /**
         * Suspend student account
         * POST /admin/students/:id/suspend
         */
        suspendStudent: builder.mutation({
            query: (id) => ({
                url: `/admin/students/${id}/suspend`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Student', id }, 'Student'],
        }),

        /**
         * Activate student account
         * POST /admin/students/:id/activate
         */
        activateStudent: builder.mutation({
            query: (id) => ({
                url: `/admin/students/${id}/activate`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Student', id }, 'Student'],
        }),
    }),
});

export const {
    useGenerateLessonsMutation,
    useGenerateLessonContentMutation,
    useCreateTopicMutation,
    useGetTopicsQuery,
    useGetTopicQuery,
    useUpdateTopicMutation,
    useSaveLessonsMutation,
    useSaveLessonContentMutation,
    usePublishTopicMutation,
    useUnpublishTopicMutation,
    useGetPendingQuizResponsesQuery,
    useGetQuizResponsesByStatusQuery,
    useReviewQuizAnswerMutation,
    useGetQuizReviewStatsQuery,
    useGetDashboardDataQuery,
    useGetAnalyticsDataQuery,
    useGetStudentListQuery,
    useGetStudentDetailQuery,
    useSendEmailToStudentMutation,
    useUnlockTopicForStudentMutation,
    useResetAllQuizzesForStudentMutation,
    useSuspendStudentMutation,
    useActivateStudentMutation,
} = adminApi;

