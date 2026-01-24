'use client';

/**
 * Google Sign-In Button Component
 * 
 * Uses Google's OAuth 2.0 implicit flow for reliable popup-based sign-in.
 * Opens a popup window for Google authentication.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleSigninMutation } from '@/store/authApi';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';

// Google Client ID from environment
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ className = '' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [googleSignin] = useGoogleSigninMutation();
  const toast = useToast();
  const router = useRouter();
  const googleClientRef = useRef(null);

  // Load Google Sign-In script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already loaded
    if (window.google?.accounts) {
      setIsScriptLoaded(true);
      initializeGoogleClient();
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initializeGoogleClient();
    };
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      toast.error('Failed to load Google Sign-In');
    };

    document.head.appendChild(script);
  }, []);

  // Initialize Google OAuth client for popup flow
  const initializeGoogleClient = useCallback(() => {
    if (!window.google?.accounts?.oauth2 || !GOOGLE_CLIENT_ID) return;

    try {
      // Initialize for ID token (implicit flow)
      googleClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        ux_mode: 'popup',
        callback: handleAuthCallback,
      });
    } catch (error) {
      console.error('Failed to initialize Google client:', error);
    }
  }, []);

  // Handle OAuth callback
  const handleAuthCallback = useCallback(async (response) => {
    if (response.error) {
      console.error('Google auth error:', response.error);
      toast.error('Google Sign-In was cancelled');
      setIsLoading(false);
      return;
    }

    // For code flow, we'd need to exchange code for tokens on backend
    // Instead, let's use the ID token flow
    console.log('Auth response received');
    setIsLoading(false);
  }, [toast]);

  // Handle Google callback for ID token
  const handleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error('Google Sign-In failed: No credential received');
      setIsLoading(false);
      return;
    }

    try {
      // Call our backend with the Google ID token
      const result = await googleSignin({
        idToken: response.credential,
        deviceType: 'web',
      }).unwrap();

      if (result.success) {
        toast.success(result.data.isNewUser
          ? 'Welcome! Your account has been created.'
          : 'Welcome back!'
        );

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Google Sign-In API error:', error);
      const errorMessage = error?.data?.error?.message || 'Google Sign-In failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [googleSignin, toast, router]);

  // Handle button click - open Google popup
  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.');
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
      return;
    }

    if (!isScriptLoaded || !window.google?.accounts) {
      toast.error('Google Sign-In is loading, please try again in a moment');
      return;
    }

    // Prevent multiple clicks
    if (isLoading) return;

    setIsLoading(true);

    // Track if we've received a response (to prevent resetting loading after successful auth)
    let hasReceivedResponse = false;

    // Function to reset loading state
    const resetLoading = () => {
      if (!hasReceivedResponse) {
        setIsLoading(false);
      }
    };

    // Set a timeout to reset loading if popup is closed without response
    const loadingTimeout = setTimeout(resetLoading, 120000); // 2 minutes max wait time

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          hasReceivedResponse = true;
          clearTimeout(loadingTimeout);
          handleCredentialResponse(response);
        },
        cancel_on_tap_outside: true,
      });

      // Use MutationObserver to detect when Google's popup/iframe is closed
      // Google creates an iframe with id containing 'credential_picker'
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node;
              // Check if the removed element is Google's popup iframe or container
              if (element.id?.includes('credential_picker') ||
                element.id?.includes('google') ||
                element.querySelector?.('[id*="credential_picker"]')) {
                // Popup was closed
                clearTimeout(loadingTimeout);
                observer.disconnect();
                resetLoading();
              }
            }
          });
        });
      });

      // Start observing the document body for removed nodes
      observer.observe(document.body, { childList: true, subtree: true });

      // Also listen for window focus - when popup closes, main window gets focus
      const handleWindowFocus = () => {
        // Small delay to allow for credential callback to fire first
        setTimeout(() => {
          if (!hasReceivedResponse) {
            // Check if any Google popup/iframe exists
            const googlePopup = document.querySelector('[id*="credential_picker"]') ||
              document.querySelector('iframe[src*="accounts.google.com"]');
            if (!googlePopup) {
              clearTimeout(loadingTimeout);
              observer.disconnect();
              window.removeEventListener('focus', handleWindowFocus);
              resetLoading();
            }
          }
        }, 500);
      };
      window.addEventListener('focus', handleWindowFocus);

      // Cleanup after 2 minutes regardless
      setTimeout(() => {
        observer.disconnect();
        window.removeEventListener('focus', handleWindowFocus);
      }, 120000);

      // Render an invisible button and click it programmatically for popup
      const buttonDiv = document.createElement('div');
      buttonDiv.style.display = 'none';
      document.body.appendChild(buttonDiv);

      window.google.accounts.id.renderButton(buttonDiv, {
        type: 'standard',
        size: 'large',
        theme: 'outline',
        click_listener: () => console.log('Google button clicked'),
      });

      // Find and click the rendered button
      const googleButton = buttonDiv.querySelector('div[role="button"]');
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: use prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('Prompt not displayed, reason:', notification.getNotDisplayedReason());
            clearTimeout(loadingTimeout);
            observer.disconnect();
            window.removeEventListener('focus', handleWindowFocus);
            // If prompt fails, open manual OAuth popup
            openOAuthPopup();
          } else if (notification.isDismissedMoment() || notification.isSkippedMoment()) {
            clearTimeout(loadingTimeout);
            observer.disconnect();
            window.removeEventListener('focus', handleWindowFocus);
            resetLoading();
          }
        });
      }

      // Cleanup the hidden button
      setTimeout(() => {
        if (buttonDiv.parentNode) {
          buttonDiv.parentNode.removeChild(buttonDiv);
        }
      }, 100);

    } catch (error) {
      console.error('Google Sign-In error:', error);
      setIsLoading(false);
      toast.error('Failed to open Google Sign-In');
    }
  };

  // Manual OAuth popup as fallback
  const openOAuthPopup = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const redirectUri = window.location.origin + '/auth/google/callback';
    const scope = encodeURIComponent('email profile openid');
    const responseType = 'id_token';
    const nonce = Math.random().toString(36).substring(2);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=${responseType}` +
      `&scope=${scope}` +
      `&nonce=${nonce}` +
      `&prompt=select_account`;

    const popup = window.open(
      authUrl,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site.');
      setIsLoading(false);
      return;
    }

    // Listen for the callback
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setIsLoading(false);
        }
      } catch (e) {
        // Cross-origin error expected
      }
    }, 500);
  };

  // Show warning if Google Client ID is not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() => toast.error('Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment.')}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 ${className}`}
      >
        <GoogleIcon />
        <span className="font-medium">Google</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 px-4 py-3 rounded-xl
        border border-[var(--card-border)] bg-[var(--card-bg)]
        hover:bg-[var(--background-secondary)] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary-500 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="font-medium">
        {isLoading ? 'Signing in...' : 'Google'}
      </span>
    </button>
  );
}

// Google Icon Component (official colors)
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
