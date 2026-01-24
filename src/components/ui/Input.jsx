'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({
  label,
  error,
  icon,
  className,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary text-xl pointer-events-none z-10">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          style={icon ? { textIndent: '3rem', paddingRight: '1rem' } : { paddingLeft: '1rem', paddingRight: '1rem' }}
          className={cn(
            'input',
            error && 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

export function Textarea({
  label,
  error,
  className,
  rows = 4,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'input resize-none',
          error && 'border-error focus:border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
