'use client';

import { useGetMeQuery } from '@/store/userApi';
import { FaTrophy, FaLevelUpAlt } from 'react-icons/fa';
import Badge from '@/components/ui/Badge';

/**
 * UserXPBadge Component
 * 
 * Displays user's current XP and level that updates in real-time
 */
export default function UserXPBadge({ className = '' }) {
  const { data: userData, isLoading } = useGetMeQuery(undefined, {
    // Refetch when component mounts or when cache is invalidated
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    );
  }

  const user = userData?.data || userData;
  const xpPoints = user?.xpPoints || 0;
  const level = user?.level || 1;
  const nextLevelXP = level * 500; // XP needed for next level
  const currentLevelXP = (level - 1) * 500; // XP at start of current level
  const progressXP = xpPoints - currentLevelXP; // XP in current level
  const progressPercent = ((progressXP / (nextLevelXP - currentLevelXP)) * 100).toFixed(0);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Level Badge */}
      <Badge variant="primary" className="flex items-center gap-1.5 px-3 py-1.5">
        <FaLevelUpAlt className="text-xs" />
        <span className="font-semibold">Level {level}</span>
      </Badge>

      {/* XP Display */}
      <div className="flex items-center gap-2">
        <FaTrophy className="text-yellow-500 text-sm" />
        <span className="text-sm font-medium">
          {xpPoints.toLocaleString()} XP
        </span>
      </div>

      {/* Progress Bar (optional, can be shown on hover or in a tooltip) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-foreground-secondary">
        <div className="w-20 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        <span>{progressPercent}% to Level {level + 1}</span>
      </div>
    </div>
  );
}

