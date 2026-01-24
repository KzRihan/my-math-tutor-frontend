'use client';

import { cn } from '@/lib/utils';

const badgeVariants = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  secondary: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
};

export default function Badge({
  children,
  variant = 'primary',
  className,
  ...props
}) {
  return (
    <span
      className={cn('badge', badgeVariants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }) {
  const configs = {
    1: { label: 'Beginner', variant: 'success' },
    2: { label: 'Easy', variant: 'success' },
    3: { label: 'Medium', variant: 'warning' },
    4: { label: 'Hard', variant: 'error' },
    5: { label: 'Expert', variant: 'error' }
  };
  
  const config = configs[level] || configs[3];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  const configs = {
    mastered: { label: '✓ Mastered', variant: 'success' },
    in_progress: { label: 'In Progress', variant: 'primary' },
    not_started: { label: 'Not Started', variant: 'secondary' },
    completed: { label: '✓ Done', variant: 'success' }
  };
  
  const config = configs[status] || { label: status, variant: 'secondary' };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
