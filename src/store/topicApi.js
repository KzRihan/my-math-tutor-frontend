/**
 * Topic API - RTK Query
 * 
 * RTK Query API slice for public topic operations.
 * These endpoints are accessible without authentication and only return published topics.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * Topic API slice
 * Provides endpoints for fetching published topics
 */
export const topicApi = createApi({
    reducerPath: 'topicApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Topic'],
    endpoints: (builder) => ({
        /**
         * Get all published topics
         * GET /topics?page=1&limit=20&gradeBand=primary&search=...
         */
        getPublishedTopics: builder.query({
            query: (params = {}) => {
                const { page = 1, limit = 20, gradeBand, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
                const queryParams = new URLSearchParams();
                if (page) queryParams.append('page', page.toString());
                if (limit) queryParams.append('limit', limit.toString());
                if (gradeBand) queryParams.append('gradeBand', gradeBand);
                if (search) queryParams.append('search', search);
                if (sortBy) queryParams.append('sortBy', sortBy);
                if (sortOrder) queryParams.append('sortOrder', sortOrder);
                
                return `/topics?${queryParams.toString()}`;
            },
            providesTags: ['Topic'],
        }),

        /**
         * Get a published topic by ID
         * GET /topics/:id
         */
        getPublishedTopic: builder.query({
            query: (id) => `/topics/${id}`,
            providesTags: (result, error, id) => [{ type: 'Topic', id }],
        }),
    }),
});

export const {
    useGetPublishedTopicsQuery,
    useGetPublishedTopicQuery,
    useLazyGetPublishedTopicQuery,
} = topicApi;


