/**
 * Question API - RTK Query
 * 
 * RTK Query API slice for question response operations.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * Question API slice
 */
export const questionApi = createApi({
  reducerPath: 'questionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/questions`,
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
  tagTypes: ['QuestionResponse', 'XP', 'UserXP'],
  endpoints: (builder) => ({
    /**
     * Submit answer to a practice question
     * POST /questions/submit
     */
    submitAnswer: builder.mutation({
      query: (data) => ({
        url: '/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        'QuestionResponse',
        { type: 'XP', id: `lesson-${arg.topicId}-${arg.lessonId}` },
        { type: 'XP', id: `topic-${arg.topicId}` },
        'UserXP', // Invalidate user XP to trigger refetch
        'User', // Invalidate user data to update XP/level
      ],
    }),

    /**
     * Get lesson XP summary
     * GET /questions/lesson/:topicId/:lessonId/summary
     */
    getLessonXPSummary: builder.query({
      query: ({ topicId, lessonId }) => `/lesson/${topicId}/${lessonId}/summary`,
      providesTags: (result, error, { topicId, lessonId }) => [
        { type: 'XP', id: `lesson-${topicId}-${lessonId}` },
      ],
      // Refetch when component mounts or args change
      refetchOnMountOrArgChange: true,
    }),

    /**
     * Get XP configuration
     * GET /questions/xp-config
     */
    getXPConfig: builder.query({
      query: () => '/xp-config',
      providesTags: ['XP'],
    }),

    /**
     * Get user's question history
     * GET /questions/history
     */
    getUserHistory: builder.query({
      query: (limit = 50) => `/history?limit=${limit}`,
      providesTags: ['QuestionResponse'],
      // Refetch when component mounts to get latest history
      refetchOnMountOrArgChange: true,
    }),

    /**
     * Get topic statistics
     * GET /questions/topic/:topicId/stats
     */
    getTopicStats: builder.query({
      query: (topicId) => `/topic/${topicId}/stats`,
      providesTags: (result, error, topicId) => [
        { type: 'XP', id: `topic-${topicId}` },
      ],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

// Export hooks
export const {
  useSubmitAnswerMutation,
  useGetLessonXPSummaryQuery,
  useGetXPConfigQuery,
  useGetUserHistoryQuery,
  useGetTopicStatsQuery,
} = questionApi;


