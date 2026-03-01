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
  tagTypes: ['QuestionResponse'],
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
      invalidatesTags: ['QuestionResponse'],
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
      providesTags: ['QuestionResponse'],
      refetchOnMountOrArgChange: true,
    }),
  }),
});

// Export hooks
export const {
  useSubmitAnswerMutation,
  useGetUserHistoryQuery,
  useGetTopicStatsQuery,
} = questionApi;


