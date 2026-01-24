'use client';

import { cn } from '@/lib/utils';

const cardVariants = {
  default: 'card',
  glass: 'glass-card',
  glassStrong: 'glass-card-strong',
  gradient: 'gradient-border',
  premium: 'premium-card'
};

export default function Card({
  children,
  variant = 'default',
  interactive = false,
  className,
  ...props
}) {
  const isSpecial = variant === 'gradient' || variant === 'premium';

  return (
    <div
      className={cn(
        cardVariants[variant],
        interactive && 'card-interactive',
        'p-6 overflow-hidden',
        className
      )}
      {...props}
    >
      <div className={cn(isSpecial && 'relative-content h-full flex flex-col')}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-foreground-secondary mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-[var(--card-border)]', className)}>
      {children}
    </div>
  );
}
