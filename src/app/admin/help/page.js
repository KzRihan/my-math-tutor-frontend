'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
    {
        question: 'How do I create a new topic?',
        answer: 'Navigate to Topics in the sidebar, then click "Create New Topic". Fill in the topic details like title, grade band, and learning objectives. You can either write content manually or use AI to generate lessons and exercises.'
    },
    {
        question: 'How does AI content generation work?',
        answer: 'When creating or editing a topic, go to the "AI Generation" tab. Configure the number of lessons, exercises per lesson, and quiz questions. Click "Generate Content with AI" and the system will create educational content based on the topic title and objectives.'
    },
    {
        question: 'How do I publish a topic?',
        answer: 'Once you\'ve reviewed and approved all lessons and exercises, click the "Publish Topic" button on the topic editor page. Published topics become visible to students on the main platform.'
    },
    {
        question: 'How can I view student progress?',
        answer: 'Go to Students in the sidebar to see all registered students. Click on any student to view their detailed progress, including completed topics, quiz scores, and learning activity.'
    },
    {
        question: 'How do I reset a student\'s quiz?',
        answer: 'Navigate to the student\'s detail page, find the quiz you want to reset under the "Quizzes" tab, and click the reset button. This allows the student to retake the quiz.'
    },
    {
        question: 'Where can I see analytics?',
        answer: 'The Analytics page in the sidebar provides comprehensive data including active users, topic performance, exercise difficulty distribution, and drop-off analysis to help you improve the curriculum.'
    },
];

const QUICK_LINKS = [
    { label: 'Create New Topic', href: '/admin/topics/new', icon: '📚' },
    { label: 'View All Students', href: '/admin/students', icon: '👥' },
    { label: 'Analytics Dashboard', href: '/admin/analytics', icon: '📈' },
    { label: 'System Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function HelpPage() {
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = FAQ_ITEMS.filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold">Help & Support</h1>
                <p className="text-foreground-secondary">Find answers and get help with the admin panel</p>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-center group"
                        >
                            <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                            <span className="text-sm font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {filteredFaqs.length === 0 ? (
                        <p className="text-foreground-secondary text-center py-8">No results found for &quot;{searchQuery}&quot;</p>
                    ) : (
                        filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-[var(--card-border)] rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                >
                                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                                    <svg
                                        className={cn(
                                            "w-5 h-5 text-foreground-secondary flex-shrink-0 transition-transform",
                                            expandedFaq === index && "rotate-180"
                                        )}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-4 pb-4 text-sm text-foreground-secondary border-t border-[var(--card-border)] pt-3">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Contact Support */}
            <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Need More Help?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">Email Support</h3>
                                <p className="text-xs text-foreground-secondary">Get help via email</p>
                            </div>
                        </div>
                        <a
                            href="mailto:support@mathtutor.ai"
                            className="text-sm text-primary-500 hover:text-primary-400 font-medium transition-colors"
                        >
                            support@mathtutor.ai
                        </a>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary-500/10 border border-secondary-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">Documentation</h3>
                                <p className="text-xs text-foreground-secondary">Read the full guide</p>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="text-sm text-secondary-500 hover:text-secondary-400 font-medium transition-colors"
                        >
                            View Documentation →
                        </a>
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Keyboard Shortcuts</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { keys: ['Ctrl', 'K'], action: 'Quick search' },
                        { keys: ['Ctrl', 'N'], action: 'New topic' },
                        { keys: ['Ctrl', 'S'], action: 'Save changes' },
                        { keys: ['Esc'], action: 'Close modal' },
                        { keys: ['↑', '↓'], action: 'Navigate items' },
                        { keys: ['Enter'], action: 'Confirm action' },
                    ].map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                            <span className="text-sm text-foreground-secondary">{shortcut.action}</span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                    <span key={keyIndex}>
                                        <kbd className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded font-mono">
                                            {key}
                                        </kbd>
                                        {keyIndex < shortcut.keys.length - 1 && (
                                            <span className="text-foreground-secondary mx-0.5">+</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Version Info */}
            <div className="text-center text-sm text-foreground-secondary py-4">
                <p>MathTutor AI Admin Panel v1.0.0</p>
                <p className="text-xs mt-1">© 2025 MathTutor AI. All rights reserved.</p>
            </div>
        </div>
    );
}
