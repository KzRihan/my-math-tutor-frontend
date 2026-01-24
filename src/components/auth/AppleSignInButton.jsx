'use client';

/**
 * Apple Sign-In Button Component
 * 
 * Uses Apple Sign-In JS SDK for web authentication.
 * Only visible on Apple devices (iOS, macOS, iPad).
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';

// Apple Sign-In configuration from environment
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/auth/apple/callback` : '');

/**
 * Detect if the user is on an iOS device
 */
function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  // Check for iOS devices (iPhone, iPad, iPod)
  // Also check for iPad in desktop mode (iPadOS 13+)
  return /iphone|ipad|ipod/.test(userAgent) ||
    (platform === 'macintel' && navigator.maxTouchPoints > 1);
}

export default function AppleSignInButton({ className = '', forceShow = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // Check device and set visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Show on iOS devices or if forceShow is true (for testing)
      setIsVisible(forceShow || isIOS());
    }
  }, [forceShow]);

  // Load Apple Sign-In script
  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    // Check if script already loaded
    if (window.AppleID) {
      setIsScriptLoaded(true);
      return;
    }

    // Load the Apple Sign-In script
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initializeAppleSignIn();
    };
    script.onerror = () => {
      console.error('Failed to load Apple Sign-In script');
    };

    document.head.appendChild(script);
  }, [isVisible]);

  // Initialize Apple Sign-In
  const initializeAppleSignIn = useCallback(() => {
    if (!window.AppleID || !APPLE_CLIENT_ID) return;

    try {
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: APPLE_REDIRECT_URI,
        state: generateState(),
        usePopup: true,
      });
    } catch (error) {
      console.error('Failed to initialize Apple Sign-In:', error);
    }
  }, []);

  // Generate random state for CSRF protection
  const generateState = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // Handle Apple Sign-In button click
  const handleAppleSignIn = async () => {
    if (!APPLE_CLIENT_ID) {
      toast.error('Apple Sign-In is not configured');
      console.error('NEXT_PUBLIC_APPLE_CLIENT_ID is not set');
      return;
    }

    if (!isScriptLoaded || !window.AppleID) {
      toast.error('Apple Sign-In is loading, please try again');
      return;
    }

    // Prevent multiple clicks
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Trigger Apple Sign-In popup
      const response = await window.AppleID.auth.signIn();

      if (response.authorization) {
        // Send to backend for verification
        await handleAppleCallback(response);
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);

      // Handle various cancellation scenarios
      if (error.error === 'popup_closed_by_user' ||
        error.error === 'user_cancelled_authorize' ||
        error.error === 'canceled') {
        // User closed the popup - don't show error, just reset loading
        setIsLoading(false);
        return;
      }

      toast.error('Apple Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle Apple callback/response
  const handleAppleCallback = async (response) => {
    try {
      const { authorization, user } = response;

      // Call our backend with Apple credentials
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/apple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: authorization.id_token,
          authorizationCode: authorization.code,
          user: user ? {
            email: user.email,
            name: user.name ? {
              firstName: user.name.firstName,
              lastName: user.name.lastName,
            } : undefined,
          } : undefined,
          deviceType: 'web',
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        // Store tokens
        const { tokens, user: userData } = result.data;
        if (typeof window !== 'undefined') {
          if (tokens?.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
          if (tokens?.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
          if (userData) localStorage.setItem('user', JSON.stringify(userData));
        }

        toast.success(result.data.isNewUser
          ? 'Welcome! Your account has been created.'
          : 'Welcome back!'
        );

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        throw new Error(result.error?.message || 'Apple Sign-In failed');
      }
    } catch (error) {
      console.error('Apple Sign-In API error:', error);
      toast.error(error.message || 'Apple Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not on Apple device (unless forceShow)
  if (!isVisible) {
    return null;
  }

  // Show unconfigured state
  if (!APPLE_CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() => toast.error('Apple Sign-In is not configured')}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 ${className}`}
      >
        <AppleIcon />
        <span className="font-medium">Apple</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 px-4 py-3 rounded-xl
        bg-black text-white border border-black
        hover:bg-neutral-800 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-100
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-neutral-500 border-t-white dark:border-t-black rounded-full animate-spin" />
      ) : (
        <AppleIcon />
      )}
      <span className="font-medium">
        {isLoading ? 'Signing in...' : 'Apple'}
      </span>
    </button>
  );
}

// Apple Icon Component
function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
