'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    content: "MathTutor AI completely changed how I study. Instead of just showing answers, it actually teaches me how to think through problems. My grades went from C to A- in just two months!",
    author: "Priya Sharma",
    role: "10th Grade Student",
    avatar: "PS",
    rating: 5
  },
  {
    id: 2,
    content: "As a parent, I love that my son is now excited about math. The AI tutor is patient and adapts to his pace. It's like having a private tutor available 24/7.",
    author: "Rajesh Kumar",
    role: "Parent",
    avatar: "RK",
    rating: 5
  },
  {
    id: 3,
    content: "The snap-to-solve feature is incredible for my college calculus homework. It recognizes handwritten equations perfectly and guides me through complex integrations step by step.",
    author: "Sarah Chen",
    role: "Engineering Student",
    avatar: "SC",
    rating: 5
  },
  {
    id: 4,
    content: "I recommend MathTutor AI to all my students who need extra help. The Socratic method prevents them from developing a dependency on just copying answers.",
    author: "Dr. Amit Patel",
    role: "Math Teacher",
    avatar: "AP",
    rating: 5
  },
  {
    id: 5,
    content: "Finally, an app that doesn't just give answers! My daughter actually understands fractions now instead of memorizing solutions. The progress tracking keeps her motivated.",
    author: "Meera Iyer",
    role: "Parent",
    avatar: "MI",
    rating: 5
  },
  {
    id: 6,
    content: "Preparing for JEE Advanced would be impossible without this. The adaptive difficulty and college-level content perfectly matches the exam pattern.",
    author: "Arjun Reddy",
    role: "JEE Aspirant",
    avatar: "AR",
    rating: 5
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-neutral-900 text-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm mb-4">
            <FaStar className="text-yellow-400" /> Trusted by 50,000+ Students
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Students Say
          </h2>
          <p className="text-neutral-400">
            Real stories from students and parents who transformed their math learning experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="bg-neutral-800 border-neutral-700 hover:border-primary-500/50 transition-colors"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-neutral-500 text-sm mb-6">Featured in</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <span className="text-2xl font-bold">TechCrunch</span>
            <span className="text-2xl font-bold">EdTech India</span>
            <span className="text-2xl font-bold">YourStory</span>
            <span className="text-2xl font-bold">Inc42</span>
          </div>
        </div>
      </div>
    </section>
  );
}
