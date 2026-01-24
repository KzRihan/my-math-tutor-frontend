'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';
import { useResetPasswordMutation } from '@/store/authApi';
import { FaCalculator, FaLock, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [error, setError] = useState('');

    // RTK Query mutation hook
    const [resetPassword, { isLoading, isSuccess, isError, error: apiError }] = useResetPasswordMutation();

    // Handle API errors
    useEffect(() => {
        if (isError && apiError) {
            const errorMessage = apiError?.data?.error?.message 
                || apiError?.data?.message 
                || 'Failed to reset password. Please try again.';
            setError(errorMessage);
        }
    }, [isError, apiError]);

    // Redirect on success
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.push('/login?reset=true');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData(e.target);
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            await resetPassword({
                token,
                newPassword,
                confirmPassword,
            }).unwrap();
        } catch (err) {
            console.error('Reset password error:', err);
        }
    };

    // No token provided
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                        <FaCalculator className="text-3xl text-primary-500" />
                        <span className="font-display font-bold text-2xl gradient-text">
                            {APP_NAME}
                        </span>
                    </Link>

                    <Card variant="glassStrong" className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/20 flex items-center justify-center animate-shake">
                            <FaTimesCircle className="text-4xl text-error" />
                        </div>
                        
                        <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
                        <p className="text-foreground-secondary mb-6">
                            This password reset link is invalid or has expired.
                        </p>

                        <Link href="/forgot-password">
                            <Button className="w-full" size="lg">
                                Request New Link
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                        <FaCalculator className="text-3xl text-primary-500" />
                        <span className="font-display font-bold text-2xl gradient-text">
                            {APP_NAME}
                        </span>
                    </Link>

                    <Card variant="glassStrong" className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-bounce-in">
                            <FaCheckCircle className="text-4xl text-success" />
                        </div>
                        
                        <h1 className="text-2xl font-bold mb-4">Password Reset Successful!</h1>
                        <p className="text-foreground-secondary mb-6">
                            Your password has been updated successfully.
                        </p>

                        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20">
                            <p className="text-success font-medium">
                                Redirecting to login...
                            </p>
                        </div>

                        <Link href="/login">
                            <Button className="w-full" size="lg">
                                Go to Login Now
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <FaCalculator className="text-3xl text-primary-500" />
                    <span className="font-display font-bold text-2xl gradient-text">
                        {APP_NAME}
                    </span>
                </Link>

                <Card variant="glassStrong" className="p-8">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                            <FaLock className="text-3xl text-primary-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
                        <p className="text-foreground-secondary text-sm">
                            Create a new strong password for your account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="New Password"
                            type="password"
                            name="newPassword"
                            placeholder="Enter new password (8+ characters)"
                            required
                            minLength={8}
                            icon={<FaLock />}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your new password"
                            required
                            minLength={8}
                            icon={<FaLock />}
                        />

                        <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50">
                            <p className="text-sm text-foreground-secondary">
                                <span className="font-bold text-foreground">Password requirements:</span>
                            </p>
                            <ul className="text-sm text-foreground-secondary mt-2 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span>✓</span> At least 8 characters long
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>✓</span> Mix of letters and numbers recommended
                                </li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={isLoading}
                        >
                            Reset Password
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-foreground-secondary text-sm mt-6">
                    Remember your password?{' '}
                    <Link
                        href="/login"
                        className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
            <div className="w-full max-w-md relative z-10">
                <Card variant="glassStrong" className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FaLock className="text-3xl text-primary-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p className="text-foreground-secondary">Please wait...</p>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
