'use client';

import { useEffect, useState } from 'react';

export default function StreakPopupModal({ isOpen, onClose, previousStreak, newStreak }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-500 ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Fire Icon */}
          <div className="mb-6 animate-bounce">
            <div className="text-7xl">🔥</div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Streak Increased!
          </h2>

          {/* Streak Display */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white/80 line-through">
                {previousStreak}
              </div>
              <div className="text-sm text-white/70 mt-1">Previous</div>
            </div>

            <div className="text-5xl text-white">→</div>

            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-white animate-pulse">
                {newStreak}
              </div>
              <div className="text-sm text-white/70 mt-1">New Streak</div>
            </div>
          </div>

          {/* Message */}
          <p className="text-white/90 text-lg mb-6">
            Keep it up! You&apos;re on a {newStreak} day streak! 🎉
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((newStreak / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-white/70 text-sm">
            {newStreak < 30 ? `${30 - newStreak} days until 30-day milestone!` : 'Amazing! You\'ve reached 30 days!'}
          </p>
        </div>

        {/* Confetti Effect (CSS-based) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
}

