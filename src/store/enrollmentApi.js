/**
 * Enrollment API - RTK Query
 * 
 * RTK Query API slice for enrollment operations.
 * Handles course enrollment and progress tracking.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * Enrollment API slice
 * Provides endpoints for enrollment and progress tracking
 */
export const enrollmentApi = createApi({
    reducerPath: 'enrollmentApi',
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
    tagTypes: ['Enrollment', 'Progress'],
    endpoints: (builder) => ({
        /**
         * Enroll user in a topic
         * POST /enrollments
         */
        enrollInTopic: builder.mutation({
            query: (topicId) => ({
                url: '/enrollments',
                method: 'POST',
                body: { topicId },
            }),
            invalidatesTags: ['Enrollment', 'Progress'],
        }),

        /**
         * Get user enrollment for a specific topic
         * GET /enrollments/topic/:topicId
         */
        getEnrollment: builder.query({
            query: (topicId) => `/enrollments/topic/${topicId}`,
            providesTags: (result, error, topicId) => [{ type: 'Enrollment', id: topicId }],
        }),

        /**
         * Get all user enrollments
         * GET /enrollments
         */
        getUserEnrollments: builder.query({
            query: (status) => {
                const params = status ? `?status=${status}` : '';
                return `/enrollments${params}`;
            },
            providesTags: ['Enrollment'],
        }),

        /**
         * Update lesson progress
         * PUT /enrollments/:id/lesson-progress
         */
        updateLessonProgress: builder.mutation({
            query: ({ enrollmentId, lessonId, status, timeSpent }) => ({
                url: `/enrollments/${enrollmentId}/lesson-progress`,
                method: 'PUT',
                body: {
                    lessonId,
                    status,
                    timeSpent,
                },
            }),
            invalidatesTags: (result, error, { enrollmentId }) => [
                { type: 'Enrollment', id: enrollmentId },
                'Progress',
            ],
        }),

        /**
         * Unenroll from a topic
         * DELETE /enrollments/topic/:topicId
         */
        unenrollFromTopic: builder.mutation({
            query: (topicId) => ({
                url: `/enrollments/topic/${topicId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Enrollment', 'Progress'],
        }),
    }),
});

export const {
    useEnrollInTopicMutation,
    useGetEnrollmentQuery,
    useLazyGetEnrollmentQuery,
    useGetUserEnrollmentsQuery,
    useUpdateLessonProgressMutation,
    useUnenrollFromTopicMutation,
} = enrollmentApi;


