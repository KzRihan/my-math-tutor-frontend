/**
 * User API - RTK Query
 * 
 * RTK Query API slice for user-related operations.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * User API slice
 */
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/users`,
    prepareHeaders: (headers, { endpoint }) => {
      // Get token from localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      // Don't set Content-Type for file uploads - browser will set it with boundary
      if (endpoint !== 'updateProfile') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'UserProgress', 'UserXP'],
  endpoints: (builder) => ({
    /**
     * Get current user profile
     * GET /users/me
     */
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User', 'UserXP'],
      // Refetch when component mounts to get latest XP/level
      refetchOnMountOrArgChange: true,
    }),

    /**
     * Update user profile (with optional file upload)
     * PATCH /users/me
     */
    updateProfile: builder.mutation({
      query: (data) => {
        // If data is already FormData, use it directly
        // Otherwise, create FormData from the object
        let body;
        if (data instanceof FormData) {
          body = data;
        } else {
          body = new FormData();
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              body.append(key, data[key]);
            }
          });
        }
        return {
          url: '/me',
          method: 'PATCH',
          body,
          // Don't convert to JSON for file uploads
          formData: true,
        };
      },
      invalidatesTags: ['User'],
      // Update the user in localStorage and potentially state
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(data.data));
            }
          }
        } catch {
          // Error handling is done by the component
        }
      },
    }),

    /**
     * Get current user's progress stats
     * GET /users/me/progress
     */
    getUserProgress: builder.query({
      query: () => '/me/progress',
      providesTags: ['User', 'UserProgress'],
    }),

    /**
     * Mark streak popup as displayed
     * POST /users/me/mark-streak-popup
     */
    markStreakPopupDisplayed: builder.mutation({
      query: () => ({
        url: '/me/mark-streak-popup',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'UserProgress'],
    }),
  }),
});

// Export hooks
export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetUserProgressQuery,
  useMarkStreakPopupDisplayedMutation,
} = userApi;

