/**
 * Achievement API - RTK Query
 * 
 * RTK Query API slice for achievement-related operations.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Achievement API slice
 */
export const achievementApi = createApi({
  reducerPath: 'achievementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/achievements`,
    prepareHeaders: (headers) => {
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
  tagTypes: ['Achievement'],
  endpoints: (builder) => ({
    /**
     * Get current user's achievements
     * GET /achievements/me
     */
    getMyAchievements: builder.query({
      query: () => '/me',
      providesTags: ['Achievement'],
    }),
  }),
});

// Export hooks
export const {
  useGetMyAchievementsQuery,
} = achievementApi;

