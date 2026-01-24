'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    let currentPath = '';

    return paths.map((path, index) => {
      currentPath += `/${path}`;
      // Format label - handle dynamic routes like [id]
      let label = path;
      if (path.startsWith('[') && path.endsWith(']')) {
        label = 'Detail';
      } else {
        label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      }

      const isLast = index === paths.length - 1;
      return { label, path: currentPath, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: 'New student registered', time: '5 min ago', unread: true },
    { id: 2, message: 'Topic "Algebra Basics" was published', time: '1 hour ago', unread: true },
    { id: 3, message: 'AI generation completed', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-72 h-[72px] bg-background/80 backdrop-blur-xl border-b border-[var(--card-border)] z-30 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {crumb.isLast ? (
              <span className="text-sm font-semibold text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search topics, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 pl-10 text-sm text-foreground placeholder:text-foreground-secondary bg-white border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            style={{ backgroundColor: 'var(--search-bg)' }}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Create */}
        <Link
          href="/admin/topics/new"
          className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          title="Create New Topic"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-[var(--card-border)] flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                <button className="text-xs text-primary-500 hover:text-primary-400">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer',
                      notification.unread && 'bg-primary-500/5 dark:bg-primary-500/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {notification.unread && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className={!notification.unread ? 'ml-5' : ''}>
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-foreground-secondary mt-0.5">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-[var(--card-border)]">
                <button className="w-full text-center text-sm text-primary-500 hover:text-primary-400 py-1">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
          }}
          className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Theme"
        >
          <svg className="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg className="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-[var(--card-border)]" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
              SA
            </div>
            <span className="text-sm font-medium text-foreground hidden lg:inline">Super Admin</span>
            <svg className={cn(
              "w-4 h-4 text-foreground-secondary transition-transform",
              showUserMenu && "rotate-180"
            )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-[var(--card-border)]">
                <p className="font-medium text-sm text-foreground">Super Admin</p>
                <p className="text-xs text-foreground-secondary">admin@mathtutor.ai</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Main Site
                </Link>
              </div>
              <div className="border-t border-[var(--card-border)] py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error/10 dark:hover:bg-error/20 transition-colors w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
