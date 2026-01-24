'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { APP_NAME } from '@/lib/constants';
import { useVerifyEmailMutation } from '@/store/authApi';
import { FaCalculator, FaTimesCircle, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [countdown, setCountdown] = useState(5);

    // RTK Query mutation hook
    const [verifyEmail, { isLoading, isSuccess, isError, error: apiError }] = useVerifyEmailMutation();

    // Verify email on component mount
    useEffect(() => {
        if (token) {
            verifyEmail({ token });
        }
    }, [token, verifyEmail]);

    // Countdown and redirect on success
    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isSuccess && countdown === 0) {
            router.push('/login');
        }
    }, [isSuccess, countdown, router]);

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
                        <span className="text-3xl">🧮</span>
                        <span className="font-display font-bold text-2xl gradient-text">
                            {APP_NAME}
                        </span>
                    </Link>

                    <Card variant="glassStrong" className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/20 flex items-center justify-center animate-shake">
                            <span className="text-4xl">❌</span>
                        </div>

                        <h1 className="text-2xl font-bold mb-4">Invalid Verification Link</h1>
                        <p className="text-foreground-secondary mb-6">
                            No verification token was provided. Please check your email for the correct link.
                        </p>

                        <Link href="/login">
                            <Button className="w-full" size="lg">
                                Back to Login
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                        <FaCalculator className="text-3xl text-primary-500" />
                        <span className="font-display font-bold text-2xl gradient-text">
                            {APP_NAME}
                        </span>
                    </Link>

                    <Card variant="glassStrong" className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaEnvelope className="text-3xl text-primary-500" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
                        <p className="text-foreground-secondary">
                            Please wait while we verify your email address.
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        const errorMessage = apiError?.data?.error?.message
            || apiError?.data?.message
            || 'Failed to verify email. The link may be invalid or expired.';

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

                        <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
                        <p className="text-foreground-secondary mb-6">
                            {errorMessage}
                        </p>

                        <div className="space-y-3">
                            <Link href="/login">
                                <Button className="w-full" size="lg">
                                    Back to Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="secondary" className="w-full" size="lg">
                                    Create New Account
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
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

                    <h1 className="text-2xl font-bold mb-4">Email Verified!</h1>
                    <p className="text-foreground-secondary mb-6">
                        Your email has been verified successfully. You can now sign in to your account.
                    </p>

                    <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-success font-medium">
                            Redirecting to login in {countdown} seconds...
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

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
            <div className="w-full max-w-md relative z-10">
                <Card variant="glassStrong" className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p className="text-foreground-secondary">Please wait...</p>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
