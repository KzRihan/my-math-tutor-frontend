'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/store/authApi';
import { logout } from '@/store/authSlice';
import { FaSignOutAlt, FaHourglassHalf } from 'react-icons/fa';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/topics', label: 'Topics', icon: '📚' },
  { href: '/capture', label: 'Scan', icon: '📷' },
  { href: '/solve', label: 'Tutor', icon: '🤖' },
  { href: '/generate-content', label: 'Generate', icon: 'G' },
  { href: '/progress', label: 'Stats', icon: '📊' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutMutation().unwrap();
    } catch {
      // Clear local auth state even when API call fails.
    }

    dispatch(logout());
    router.replace('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-[var(--card-border)] z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
                isActive
                  ? 'text-primary-500'
                  : 'text-foreground-secondary'
              )}
            >
              <span className={cn(
                'text-xl transition-transform',
                isActive && 'scale-110'
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all',
            isLoggingOut
              ? 'text-foreground-secondary opacity-60 cursor-not-allowed'
              : 'text-error'
          )}
        >
          <span className="text-xl transition-transform">
            {isLoggingOut ? <FaHourglassHalf /> : <FaSignOutAlt />}
          </span>
          <span className="text-xs font-medium">
            {isLoggingOut ? 'Wait' : 'Logout'}
          </span>
        </button>
      </div>
    </nav>
  );
}
