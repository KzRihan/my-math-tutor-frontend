'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { useGetMeQuery } from '@/store/userApi';
import { logout } from '@/store/authSlice';

export default function DashboardLayout({ children }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    // Fetch latest user data when on dashboard
    const { error } = useGetMeQuery(undefined, {
        skip: !isAuthenticated
    });

    // Check authentication and redirect if not authenticated
    useEffect(() => {
        // Check if localStorage has been initialized
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');

            // If we have token and user in localStorage, allow access
            // Don't redirect immediately - wait for Redux state to sync
            if (token && user) {
                try {
                    JSON.parse(user); // Verify it's valid JSON
                    setAuthChecked(true);
                    return;
                } catch (e) {
                    // Invalid user data, continue to check auth
                    console.warn('Invalid user data in localStorage');
                }
            }

            // Only redirect if we're sure there's no auth
            if (!token && !isAuthenticated) {
                // Longer delay to allow Redux state to initialize and login to complete
                const timer = setTimeout(() => {
                    // Re-check localStorage in case login just completed
                    const currentToken = localStorage.getItem('accessToken');
                    const currentUser = localStorage.getItem('user');
                    
                    if (currentToken && currentUser) {
                        // Token appeared, user just logged in
                        setAuthChecked(true);
                    } else if (!isAuthenticated) {
                        // Still no auth, redirect to login
                        router.replace('/login');
                    } else {
                        setAuthChecked(true);
                    }
                }, 300); // Increased from 100ms to 300ms
                return () => clearTimeout(timer);
            }

            setAuthChecked(true);
        }
    }, [isAuthenticated, router]);

    // Handle API errors (like jwt expired) - but only for actual auth errors
    useEffect(() => {
        if (error && authChecked) {
            // Check if it's a real auth error (401 or jwt expired)
            const isAuthError = error.status === 401 ||
                (error.data?.error?.message && (
                    error.data.error.message.includes('jwt expired') ||
                    error.data.error.message.includes('No authentication token') ||
                    error.data.error.message.includes('Invalid token') ||
                    error.data.error.message.includes('Unauthorized')
                ));

            // Only logout if it's a confirmed auth error AND we've checked auth
            if (isAuthError) {
                console.log('Auth error detected, logging out:', error);
                // Clear auth state and redirect to login
                dispatch(logout());
                router.replace('/login');
            }
            // For other errors (network, 500, etc.), don't logout - just log
            else if (error.status !== undefined) {
                console.warn('API error (non-auth):', error);
            }
        }
    }, [error, dispatch, router, authChecked]);

    // Show loading while checking auth
    if (!authChecked) {
        return (
            <div className="fixed inset-0 bg-background-secondary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <div className="fixed inset-0 bg-background-secondary text-foreground">
                {/* Desktop Sidebar - Fixed */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Main Content - Scrollable */}
                <main className="fixed inset-0 lg:left-64 overflow-y-auto pb-20 lg:pb-0">
                    {children}
                </main>

                {/* Mobile Navigation */}
                <MobileNav />

            </div>
        </ThemeProvider>
    );
}

