'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { APP_NAME } from '@/lib/constants';
import { FaCalculator } from 'react-icons/fa';

export default function Header({ hidePricing = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-lg border-b border-[var(--card-border)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <FaCalculator className="text-2xl text-primary-500" />
            <span className="font-display font-bold text-xl gradient-text">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            {!hidePricing && (
              <Link
                href="/pricing"
                className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started Free</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-foreground transition-transform origin-left ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-foreground transition-opacity ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-foreground transition-transform origin-left ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--card-border)]">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-foreground-secondary hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-foreground-secondary hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {!hidePricing && (
                <Link
                  href="/pricing"
                  className="text-foreground-secondary hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-[var(--card-border)]">
                <Link href="/login">
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
