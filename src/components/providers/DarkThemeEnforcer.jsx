'use client';

import { useEffect } from 'react';

/**
 * DarkThemeEnforcer - Forces dark theme on wrapped pages
 * Used for public pages (landing, auth, about, pricing)
 */
export default function DarkThemeEnforcer({ children }) {
    useEffect(() => {
        // Set dark theme on mount
        document.documentElement.setAttribute('data-theme', 'dark');
    }, []);

    return <>{children}</>;
}
