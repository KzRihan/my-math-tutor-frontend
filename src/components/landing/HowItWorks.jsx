'use client';

import MathRenderer from '@/components/chat/MathRenderer';
import { FaMobileAlt, FaSearch, FaLightbulb, FaTrophy } from 'react-icons/fa';
import { MdCameraAlt } from 'react-icons/md';
import { FaRobot } from 'react-icons/fa';

const steps = [
  {
    number: '01',
    title: 'Snap Your Problem',
    description: 'Use your camera to capture any math problem from your textbook, worksheet, or whiteboard.',
    icon: FaMobileAlt,
    demo: {
      type: 'camera',
      content: 'Capture math from anywhere'
    }
  },
  {
    number: '02',
    title: 'AI Understands It',
    description: 'Our OCR technology instantly converts your image to editable, beautiful mathematical notation.',
    icon: FaSearch,
    demo: {
      type: 'latex',
      content: 'x^2 + 5x + 6 = 0'
    }
  },
  {
    number: '03',
    title: 'Learn Step by Step',
    description: 'The AI tutor guides you through the solution with Socratic hints, never spoiling the answer.',
    icon: FaLightbulb,
    demo: {
      type: 'chat',
      content: 'What two numbers multiply to 6 and add to 5?'
    }
  },
  {
    number: '04',
    title: 'Master the Concept',
    description: 'Practice with similar problems, track your progress, and truly understand the mathematics.',
    icon: FaTrophy,
    demo: {
      type: 'progress',
      content: '85% Mastery'
    }
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 gradient-bg-mesh">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge badge-primary mb-4">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            From Problem to{' '}
            <span className="gradient-text">Mastery</span>{' '}
            in 4 Steps
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="glass-card p-6 hover-lift h-full">
                  {/* Number Badge */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm mb-4 relative z-10">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4 text-primary-500">
                    <step.icon />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-foreground-secondary text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Demo Preview */}
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-sm">
                    {step.demo.type === 'camera' && (
                      <div className="flex items-center gap-2 text-foreground-secondary">
                        <MdCameraAlt className="text-xl" />
                        {step.demo.content}
                      </div>
                    )}
                    {step.demo.type === 'latex' && (
                      <div className="text-center">
                        <MathRenderer latex={step.demo.content} />
                      </div>
                    )}
                    {step.demo.type === 'chat' && (
                      <div className="flex items-start gap-2">
                        <FaRobot className="text-primary-500" />
                        <span className="text-foreground-secondary italic">
                          &quot;{step.demo.content}&quot;
                        </span>
                      </div>
                    )}
                    {step.demo.type === 'progress' && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-success font-semibold">
                          <span className="text-success">✓</span>
                          {step.demo.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
