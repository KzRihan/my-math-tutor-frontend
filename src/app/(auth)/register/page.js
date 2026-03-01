'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import AppleSignInButton from '@/components/auth/AppleSignInButton';
import { APP_NAME } from '@/lib/constants';
import { useSignupMutation } from '@/store/authApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaCalculator, FaEnvelope, FaLock } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState('');

  // RTK Query mutation hook
  const [signup, { isLoading, isSuccess, isError, error: apiError }] = useSignupMutation();

  // Handle API errors
  useEffect(() => {
    if (isError && apiError) {
      const errorMessage = apiError?.data?.error?.message
        || apiError?.data?.message
        || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [isError, apiError]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Account created! Please check your email to verify your account.');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    }
  }, [isSuccess, router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const form = e.target;

    try {
      await signup({
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        password: form.password.value,
        deviceType: 'web',
      }).unwrap();
    } catch (err) {
      const errorMessage = err?.data?.error?.message
        || err?.data?.message
        || err?.message
        || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg-mesh">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <FaCalculator className="text-3xl text-primary-500" />
          <span className="font-display font-bold text-2xl gradient-text">
            {APP_NAME}
          </span>
        </Link>

        {/* Register Card */}
        <Card variant="glassStrong" className="p-8">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-foreground-secondary">
              Start your journey to math mastery
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Doe"
                required
              />
            </div>

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
              placeholder="Create a strong password (8+ chars)"
              required
              minLength={8}
              icon={<FaLock />}
            />

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Social Login */}
          <div className="grid grid-cols-1 gap-3 mt-8">
            <AppleSignInButton className="w-full" />
          </div>

          {/* Sign In Link */}
          <p className="text-center text-foreground-secondary text-sm mt-8">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>

      </div>
    </div>
  );
}
