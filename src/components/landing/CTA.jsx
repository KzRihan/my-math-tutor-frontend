import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FaCheck } from 'react-icons/fa';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.3)_0%,_transparent_50%)]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Ready to Transform Your{' '}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Math Journey?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of students who are already learning smarter. 
            Start for free, upgrade anytime.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <FaCheck className="text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <FaCheck className="text-green-400" />
              5 free AI sessions daily
            </span>
            <span className="flex items-center gap-2">
              <FaCheck className="text-green-400" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
