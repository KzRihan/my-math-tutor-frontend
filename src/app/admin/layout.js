'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for admin authentication
    const adminToken = localStorage.getItem('adminToken');
    const isLoginPage = pathname === '/admin/login';

    if (!adminToken && !isLoginPage) {
      router.replace('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [pathname, router]);

  // Apply dark theme by default for admin
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Login page - no sidebar/header
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="ml-72 pt-[72px] min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
