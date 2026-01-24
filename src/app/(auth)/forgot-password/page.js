'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';
import { useForgotPasswordMutation } from '@/store/authApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaCalculator, FaEnvelope, FaKey, FaLightbulb, FaEnvelopeOpen } from 'react-icons/fa';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const toast = useToast();

    // RTK Query mutation hook
    const [forgotPassword, { isLoading, isSuccess, isError, error: apiError }] = useForgotPasswordMutation();

    // Handle API errors
    useEffect(() => {
        if (isError && apiError) {
            const errorMessage = apiError?.data?.error?.message 
                || apiError?.data?.message 
                || 'Failed to send reset email. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    }, [isError, apiError]);

    // Show success toast
    useEffect(() => {
        if (isSuccess) {
            toast.success('Password reset email sent! Check your inbox.');
        }
    }, [isSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await forgotPassword({ email }).unwrap();
        } catch (err) {
            console.error('Forgot password error:', err);
        }
    };

    // Show success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
                {/* Background decorations */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                        <FaCalculator className="text-3xl text-primary-500" />
                        <span className="font-display font-bold text-2xl gradient-text">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Success Card */}
                    <Card variant="glassStrong" className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-bounce-in">
                            <FaEnvelopeOpen className="text-4xl text-success" />
                        </div>
                        
                        <h1 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                            Check your email! <FaEnvelope className="text-primary-500" />
                        </h1>
                        <p className="text-foreground-secondary mb-2">
                            We&apos;ve sent password reset instructions to
                        </p>
                        <p className="font-bold text-primary-600 mb-6">{email || 'your email'}</p>
                        
                        <div className="mb-6 p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50">
                            <p className="text-sm text-foreground-secondary flex items-center gap-2">
                                <FaLightbulb className="text-primary-500 flex-shrink-0" />
                                <span><span className="font-bold text-foreground">Tip:</span> Check your spam folder if you don&apos;t see the email within a few minutes!</span>
                            </p>
                        </div>

                        <Link href="/login">
                            <Button variant="primary" className="w-full" size="lg">
                                Back to Login
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        );
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

                {/* Forgot Password Card */}
                <Card variant="glassStrong" className="p-8">
                    {/* Back button */}
                    <Link 
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground mb-6 font-medium transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to login
                    </Link>

                    <div className="mb-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                            <FaKey className="text-3xl text-primary-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-center">Forgot your password?</h1>
                        <p className="text-foreground-secondary text-center text-sm">
                            No worries! Enter your email and we&apos;ll send you reset instructions.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={<FaEnvelope />}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={isLoading}
                        >
                            Send Reset Link
                        </Button>
                    </form>

                    {/* Help text */}
                    <div className="mt-8 p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50">
                        <p className="text-sm text-foreground-secondary text-center flex items-center gap-2">
                            <FaLightbulb className="text-primary-500 flex-shrink-0" />
                            <span><span className="font-bold text-foreground">Tip:</span> Remember to check your spam folder if you don&apos;t see the email within a few minutes!</span>
                        </p>
                    </div>
                </Card>

                {/* Additional Help */}
                <p className="text-center text-foreground-secondary text-sm mt-6">
                    Just remembered your password?{' '}
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
