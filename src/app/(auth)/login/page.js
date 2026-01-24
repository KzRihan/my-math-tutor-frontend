'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AppleSignInButton from '@/components/auth/AppleSignInButton';
import { APP_NAME } from '@/lib/constants';
import { useSigninMutation } from '@/store/authApi';
import { useToast } from '@/components/providers/ToastProvider';
import { initializeAuth } from '@/store/authSlice';
import { FaCalculator, FaEnvelope, FaLock } from 'react-icons/fa';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const toast = useToast();
    const { isAuthenticated, isLoading: authLoading } = useSelector((state) => state.auth);
    const [error, setError] = useState('');
    const justRegistered = searchParams.get('registered') === 'true';
    const passwordReset = searchParams.get('reset') === 'true';
    const [showApple, setShowApple] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Check if already authenticated IMMEDIATELY on mount - synchronous check
    const [shouldShowPage, setShouldShowPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');
            if (token && user) {
                try {
                    JSON.parse(user);
                    return false; // Don't show page, will redirect
                } catch (e) {
                    // Invalid data, clear it
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
        }
        return true; // Show the login page
    });

    // Redirect immediately if already authenticated (runs on mount)
    useEffect(() => {
        if (typeof window !== 'undefined' && !isRedirecting) {
            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');

            if (token && user) {
                try {
                    JSON.parse(user);
                    setIsRedirecting(true);
                    setShouldShowPage(false);
                    router.replace('/dashboard');
                    return;
                } catch (e) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setShouldShowPage(true);
                }
            }
        }
    }, [router, isRedirecting]);

    // Also redirect if Redux state shows authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading && !isRedirecting) {
            setIsRedirecting(true);
            setShouldShowPage(false);
            router.replace('/dashboard');
        }
    }, [isAuthenticated, authLoading, router, isRedirecting]);

    // Detect iOS on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userAgent = navigator.userAgent.toLowerCase();
            const platform = navigator.platform?.toLowerCase() || '';
            const isIOS = /iphone|ipad|ipod/.test(userAgent) ||
                (platform === 'macintel' && navigator.maxTouchPoints > 1);
            setShowApple(isIOS);
        }
    }, []);

    // RTK Query mutation hook
    const [signin, { isLoading, isSuccess, isError, error: apiError }] = useSigninMutation();

    // Show toast for URL params on mount
    useEffect(() => {
        if (justRegistered) {
            toast.success('Account created! Please check your email to verify your account before signing in.');
        }
        if (passwordReset) {
            toast.success('Password reset successful! You can now sign in with your new password.');
        }
    }, [justRegistered, passwordReset, toast]);

    // Handle API errors
    useEffect(() => {
        if (isError && apiError) {
            const errorMessage = apiError?.data?.error?.message
                || apiError?.data?.message
                || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    }, [isError, apiError, toast]);

    // Redirect on success - wait for auth state to be updated
    useEffect(() => {
        if (isSuccess && !isRedirecting) {
            setIsRedirecting(true);

            // Wait a moment for localStorage to be populated by authApi
            const performRedirect = () => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('accessToken');
                    const user = localStorage.getItem('user');

                    if (token && user) {
                        try {
                            JSON.parse(user);
                            // Re-initialize auth state to sync Redux with localStorage
                            dispatch(initializeAuth());
                            toast.success('Welcome back! Redirecting to dashboard...');
                            // Use a small delay to ensure Redux state is updated
                            setTimeout(() => {
                                router.replace('/dashboard');
                            }, 100);
                            return;
                        } catch (e) {
                            console.error('Invalid user data in localStorage:', e);
                        }
                    }

                    // Retry if tokens not found yet (max 15 retries = 1.5 seconds)
                    const retryCount = performRedirect.retryCount || 0;
                    if (retryCount < 15) {
                        performRedirect.retryCount = retryCount + 1;
                        setTimeout(performRedirect, 100);
                    } else {
                        console.error('Login redirect timeout - tokens not found');
                        setIsRedirecting(false);
                        toast.error('Login succeeded but redirect failed. Please try again.');
                    }
                }
            };

            // Start checking after a brief delay
            setTimeout(performRedirect, 200);
        }
    }, [isSuccess, router, toast, isRedirecting, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsRedirecting(false);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await signin({
                email,
                password,
                deviceType: 'web',
            }).unwrap();
            // The useEffect watching isSuccess will handle the redirect
        } catch (err) {
            console.error('Login error details:', err);
            setIsRedirecting(false);
        }
    };

    // If already authenticated, show nothing while redirecting (instant redirect)
    if (!shouldShowPage) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <FaCalculator className="text-3xl text-primary-500" />
                    <span className="font-display font-bold text-2xl gradient-text">
                        {APP_NAME}
                    </span>
                </Link>

                {/* Login Card */}
                <Card variant="glassStrong" className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
                        <p className="text-foreground-secondary">
                            Sign in to continue your learning journey
                        </p>
                    </div>

                    {/* Success message for just registered users */}
                    {justRegistered && (
                        <div className="mb-6 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                            Account created! Please check your email to verify your account before signing in.
                        </div>
                    )}

                    {/* Success message for password reset */}
                    {passwordReset && (
                        <div className="mb-6 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                            Password reset successful! You can now sign in with your new password.
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            icon={<FaEnvelope />}
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            icon={<FaLock />}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="remember" className="rounded border-neutral-300" />
                                <span className="text-foreground-secondary">Remember me</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--card-border)]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[var(--card-bg)] text-foreground-secondary">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className={showApple ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
                        <GoogleSignInButton className="w-full" />
                        <AppleSignInButton className="w-full" />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-foreground-secondary text-sm mt-8">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Sign up free
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
                <div className="animate-pulse text-foreground-secondary">Loading...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
