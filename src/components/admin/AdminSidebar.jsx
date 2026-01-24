'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { adminNavItems } from '@/data/admin-data';
import { FaShieldAlt, FaQuestionCircle, FaChartBar, FaBook, FaUsers, FaChartLine, FaCog, FaClipboardCheck } from 'react-icons/fa';
import { useGetDashboardDataQuery } from '@/store/adminApi';

// Map icon strings to icon components
const iconMap = {
  dashboard: FaChartBar,
  topics: FaBook,
  students: FaUsers,
  analytics: FaChartLine,
  settings: FaCog,
  'quiz-review': FaClipboardCheck,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: dashboardData } = useGetDashboardDataQuery();

  // Get stats from dashboard data - using correct API response structure
  const totalStudents = dashboardData?.data?.stats?.totalStudents || 0;
  const totalTopics = dashboardData?.data?.stats?.totalTopics || 0;

  // Format large numbers (e.g., 1200 -> 1.2k)
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-[var(--card-border)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--card-border)] h-[72px]">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <FaShieldAlt className="text-xl text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg gradient-text">
              {APP_NAME}
            </span>
            <p className="text-xs text-foreground-secondary">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 py-2 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
          Main Menu
        </p>
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const IconComponent = iconMap[item.icon] || FaChartBar;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-transparent text-foreground-secondary hover:bg-neutral-50 hover:text-foreground dark:bg-transparent dark:hover:bg-secondary-100/20 dark:hover:text-secondary-100'
              )}
            >
              <IconComponent className="text-lg" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="glass-card p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
            Quick Stats
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {formatNumber(totalTopics)}
              </p>
              <p className="text-xs text-foreground-secondary">Topics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-500">
                {formatNumber(totalStudents)}
              </p>
              <p className="text-xs text-foreground-secondary">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="p-4 space-y-1 border-t border-[var(--card-border)]">
        <Link
          href="/admin/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-transparent text-foreground-secondary hover:bg-neutral-50 hover:text-foreground dark:bg-transparent dark:hover:bg-secondary-100/10 dark:hover:text-secondary-100 transition-all"
        >
          <FaQuestionCircle className="text-lg" />
          Help & Support
        </Link>
      </div>

      {/* Admin Profile */}
      <div className="p-4 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-transparent hover:bg-neutral-50 dark:bg-transparent dark:hover:bg-secondary-100/10 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground group-hover:dark:text-secondary-100 truncate transition-colors">System Admin</p>
            <p className="text-xs text-foreground-secondary truncate">Super Administrator</p>
          </div>
          <button className="text-foreground-secondary hover:text-foreground group-hover:dark:text-secondary-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
