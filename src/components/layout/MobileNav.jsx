'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/topics', label: 'Topics', icon: '📚' },
  { href: '/capture', label: 'Scan', icon: '📷' },
  { href: '/solve', label: 'Tutor', icon: '🤖' },
  { href: '/progress', label: 'Stats', icon: '📊' },
];

export default function MobileNav() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}
