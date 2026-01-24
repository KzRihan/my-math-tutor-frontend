'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaRocket, FaBook, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function EnrollmentModal({ isOpen, onClose, topic, onEnroll }) {
    const [isEnrolling, setIsEnrolling] = useState(false);

    if (!isOpen || !topic) return null;

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            await onEnroll();
            onClose();
        } catch (error) {
            console.error('Enrollment error:', error);
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card variant="glass" className="max-w-md w-full p-6 lg:p-8">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <FaRocket className="text-3xl text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Start Learning</h2>
                    <p className="text-foreground-secondary">
                        Enroll in this topic to track your progress and unlock all lessons
                    </p>
                </div>

                {/* Topic Info */}
                <div className="space-y-3 mb-6 p-4 rounded-xl bg-background-secondary">
                    <h3 className="font-bold text-lg">{topic.title}</h3>
                    {topic.subtitle && (
                        <p className="text-sm text-foreground-secondary">{topic.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                        <span className="flex items-center gap-1">
                            <FaBook className="text-xs" />
                            {topic.lessonsCount || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {Math.round((topic.lessonsCount || 0) * 15)} min
                        </span>
                    </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-start gap-3 text-sm">
                        <FaCheckCircle className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground-secondary">Track your learning progress</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                        <FaCheckCircle className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground-secondary">Unlock all lessons and content</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                        <FaCheckCircle className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground-secondary">Get personalized recommendations</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isEnrolling}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnroll}
                        className="flex-1"
                        disabled={isEnrolling}
                    >
                        {isEnrolling ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Enrolling...
                            </>
                        ) : (
                            <>
                                <FaRocket className="mr-2" />
                                Enroll Now
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

