'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import { useGetPublishedTopicQuery } from '@/store/topicApi';
import {
    useGetEnrollmentQuery,
    useUpdateLessonProgressMutation
} from '@/store/enrollmentApi';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';
import LeaveWarningModal, { useLeaveWarning } from '@/components/modals/LeaveWarningModal';
import PracticeQuestion from '@/components/practice/PracticeQuestion';
import XPDisplay from '@/components/practice/XPDisplay';
import UserXPBadge from '@/components/practice/UserXPBadge';
import {
    FaBook,
    FaClock,
    FaCheckCircle,
    FaLock,
    FaSpinner,
    FaArrowLeft,
    FaPlay,
    FaLightbulb,
    FaPencilAlt,
    FaExclamationTriangle,
    FaQuestionCircle
} from 'react-icons/fa';
import { HiInbox } from 'react-icons/hi2';

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [currentSection, setCurrentSection] = useState('concept');
    const [questionResults, setQuestionResults] = useState({}); // Track question results for XP
    const [isComplete, setIsComplete] = useState(false);
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const pendingNavigation = useRef(null);
    const hasUnsavedChanges = useRef(false);

    // Time tracking refs
    const sessionStartTime = useRef(null);
    const lastSavedTime = useRef(null);
    const totalTimeSpent = useRef(0); // Total time in minutes
    const isPageVisible = useRef(true);
    const timeTrackingInterval = useRef(null);

    // Fetch topic data dynamically
    const { data: topicData, isLoading: isLoadingTopic, error: topicError } = useGetPublishedTopicQuery(params.id);
    const { data: enrollmentData, isLoading: isLoadingEnrollment } = useGetEnrollmentQuery(params.id, {
        skip: !params.id,
    });
    const [updateLessonProgress, { isLoading: isUpdatingProgress }] = useUpdateLessonProgressMutation();

    const topic = topicData?.data;
    const lessons = topic?.lessons || [];
    const enrollment = enrollmentData?.data;
    const isEnrolled = !!enrollment && !isLoadingEnrollment;

    // Find current lesson
    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentLessonIndex = sortedLessons.findIndex(l =>
        (l._id?.toString() === params.lessonId) ||
        (l.id?.toString() === params.lessonId) ||
        (l.order?.toString() === params.lessonId)
    );
    const currentLesson = currentLessonIndex >= 0 ? sortedLessons[currentLessonIndex] : null;
    const lessonContent = currentLesson?.content || null;

    const prevLesson = currentLessonIndex > 0 ? sortedLessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < sortedLessons.length - 1 ? sortedLessons[currentLessonIndex + 1] : null;

    // Start time tracking
    const startTimeTracking = useCallback(() => {
        if (!isEnrolled || !enrollment || !currentLesson || isComplete) return;

        if (!sessionStartTime.current) {
            sessionStartTime.current = new Date();
        }
        if (!lastSavedTime.current) {
            lastSavedTime.current = new Date();
        }

        // Clear any existing interval
        if (timeTrackingInterval.current) {
            clearInterval(timeTrackingInterval.current);
        }

        // Track time every 30 seconds when page is visible
        timeTrackingInterval.current = setInterval(() => {
            if (isPageVisible.current && !document.hidden) {
                const now = new Date();
                const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                const timeDiffMinutes = timeDiffMs / (1000 * 60);

                if (timeDiffMinutes >= 0.5) { // Save every 30 seconds (0.5 minutes)
                    totalTimeSpent.current += timeDiffMinutes;
                    lastSavedTime.current = now;
                }
            }
        }, 30000); // Check every 30 seconds
    }, [isEnrolled, enrollment, currentLesson, isComplete]);

    // Stop time tracking
    const stopTimeTracking = useCallback(() => {
        if (timeTrackingInterval.current) {
            clearInterval(timeTrackingInterval.current);
            timeTrackingInterval.current = null;
        }

        // Save accumulated time when stopping
        if (lastSavedTime.current && isPageVisible.current) {
            const now = new Date();
            const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
            const timeDiffMinutes = timeDiffMs / (1000 * 60);
            if (timeDiffMinutes > 0) {
                totalTimeSpent.current += timeDiffMinutes;
            }
            lastSavedTime.current = now;
        }
    }, []);

    // Auto-save progress function
    const saveProgress = useCallback(async (silent = false, timeToSave = null) => {
        if (!isEnrolled || !enrollment || !currentLesson || isComplete) {
            if (!silent) {
                console.log('Auto-save skipped:', { isEnrolled, hasEnrollment: !!enrollment, hasCurrentLesson: !!currentLesson, isComplete });
            }
            return;
        }

        const enrollmentId = enrollment.id || enrollment._id;
        const lessonId = currentLesson._id?.toString() || currentLesson.id?.toString();

        if (!enrollmentId) {
            console.error('Auto-save error: Missing enrollment ID', { enrollment });
            return;
        }

        if (!lessonId) {
            console.error('Auto-save error: Missing lesson ID', { currentLesson });
            return;
        }

        try {
            // Use provided time or calculate from tracking
            let timeSpentToSave = timeToSave;
            if (timeSpentToSave === null) {
                if (lastSavedTime.current) {
                    const now = new Date();
                    const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                    timeSpentToSave = Math.max(0, Math.round(timeDiffMs / 1000 / 60));
                } else {
                    timeSpentToSave = Math.round(totalTimeSpent.current);
                }
            }

            // Only save if there's actual time spent or it's a manual save
            if (timeSpentToSave === 0 && silent && !hasUnsavedChanges.current) {
                return;
            }

            await updateLessonProgress({
                enrollmentId: enrollmentId,
                lessonId: lessonId,
                status: 'in_progress',
                timeSpent: timeSpentToSave,
            }).unwrap();

            // Reset tracking after save
            if (lastSavedTime.current) {
                lastSavedTime.current = new Date();
            }
            if (timeSpentToSave > 0) {
                totalTimeSpent.current = 0; // Reset accumulated time
            }
            hasUnsavedChanges.current = false;

            if (!silent) {
                toast.success('Progress saved successfully');
            }
        } catch (error) {
            // Extract error message from RTK Query error
            const errorMessage = error?.data?.error?.message
                || error?.data?.message
                || error?.message
                || 'Unknown error';
            const errorCode = error?.data?.error?.code || error?.status || 'UNKNOWN';

            console.error('Auto-save detailed error:', {
                message: errorMessage,
                code: errorCode,
                status: error?.status,
                data: error?.data,
                fullError: error,
                enrollmentId: enrollmentId,
                lessonId: lessonId,
            });

            if (!silent) {
                toast.error(`Failed to save progress: ${errorMessage}`);
            }
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, updateLessonProgress, toast]);

    // Handle tab visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = useCallback(async () => {
        if (!isEnrolled || !enrollment || !currentLesson || isComplete) return;

        if (document.hidden) {
            // Tab switched or window minimized - stop tracking and save
            isPageVisible.current = false;
            stopTimeTracking();

            // Calculate and save time spent
            if (lastSavedTime.current) {
                const now = new Date();
                const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                const timeDiffMinutes = Math.max(0, Math.round(timeDiffMs / 1000 / 60));

                if (timeDiffMinutes > 0 || totalTimeSpent.current > 0) {
                    setIsSavingProgress(true);
                    try {
                        const timeToSave = timeDiffMinutes + Math.round(totalTimeSpent.current);
                        await saveProgress(true, timeToSave);
                        setShowTabSwitchWarning(true);
                    } catch (error) {
                        console.error('Error saving progress on tab switch:', error);
                    } finally {
                        setIsSavingProgress(false);
                    }
                } else {
                    setShowTabSwitchWarning(true);
                }
            } else {
                setShowTabSwitchWarning(true);
            }
        } else {
            // Tab is visible again - resume tracking
            isPageVisible.current = true;
            if (!lastSavedTime.current) {
                lastSavedTime.current = new Date();
            } else {
                // Update last saved time to now (gap time is not counted)
                lastSavedTime.current = new Date();
            }
            startTimeTracking();
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, saveProgress, startTimeTracking, stopTimeTracking]);

    // Handle page leave warning
    const handleBeforeLeave = useCallback(async () => {
        if (!isEnrolled || !enrollment || !currentLesson || isComplete) return;

        // Stop tracking
        stopTimeTracking();

        // Save progress before leaving
        setIsSavingProgress(true);
        try {
            if (lastSavedTime.current) {
                const now = new Date();
                const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                const timeDiffMinutes = Math.max(0, Math.round(timeDiffMs / 1000 / 60));
                const timeToSave = timeDiffMinutes + Math.round(totalTimeSpent.current);
                await saveProgress(true, timeToSave);
            } else {
                await saveProgress(true);
            }
        } catch (error) {
            console.error('Error saving progress before leave:', error);
        } finally {
            setIsSavingProgress(false);
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, saveProgress, stopTimeTracking]);

    // Use leave warning hook - MUST be called before any early returns
    useLeaveWarning(isEnrolled && !isComplete, handleBeforeLeave);

    // Mark lesson as in progress when user starts and initialize time tracking
    useEffect(() => {
        if (isEnrolled && enrollment && currentLesson && !isComplete) {
            const lessonId = currentLesson._id?.toString() || currentLesson.id?.toString();
            const lessonProgress = enrollment.lessonProgress?.find((lp) =>
                lp.lessonId === lessonId || lp.lessonId === lessonId.toString()
            );

            // If lesson is not started yet, mark as in_progress
            if (!lessonProgress || lessonProgress.status === 'not_started') {
                updateLessonProgress({
                    enrollmentId: enrollment.id,
                    lessonId: lessonId,
                    status: 'in_progress',
                    timeSpent: 0,
                }).catch(err => {
                    console.log('Could not mark lesson as in progress:', err);
                });
            }

            // Initialize time tracking
            sessionStartTime.current = new Date();
            lastSavedTime.current = new Date();
            totalTimeSpent.current = 0;
            isPageVisible.current = !document.hidden;
            startTimeTracking();
            hasUnsavedChanges.current = true;

            return () => {
                stopTimeTracking();
            };
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, updateLessonProgress, startTimeTracking, stopTimeTracking]);

    // Handle visibility change (tab switch, minimize, etc.)
    useEffect(() => {
        if (isEnrolled && enrollment && currentLesson && !isComplete) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, handleVisibilityChange]);

    // Periodic auto-save (every 2 minutes) using time tracking
    useEffect(() => {
        if (isEnrolled && enrollment && currentLesson && !isComplete && isPageVisible.current) {
            const saveInterval = setInterval(() => {
                if (hasUnsavedChanges.current && !document.hidden) {
                    saveProgress(true); // Silent auto-save
                }
            }, 120000); // 2 minutes

            return () => {
                clearInterval(saveInterval);
            };
        }
    }, [isEnrolled, enrollment, currentLesson, isComplete, saveProgress]);

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = (e) => {
            if (hasUnsavedChanges.current && isEnrolled && !isComplete) {
                e.preventDefault();
                setShowLeaveWarning(true);
                pendingNavigation.current = () => {
                    window.history.back();
                };
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isEnrolled, isComplete]);

    // Handle leave warning modal actions
    const handleStayOnPage = () => {
        setShowLeaveWarning(false);
        pendingNavigation.current = null;
    };

    const handleLeavePage = async () => {
        stopTimeTracking();
        setIsSavingProgress(true);
        try {
            if (lastSavedTime.current) {
                const now = new Date();
                const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                const timeDiffMinutes = Math.max(0, Math.round(timeDiffMs / 1000 / 60));
                const timeToSave = timeDiffMinutes + Math.round(totalTimeSpent.current);
                await saveProgress(true, timeToSave);
            } else {
                await saveProgress(true);
            }
            setShowLeaveWarning(false);
            if (pendingNavigation.current) {
                pendingNavigation.current();
                pendingNavigation.current = null;
            } else {
                router.push(`/topics/${params.id}`);
            }
        } catch (error) {
            toast.error('Failed to save progress. Please try again.');
        } finally {
            setIsSavingProgress(false);
        }
    };

    // Handle tab switch warning modal actions
    const handleTabSwitchClose = () => {
        setShowTabSwitchWarning(false);
        // Resume tracking when user acknowledges
        if (!document.hidden) {
            isPageVisible.current = true;
            if (!lastSavedTime.current) {
                lastSavedTime.current = new Date();
            }
            startTimeTracking();
        }
    };

    // Early returns AFTER all hooks
    if (isLoadingTopic) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-20">
                    <FaSpinner className="text-6xl mb-4 mx-auto animate-spin text-primary-500" />
                    <h2 className="text-2xl font-bold mb-2">Loading lesson...</h2>
                </div>
            </div>
        );
    }

    if (topicError || !topic || !currentLesson) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
                    <p className="text-foreground-secondary mb-6">The lesson you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href={`/topics/${params.id}`}>
                        <Button>Back to Topic</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Handle answer submission from PracticeQuestion component
    const handleAnswerSubmitted = (result) => {
        setQuestionResults(prev => ({
            ...prev,
            [result.questionIndex]: {
                isCorrect: result.isCorrect,
                xpAwarded: result.xpAwarded,
            }
        }));
    };

    const handleComplete = async () => {
        if (!isEnrolled || !enrollment || !currentLesson) {
            toast.error('Please enroll in this topic first');
            router.push(`/topics/${params.id}`);
            return;
        }

        try {
            stopTimeTracking();
            const lessonId = currentLesson._id?.toString() || currentLesson.id?.toString();

            // Calculate total time spent
            let finalTimeSpent = Math.round(totalTimeSpent.current);
            if (lastSavedTime.current) {
                const now = new Date();
                const timeDiffMs = now.getTime() - lastSavedTime.current.getTime();
                const timeDiffMinutes = Math.max(0, Math.round(timeDiffMs / 1000 / 60));
                finalTimeSpent += timeDiffMinutes;
            }
            // Minimum 1 minute if lesson was completed
            if (finalTimeSpent === 0) {
                finalTimeSpent = 1;
            }

            await updateLessonProgress({
                enrollmentId: enrollment.id,
                lessonId: lessonId,
                status: 'completed',
                timeSpent: finalTimeSpent,
            }).unwrap();

            setIsComplete(true);
            toast.success('Lesson completed! Great job!');
        } catch (error) {
            console.error('Error updating lesson progress:', error);
            const errorMsg = error?.data?.error?.message || error?.data?.message || 'Failed to update progress';
            toast.error(errorMsg);
        }
    };

    const sections = [
        { id: 'concept', label: 'Concept', icon: FaBook },
        { id: 'examples', label: 'Examples', icon: FaLightbulb },
        { id: 'practice', label: 'Practice', icon: FaPencilAlt },
        { id: 'quiz', label: 'Quiz', icon: FaQuestionCircle }
    ];

    // Extract content from lesson
    const introduction = lessonContent?.introduction || '';
    const explanation = lessonContent?.explanation || '';
    const workedExamples = lessonContent?.worked_examples || [];
    const practiceExercises = lessonContent?.practice_exercises || [];
    const quiz = lessonContent?.quiz || [];

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-[var(--card-border)]">
                <div className="p-4 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/topics/${params.id}`}
                            className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground font-medium transition-colors group"
                        >
                            <FaArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to {topic.title}
                        </Link>

                        <div className="flex items-center gap-4">
                            <UserXPBadge />
                            <span className="text-sm text-foreground-secondary">
                                Lesson {currentLessonIndex + 1} of {sortedLessons.length}
                            </span>
                            <div className="w-32">
                                <Progress value={(currentLessonIndex + 1) / sortedLessons.length} size="sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
                {/* Lesson Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 lg:p-12 text-white">
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-white/20 text-white border-0">{topic.title}</Badge>
                            <Badge className="bg-white/20 text-white border-0">
                                <FaClock className="mr-1" />
                                {currentLesson.estimatedTime || 15} min
                            </Badge>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-display font-black mb-4">
                            {currentLesson.title}
                        </h1>

                        {introduction && (
                            <p className="text-white/80 text-lg max-w-2xl">
                                {introduction.substring(0, 150)}...
                            </p>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute -right-16 top-8 w-24 h-24 rounded-full bg-white/5"></div>
                </div>

                {/* Section Tabs */}
                <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
                    {sections.map((section) => {
                        const IconComponent = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(section.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${currentSection === section.id
                                    ? 'bg-white dark:bg-neutral-700 shadow-md text-primary-600 dark:text-primary-400'
                                    : 'text-foreground-secondary hover:text-foreground'
                                    }`}
                            >
                                <IconComponent />
                                <span className="hidden sm:inline">{section.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Concept Section */}
                {currentSection === 'concept' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card className="overflow-hidden">
                            <CardHeader className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
                                <CardTitle className="flex items-center gap-3">
                                    <FaBook />
                                    Understanding the Concept
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                {introduction && explanation ? (
                                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-4">
                                        <p className="text-foreground-secondary text-lg leading-relaxed">
                                            {introduction}
                                        </p>
                                        <p className="text-foreground-secondary text-lg leading-relaxed">
                                            {explanation}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <HiInbox className="text-5xl mb-4 mx-auto text-foreground-secondary" />
                                        <h3 className="text-xl font-bold mb-2">Content Coming Soon</h3>
                                        <p className="text-foreground-secondary">
                                            We&apos;re working on adding detailed content for this lesson.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {introduction && explanation && (
                            <div className="flex justify-end">
                                <Button onClick={() => setCurrentSection('examples')}>
                                    Continue to Examples →
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Examples Section */}
                {currentSection === 'examples' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card>
                            <CardHeader className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-900">
                                <CardTitle className="flex items-center gap-3 text-neutral-900 dark:text-neutral-100">
                                    <FaLightbulb className="text-primary-500 dark:text-primary-400" />
                                    Worked Examples
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                {workedExamples && workedExamples.length > 0 ? (
                                    <div className="space-y-6">
                                        {workedExamples.map((example, index) => (
                                            <div
                                                key={index}
                                                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold mb-2 text-lg text-neutral-900 dark:text-neutral-100">{example.example}</h4>
                                                        {example.steps && example.steps.length > 0 && (
                                                            <ol className="list-decimal list-inside space-y-2 text-neutral-700 dark:text-neutral-300 ml-2">
                                                                {example.steps.map((step, stepIndex) => (
                                                                    <li key={stepIndex} className="leading-relaxed">{step}</li>
                                                                ))}
                                                            </ol>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaLightbulb className="text-5xl mb-4 mx-auto text-neutral-400 dark:text-neutral-500" />
                                        <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Examples Coming Soon</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            We&apos;re working on adding examples for this lesson.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="secondary" onClick={() => setCurrentSection('concept')}>
                                ← Back to Concept
                            </Button>
                            {practiceExercises && practiceExercises.length > 0 && (
                                <Button onClick={() => setCurrentSection('practice')}>
                                    Continue to Practice →
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Practice Section */}
                {currentSection === 'practice' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* XP Display */}
                        <XPDisplay
                            topicId={params.id}
                            lessonId={currentLesson._id?.toString() || currentLesson.id?.toString() || params.lessonId}
                        />

                        <Card>
                            <CardHeader className="border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
                                <CardTitle className="flex items-center gap-3">
                                    <FaPencilAlt />
                                    Practice Exercises
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                {practiceExercises && practiceExercises.length > 0 ? (
                                    <div className="space-y-6">
                                        {practiceExercises.map((exercise, index) => {
                                            // Validate that exercise has an answer before rendering
                                            if (!exercise.answer) {
                                                console.warn(`Practice exercise at index ${index} is missing an answer field`);
                                            }
                                            return (
                                                <PracticeQuestion
                                                    key={index}
                                                    exercise={exercise}
                                                    questionIndex={index}
                                                    topicId={params.id}
                                                    lessonId={currentLesson._id?.toString() || currentLesson.id?.toString() || params.lessonId}
                                                    questionType="practice"
                                                    correctAnswer={exercise.answer || ''}
                                                    onAnswerSubmitted={handleAnswerSubmitted}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaPencilAlt className="text-5xl mb-4 mx-auto text-foreground-secondary" />
                                        <h3 className="text-xl font-bold mb-2">Practice Exercises Coming Soon</h3>
                                        <p className="text-foreground-secondary">
                                            We&apos;re working on adding practice exercises for this lesson.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="secondary" onClick={() => setCurrentSection('examples')}>
                                ← Back to Examples
                            </Button>
                            {quiz && quiz.length > 0 && (
                                <Button onClick={() => setCurrentSection('quiz')}>
                                    Take Quiz →
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Quiz Section */}
                {currentSection === 'quiz' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* XP Display */}
                        <XPDisplay
                            topicId={params.id}
                            lessonId={currentLesson._id?.toString() || currentLesson.id?.toString() || params.lessonId}
                        />

                        <Card>
                            <CardHeader className="border-b border-[var(--card-border)] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                                <CardTitle className="flex items-center gap-3">
                                    <FaQuestionCircle />
                                    Quiz
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                {quiz && quiz.length > 0 ? (
                                    <div className="space-y-6">
                                        {quiz.map((question, index) => {
                                            // Quiz questions can have optional answers in content (for reference)
                                            // But they will be reviewed by admin, so answers are not required
                                            // Check for answer in multiple possible fields: answer, correctAnswer, solution
                                            const quizAnswer = question.answer || question.correctAnswer || question.solution || '';
                                            return (
                                                <PracticeQuestion
                                                    key={index}
                                                    exercise={question}
                                                    questionIndex={index}
                                                    topicId={params.id}
                                                    lessonId={currentLesson._id?.toString() || currentLesson.id?.toString() || params.lessonId}
                                                    questionType="quiz"
                                                    correctAnswer={quizAnswer}
                                                    onAnswerSubmitted={handleAnswerSubmitted}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaQuestionCircle className="text-5xl mb-4 mx-auto text-foreground-secondary" />
                                        <h3 className="text-xl font-bold mb-2">Quiz Coming Soon</h3>
                                        <p className="text-foreground-secondary">
                                            We&apos;re working on adding quiz questions for this lesson.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="secondary" onClick={() => setCurrentSection('practice')}>
                                ← Back to Practice
                            </Button>
                        </div>
                    </div>
                )}

                {/* Leave Warning Modal */}
                <LeaveWarningModal
                    isOpen={showLeaveWarning}
                    onStay={handleStayOnPage}
                    onLeave={handleLeavePage}
                    isSaving={isSavingProgress}
                />

                {/* Tab Switch Warning Modal */}
                <LeaveWarningModal
                    isOpen={showTabSwitchWarning}
                    onStay={handleTabSwitchClose}
                    onLeave={handleTabSwitchClose}
                    isSaving={isSavingProgress}
                    message="Your learning has been stopped"
                    description="You switched tabs or minimized the window. Your progress has been saved automatically. Click OK to continue learning."
                    stayButtonText="Resume"
                    leaveButtonText="OK"
                />

                {/* Completion Card */}
                {isComplete ? (
                    <Card className="text-center overflow-hidden">
                        <CardContent className="py-12">
                            <div className="text-6xl mb-4 animate-bounce-in">🎉</div>
                            <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
                            <p className="text-foreground-secondary mb-6">
                                Great job! You&apos;ve mastered this lesson.
                            </p>
                            <div className="flex justify-center gap-4">
                                {nextLesson && (
                                    <Link href={`/topics/${params.id}/lesson/${nextLesson._id || nextLesson.id || nextLesson.order}`}>
                                        <Button>Next Lesson →</Button>
                                    </Link>
                                )}
                                <Link href={`/topics/${params.id}`}>
                                    <Button variant="secondary">Back to Topic</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Navigation Footer */
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex gap-3">
                            {prevLesson && (
                                <Link href={`/topics/${params.id}/lesson/${prevLesson._id || prevLesson.id || prevLesson.order}`}>
                                    <Button variant="secondary">
                                        ← Previous
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <Button
                            onClick={handleComplete}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            disabled={isUpdatingProgress || !isEnrolled}
                        >
                            {isUpdatingProgress ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="mr-2" />
                                    Mark as Complete
                                </>
                            )}
                        </Button>

                        <div className="flex gap-3">
                            {nextLesson ? (
                                <Link href={`/topics/${params.id}/lesson/${nextLesson._id || nextLesson.id || nextLesson.order}`}>
                                    <Button>
                                        Next →
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/topics/${params.id}`}>
                                    <Button variant="secondary">
                                        Finish Topic
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
