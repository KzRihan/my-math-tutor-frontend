'use client';

import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { APP_NAME } from '@/lib/constants';
import DarkThemeEnforcer from '@/components/providers/DarkThemeEnforcer';
import { FaBullseye, FaCamera, FaBrain, FaChartLine, FaBookOpen, FaGlobeAmericas, FaRobot, FaArrowRight } from 'react-icons/fa';

export default function AboutPage() {
    const features = [
        {
            icon: FaBullseye,
            title: 'Personalized Learning',
            description: 'AI-powered tutoring adapts to your learning pace and style, ensuring you master every concept.'
        },
        {
            icon: FaCamera,
            title: 'Instant Problem Solving',
            description: 'Snap a photo of any math problem and get step-by-step guidance instantly.'
        },
        {
            icon: FaBrain,
            title: 'Socratic Method',
            description: 'Learn through guided questions that help you discover solutions on your own.'
        },
        {
            icon: FaChartLine,
            title: 'Progress Tracking',
            description: 'Monitor your growth with detailed analytics and personalized insights.'
        },
        {
            icon: FaBookOpen,
            title: 'Focused Practice',
            description: 'Build mastery with guided practice sessions and clear learning feedback.'
        },
        {
            icon: FaGlobeAmericas,
            title: 'Learn Anywhere',
            description: 'Access your AI tutor 24/7 from any device, wherever you are.'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Students' },
        { value: '1M+', label: 'Problems Solved' },
        { value: '95%', label: 'Success Rate' },
        { value: '24/7', label: 'AI Support' }
    ];

    return (
        <DarkThemeEnforcer>
            <div className="min-h-screen">
                <Header />
                <div className="min-h-screen">
                    {/* Hero Section */}
                    <section className="relative py-20 lg:py-32 gradient-bg-mesh overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        <div className="container relative z-10">
                            <div className="max-w-4xl mx-auto text-center">
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                                    Revolutionizing Math Education with{' '}
                                    <span className="gradient-text">AI Technology</span>
                                </h1>
                                <p className="text-xl text-foreground-secondary mb-8 leading-relaxed">
                                    {APP_NAME} is your personal AI mathematics tutor, designed to make learning math
                                    engaging, effective, and accessible to everyone, from elementary students to college scholars.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link href="/register">
                                        <Button size="lg" className="font-bold">
                                            Start Learning Free
                                        </Button>
                                    </Link>
                                    <Link href="/pricing">
                                        <Button variant="secondary" size="lg" className="font-bold">
                                            View Pricing
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="py-16 bg-background-secondary">
                        <div className="container">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat, idx) => (
                                    <Card key={idx} variant="glass" className="text-center p-6">
                                        <CardContent>
                                            <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-foreground-secondary font-medium">
                                                {stat.label}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mission Section */}
                    <section className="py-20">
                        <div className="container">
                            <div className="max-w-3xl mx-auto text-center mb-16">
                                <h2 className="font-display text-3xl md:text-4xl font-black mb-6">
                                    Our Mission
                                </h2>
                                <p className="text-lg text-foreground-secondary leading-relaxed">
                                    We believe that every student deserves access to world-class mathematics education.
                                    Our AI-powered platform breaks down complex concepts into digestible lessons,
                                    provides instant feedback, and adapts to each learner&apos;s unique needs, making math
                                    mastery achievable for everyone.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {features.map((feature, idx) => (
                                    <Card
                                        key={idx}
                                        interactive
                                        className="group"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        <CardContent className="p-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                                <feature.icon />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                            <p className="text-foreground-secondary leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section className="py-20 bg-background-secondary">
                        <div className="container">
                            <div className="text-center mb-16">
                                <h2 className="font-display text-3xl md:text-4xl font-black mb-4">
                                    How It Works
                                </h2>
                                <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                                    Get started in three simple steps
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {[
                                    { step: '01', title: 'Capture', desc: 'Take a photo of your math problem or type it in', icon: FaCamera },
                                    { step: '02', title: 'Learn', desc: 'Get step-by-step guidance from your AI tutor', icon: FaRobot },
                                    { step: '03', title: 'Master', desc: 'Practice similar problems and track your progress', icon: FaBullseye }
                                ].map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <Card variant="glassStrong" className="p-8 text-center h-full">
                                            <CardContent>
                                                <item.icon className="text-6xl mb-4 mx-auto" />
                                                <div className="text-primary-500 font-black text-sm mb-2">STEP {item.step}</div>
                                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                                <p className="text-foreground-secondary">{item.desc}</p>
                                            </CardContent>
                                        </Card>
                                        {idx < 2 && (
                                            <div className="hidden md:block absolute top-1/2 -right-4 text-4xl text-primary-400">
                                                <FaArrowRight />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-400" />
                        <div className="absolute inset-0 gradient-bg-mesh opacity-30" />

                        <div className="container relative z-10 text-center text-white">
                            <h2 className="font-display text-3xl md:text-4xl font-black mb-6">
                                Ready to Transform Your Math Journey?
                            </h2>
                            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                                Join thousands of students who are mastering mathematics with AI-powered guidance.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="bg-white text-primary-600 hover:bg-neutral-100 font-bold"
                                    >
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold"
                                    >
                                        View Plans
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        </DarkThemeEnforcer>
    );
}
