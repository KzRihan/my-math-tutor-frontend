'use client';

import { cn } from '@/lib/utils';

const variants = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  primary: 'text-primary-500',
};

const bgVariants = {
  default: 'bg-neutral-100 dark:bg-neutral-800',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
  info: 'bg-info/10',
  primary: 'bg-primary-500/10',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}) {
  const isPositiveTrend = trend === 'up';
  const isNegativeTrend = trend === 'down';

  return (
    <div className={cn(
      'glass-card p-6 hover:shadow-lg transition-all duration-300 group',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          bgVariants[variant]
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg',
            isPositiveTrend && 'bg-success/10 text-success',
            isNegativeTrend && 'bg-error/10 text-error',
            !isPositiveTrend && !isNegativeTrend && 'bg-neutral-100 dark:bg-neutral-800 text-foreground-secondary'
          )}>
            {isPositiveTrend && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            )}
            {isNegativeTrend && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            )}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <p className="text-foreground-secondary text-sm font-medium mb-1">{title}</p>
        <p className={cn(
          'text-3xl font-bold mb-1',
          variants[variant]
        )}>
          {value}
        </p>
        {subtitle && (
          <p className="text-foreground-secondary text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
