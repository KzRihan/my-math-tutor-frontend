/**
 * Auth API - RTK Query
 * 
 * RTK Query API slice for authentication endpoints.
 * Provides auto-generated hooks for all auth operations.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for API - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

/**
 * Auth API slice
 * Provides endpoints for authentication operations
 */
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/auth`,
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
    tagTypes: ['User'],
    endpoints: (builder) => ({
        /**
         * User signup (registration)
         * POST /auth/signup
         */
        signup: builder.mutation({
            query: (credentials) => ({
                url: '/signup',
                method: 'POST',
                body: credentials,
            }),
        }),

        /**
         * User signin (login)
         * POST /auth/signin
         */
        signin: builder.mutation({
            query: (credentials) => ({
                url: '/signin',
                method: 'POST',
                body: credentials,
            }),
            // Store tokens and user on successful login
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        const { user, tokens } = data.data;
                        const { accessToken, refreshToken } = tokens || {};

                        if (typeof window !== 'undefined') {
                            if (accessToken) localStorage.setItem('accessToken', accessToken);
                            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                            if (user) localStorage.setItem('user', JSON.stringify(user));
                        }
                    }
                } catch {
                    // Error handling is done by the component
                }
            },
        }),

        /**
         * Google signin (social login)
         * POST /auth/google
         */
        googleSignin: builder.mutation({
            query: (data) => ({
                url: '/google',
                method: 'POST',
                body: data,
            }),
            // Store tokens and user on successful login
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        const { user, tokens } = data.data;
                        const { accessToken, refreshToken } = tokens || {};

                        if (typeof window !== 'undefined') {
                            if (accessToken) localStorage.setItem('accessToken', accessToken);
                            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                            if (user) localStorage.setItem('user', JSON.stringify(user));
                        }
                    }
                } catch {
                    // Error handling is done by the component
                }
            },
        }),

        /**
         * Verify email with token
         * POST /auth/verify-email
         */
        verifyEmail: builder.mutation({
            query: (data) => ({
                url: '/verify-email',
                method: 'POST',
                body: data,
            }),
        }),

        /**
         * Request password reset
         * POST /auth/forgot-password
         */
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: '/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),

        /**
         * Reset password with token
         * POST /auth/reset-password
         */
        resetPassword: builder.mutation({
            query: (data) => ({
                url: '/reset-password',
                method: 'POST',
                body: data,
            }),
        }),

        /**
         * Resend verification email
         * POST /auth/resend-verification
         */
        resendVerification: builder.mutation({
            query: (data) => ({
                url: '/resend-verification',
                method: 'POST',
                body: data,
            }),
        }),

        /**
         * User logout
         * POST /api/v1/auth/logout
         */
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            // Clear tokens and user on logout
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        localStorage.removeItem('adminToken');
                    }
                } catch {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        localStorage.removeItem('adminToken');
                    }
                }
            },
        }),

        /**
         * Admin signin (login)
         * POST /admin/auth/signin
         * Only for users with ADMIN or SUPER_ADMIN role
         */
        adminSignin: builder.mutation({
            query: (credentials) => ({
                url: `${API_BASE_URL}/admin/auth/signin`,
                method: 'POST',
                body: credentials,
            }),
            // Store tokens and user on successful admin login
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.data) {
                        const { user, tokens } = data.data;
                        const { accessToken, refreshToken } = tokens || {};

                        if (typeof window !== 'undefined') {
                            if (accessToken) localStorage.setItem('accessToken', accessToken);
                            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                            if (user) localStorage.setItem('user', JSON.stringify(user));
                            // Set admin token flag
                            localStorage.setItem('adminToken', 'true');
                        }
                    }
                } catch {
                    // Error handling is done by the component
                }
            },
        }),
    }),
});

// Export hooks for usage in components
export const {
    useSignupMutation,
    useSigninMutation,
    useGoogleSigninMutation,
    useVerifyEmailMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useResendVerificationMutation,
    useLogoutMutation,
    useAdminSigninMutation,
} = authApi;

