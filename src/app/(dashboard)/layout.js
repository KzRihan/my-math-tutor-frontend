'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import LearningLevelModal from '@/components/modals/LearningLevelModal';
import StreakPopupModal from '@/components/modals/StreakPopupModal';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { useGetMeQuery, useGetUserProgressQuery, useMarkStreakPopupDisplayedMutation } from '@/store/userApi';
import { logout } from '@/store/authSlice';

export default function DashboardLayout({ children }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [showStreakPopup, setShowStreakPopup] = useState(false);
    const [streakInfo, setStreakInfo] = useState(null);

    // Fetch latest user data when on dashboard
    const { data: userData, isLoading: isUserLoading, error } = useGetMeQuery(undefined, {
        skip: !isAuthenticated
    });

    // Fetch progress data to trigger streak update and popup
    // This ensures streak is updated and popup can show after login
    const { data: progressData } = useGetUserProgressQuery(undefined, {
        skip: !isAuthenticated,
        // Refetch on mount to ensure streak is updated when user lands on dashboard
        refetchOnMountOrArgChange: true,
    });

    // Mutation to mark streak popup as displayed
    const [markStreakPopupDisplayed] = useMarkStreakPopupDisplayedMutation();

    // Show streak popup when shouldDisplay is true (only once per day)
    useEffect(() => {
        // Debug logging
        if (progressData?.data) {
            console.log('Dashboard Layout Progress Data:', {
                streakPopup: progressData.data.streakPopup,
                streakInfo: progressData.data.streakInfo,
                shouldDisplay: progressData.data.streakPopup?.shouldDisplay,
                isDisplayed: progressData.data.streakPopup?.isDisplayed,
            });
        }

        if (progressData?.data?.streakPopup?.shouldDisplay && !showStreakPopup) {
            console.log('Showing streak popup in layout!', progressData.data.streakInfo);
            setStreakInfo(progressData.data.streakInfo);
            setShowStreakPopup(true);
        }
    }, [progressData, showStreakPopup]);

    // Auto-close popup after 3-5 seconds and mark as displayed
    useEffect(() => {
        if (showStreakPopup && streakInfo) {
            // Random delay between 3-5 seconds (3000-5000ms)
            const delay = 3000 + Math.random() * 2000;
            
            const timer = setTimeout(async () => {
                // Mark as displayed in backend
                try {
                    await markStreakPopupDisplayed().unwrap();
                } catch (error) {
                    console.error('Failed to mark streak popup as displayed:', error);
                }
                // Close popup
                setShowStreakPopup(false);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [showStreakPopup, streakInfo, markStreakPopupDisplayed]);

    // Handle manual close - also mark as displayed
    const handleCloseStreakPopup = async () => {
        try {
            await markStreakPopupDisplayed().unwrap();
        } catch (error) {
            console.error('Failed to mark streak popup as displayed:', error);
        }
        setShowStreakPopup(false);
    };

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

    // Use current user from state or freshly fetched user
    const currentUser = userData?.data || user;

    // Show modal if user is logged in but hasn't set their learning level
    const showLearningLevelModal = isAuthenticated && currentUser && !currentUser.learnLevel;

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

                {/* Mandatory Learning Level Selection */}
                <LearningLevelModal isOpen={showLearningLevelModal} user={user} />

                {/* Streak Popup Modal - Shows after login when progress is fetched */}
                <StreakPopupModal
                    isOpen={showStreakPopup}
                    onClose={handleCloseStreakPopup}
                    previousStreak={streakInfo?.previousStreak || 0}
                    newStreak={streakInfo?.newStreak || 0}
                />
            </div>
        </ThemeProvider>
    );
}

