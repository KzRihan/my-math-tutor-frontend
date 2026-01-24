'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SUBSCRIPTION_TIERS } from '@/lib/constants';
import { useState } from 'react';
import DarkThemeEnforcer from '@/components/providers/DarkThemeEnforcer';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const tiers = Object.values(SUBSCRIPTION_TIERS);

    const calculatePrice = (basePrice) => {
        if (billingCycle === 'monthly') return basePrice;
        return Math.floor(basePrice * 0.8); // 20% discount for yearly
    };

    const faqs = [
        {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, you can cancel your subscription at any time from your settings page. You'll continue to have access until the end of your billing cycle."
        },
        {
            q: "Is there a free trial for the Premium plan?",
            a: "We offer a Free tier that lets you experience the core features. For Premium, we have a 14-day money-back guarantee if you're not satisfied."
        },
        {
            q: "How does the Family plan work?",
            a: "The Family plan allows you to add up to 5 family members under one subscription. Each member gets their own private progress tracking and AI tutor sessions."
        },
        {
            q: "Which subjects are covered?",
            a: "We cover everything from basic arithmetic and fractions to advanced calculus, linear algebra, and statistics."
        }
    ];

    return (
        <DarkThemeEnforcer>
            <div>
                <Header />
            <main className="pt-24 pb-20 overflow-x-hidden">
                {/* Animated Background Mesh */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Hero Section */}
                <section className="relative py-16 px-6">
                    <div className="container text-center">
                        <Badge variant="primary" className="mb-6 animate-fade-in py-2 px-4 text-sm tracking-widest uppercase">
                            Simple & Transparent Pricing 💎
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tight animate-fade-in">
                            Master Math with <br />
                            <span className="gradient-text drop-shadow-sm">AI-Powered Guidance</span>
                        </h1>
                        <p className="text-xl text-foreground-secondary max-w-2xl mx-auto mb-12 animate-fade-in opacity-80" style={{ animationDelay: '0.1s' }}>
                            Choose the plan that fits your learning pace. Join thousands of students improving their grades today.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-foreground-secondary'}`}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="w-14 h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full p-1 transition-colors relative"
                            >
                                <div className={`w-5 h-5 bg-primary-500 rounded-full transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-foreground' : 'text-foreground-secondary'}`}>
                                    Yearly
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-black bg-success/20 text-success rounded-md uppercase tracking-tighter">
                                    Save 20%
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="px-6 py-4">
                    <div className="container">
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                            {tiers.map((tier, idx) => {
                                const isPremium = tier.id === 'premium';
                                return (
                                    <Card
                                        key={tier.id}
                                        variant={isPremium ? 'premium' : 'glass'}
                                        className={`relative flex flex-col h-full transform transition-all duration-700 hover:-translate-y-4 ${isPremium ? 'scale-105 z-10 glow-border-premium' : 'scale-100 opacity-90'
                                            }`}
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        {isPremium && (
                                            <div className="premium-bg-glow" />
                                        )}

                                        {isPremium && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-primary-600 to-primary-400 text-white text-[10px] font-black tracking-[0.2em] rounded-full shadow-glow-lg animate-pulse z-20">
                                                RECOMMENDED
                                            </div>
                                        )}

                                        {/* Content Wrapper */}
                                        <div className="relative z-10 flex flex-col h-full">
                                            <CardHeader className="text-center pb-8 border-b border-[var(--card-border)]">
                                                <CardTitle className={`text-2xl font-black mb-2 uppercase tracking-tight ${isPremium ? 'gradient-text' : ''}`}>
                                                    {tier.name}
                                                </CardTitle>
                                                <div className="mt-6 flex flex-col items-center gap-1">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-6xl font-black tracking-tighter transition-all duration-500">
                                                            ${calculatePrice(tier.price)}
                                                        </span>
                                                        {tier.price > 0 && (
                                                            <span className="text-foreground-secondary text-lg font-bold">/mo</span>
                                                        )}
                                                    </div>
                                                    {billingCycle === 'yearly' && tier.price > 0 && (
                                                        <span className="text-xs text-primary-500 font-bold">Billed annually</span>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="flex-1 pt-10">
                                                <ul className="space-y-6">
                                                    {tier.features.map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-4 group">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${isPremium ? 'bg-primary-500 text-white' : 'bg-success/15 text-success'
                                                                }`}>
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-bold text-foreground-secondary group-hover:text-foreground transition-colors">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>

                                            <div className="mt-12">
                                                <Button
                                                    variant={isPremium ? 'primary' : 'secondary'}
                                                    className={`w-full py-6 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 ${isPremium ? 'hover:scale-[1.02] shadow-primary-500/20 shadow-2xl' : ''
                                                        }`}
                                                >
                                                    {tier.id === 'free' ? 'Start Free' : 'Choose Plan'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-6 py-20 bg-background-secondary/50">
                    <div className="container">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
                            <p className="text-foreground-secondary">Everything you need to know about our plans and pricing.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {faqs.map((faq, i) => (
                                <Card key={i} variant="glass" className="hover:border-primary-500/30 transition-colors">
                                    <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                    <p className="text-foreground-secondary text-sm leading-relaxed">{faq.a}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-12">
                    <div className="container">
                        <Card variant="gradient" className="p-8 md:p-16 text-center overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 blur-3xl -z-10 rounded-full -translate-x-1/2 translate-y-1/2" />

                            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Still have questions?</h2>
                            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-10">
                                Our support team is here to help you choose the right path for your education.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button variant="primary" className="btn-lg px-10">Contact Support</Button>
                                <Button variant="ghost" className="btn-lg">Read Documentation</Button>
                            </div>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
        </DarkThemeEnforcer>
    );
}
