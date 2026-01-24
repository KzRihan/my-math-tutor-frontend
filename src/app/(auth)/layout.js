'use client';

import DarkThemeEnforcer from '@/components/providers/DarkThemeEnforcer';

/**
 * Auth Layout - Wraps all authentication pages
 * Enforces dark theme for login, register, forgot-password, reset-password, verify-email
 */
export default function AuthLayout({ children }) {
    return (
        <DarkThemeEnforcer>
            {children}
        </DarkThemeEnforcer>
    );
}
