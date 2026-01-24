'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import MathRenderer from '@/components/chat/MathRenderer';
import { FaBullseye } from 'react-icons/fa';

const floatingEquations = [
  { latex: 'E = mc^2', top: '15%', left: '10%', delay: 0 },
  { latex: '\\frac{d}{dx}', top: '25%', right: '15%', delay: 0.5 },
  { latex: '\\int_0^\\infty', top: '60%', left: '8%', delay: 1 },
  { latex: '\\sum_{n=1}', top: '70%', right: '12%', delay: 1.5 },
  { latex: '\\sqrt{x^2+y^2}', top: '40%', left: '5%', delay: 2 },
  { latex: '\\pi r^2', top: '20%', right: '8%', delay: 2.5 },
  { latex: '\\lim_{x \\to 0}', bottom: '25%', left: '12%', delay: 0.8 },
  { latex: 'a^2 + b^2 = c^2', bottom: '30%', right: '10%', delay: 1.2 }
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)]" />

      {/* Floating Math Equations */}
      {mounted && floatingEquations.map((eq, i) => (
        <div
          key={i}
          className="absolute text-white/20 text-lg md:text-xl animate-float pointer-events-none select-none hidden md:block"
          style={{
            top: eq.top,
            left: eq.left,
            right: eq.right,
            bottom: eq.bottom,
            animationDelay: `${eq.delay}s`
          }}
        >
          <MathRenderer latex={eq.latex} />
        </div>
      ))}

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="container relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-sm">AI-Powered Learning Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Master Mathematics with{' '}
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              AI Guidance
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Snap a problem, get personalized hints, and learn step-by-step with our
            Socratic AI tutor. From basic arithmetic to advanced calculus.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Start Learning Free
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">50K+</p>
              <p className="text-white/60 text-sm">Students</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">100+</p>
              <p className="text-white/60 text-sm">Topics</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</p>
              <p className="text-white/60 text-sm">Rating</p>
            </div>
          </div>
        </div>

        {/* Demo Preview Card */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="glass-card-strong p-1 shadow-2xl">
            <div className="bg-neutral-900 rounded-xl p-6">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-neutral-800 rounded-md text-neutral-400 text-xs">
                    MathTutor.ai/solve
                  </div>
                </div>
              </div>

              {/* Demo Content */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex gap-4">
                  {/* Chat */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                        AI
                      </div>
                      <div className="flex-1 bg-neutral-700 rounded-lg p-3">
                        <p className="text-white text-sm">Let&apos;s solve this step by step. What two numbers multiply to 6 and add to 5?</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center text-white text-sm">
                        JD
                      </div>
                      <div className="bg-primary-600 rounded-lg p-3">
                        <p className="text-white text-sm">2 and 3!</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                        AI
                      </div>
                      <div className="flex-1 bg-neutral-700 rounded-lg p-3">
                        <p className="text-white text-sm flex items-center gap-2">
                          <FaBullseye className="text-primary-400" /> Perfect! Now we can factor:
                        </p>
                        <div className="mt-2 text-primary-300">
                          <MathRenderer latex="(x + 2)(x + 3) = 0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
