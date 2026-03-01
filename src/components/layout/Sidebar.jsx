'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '@/store/authApi';
import { logout } from '@/store/authSlice';
import { useToast } from '@/components/providers/ToastProvider';
import { useGetMeQuery } from '@/store/userApi';
import { FaHome, FaBook, FaCamera, FaRobot, FaChartBar, FaCog, FaUser, FaCalculator, FaSun, FaMoon, FaSignOutAlt, FaHourglassHalf, FaMagic } from 'react-icons/fa';

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/topics', label: 'Topics', icon: FaBook },
  { href: '/capture', label: 'Capture', icon: FaCamera },
  { href: '/solve', label: 'AI Tutor', icon: FaRobot },
  { href: '/generate-content', label: 'Generate', icon: FaMagic },
  { href: '/progress', label: 'Progress', icon: FaChartBar },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: FaCog },
  { href: '/profile', label: 'Profile', icon: FaUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { resolvedTheme, setTheme } = useTheme();

  // Get actual user data from Redux (fallback)
  const reduxUser = useSelector((state) => state.auth.user);
  
  // Fetch latest user data from API
  const { data: userData } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  // Use API data if available, otherwise fallback to Redux
  const user = userData?.data || reduxUser;

  // Logout mutation
  const [logoutMutation] = useLogoutMutation();
  
  // Toast hook
  const toast = useToast();

  // Loading state for logout to prevent multiple clicks
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Handle logout
  const handleLogout = async () => {
    // Prevent multiple clicks
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call logout API
      await logoutMutation().unwrap();
      
      // Dispatch logout action to clear Redux state
      dispatch(logout());
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      // Even if API call fails, clear local state and redirect
      console.error('Logout error:', error);
      dispatch(logout());
      toast.error('Logged out (some data may not have been cleared)');
      router.push('/login');
    }
    // Note: Don't reset isLoggingOut - we're navigating away anyway
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith('http')) return user.profileImage;
      return `${SERVER_BASE_URL}${user.profileImage}`;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-[var(--card-border)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--card-border)]">
        <Link href="/" className="flex items-center gap-2">
          <FaCalculator className="text-2xl text-primary-500" />
          <span className="font-display font-bold text-lg gradient-text">
            {APP_NAME}
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <item.icon className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 space-y-1 border-t border-[var(--card-border)]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <item.icon className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-all"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-2">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            isLoggingOut
              ? 'text-foreground-secondary opacity-50 cursor-not-allowed'
              : 'text-error hover:bg-error/10'
          )}
        >
          {isLoggingOut ? <FaHourglassHalf className="text-lg" /> : <FaSignOutAlt className="text-lg" />}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--card-border)]">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {/* Profile Image or Initials */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </p>
            <p className="text-xs text-foreground-secondary truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

