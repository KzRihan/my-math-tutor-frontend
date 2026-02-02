'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Progress from '@/components/ui/Progress';
import Badge, { DifficultyBadge, StatusBadge } from '@/components/ui/Badge';
import { useGetPublishedTopicQuery, useGetPublishedTopicsQuery } from '@/store/topicApi';
import { 
    useGetEnrollmentQuery,
    useEnrollInTopicMutation,
    useUpdateLessonProgressMutation
} from '@/store/enrollmentApi';
import { 
    useGenerateLessonsMutation,
    useSaveLessonsMutation,
    useGenerateLessonContentMutation,
    useSaveLessonContentMutation
} from '@/store/adminApi';
import { useGetMeQuery } from '@/store/userApi';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';
import EnrollmentModal from '@/components/modals/EnrollmentModal';
import { 
  FaBook, 
  FaClock, 
  FaCheckCircle, 
  FaLock, 
  FaSpinner,
  FaArrowLeft,
  FaLink,
  FaBullseye,
  FaPlay,
  FaRobot,
  FaRocket
} from 'react-icons/fa';
import { HiInbox } from 'react-icons/hi2';
import { useState } from 'react';

export default function TopicDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [activeTab, setActiveTab] = useState(() => (
        searchParams.get('tab') === 'generate' ? 'generate' : 'lessons'
    ));
    const [contentSettings, setContentSettings] = useState({
        exercisesCount: 4,
        quizCount: 5,
        generateImages: true,
    });
    const [generatingLessonId, setGeneratingLessonId] = useState(null);
    const [newLessonsCount, setNewLessonsCount] = useState(3);
    const [isGeneratingLessons, setIsGeneratingLessons] = useState(false);
    
    const { data: topicData, isLoading: isLoadingTopic, error: topicError, refetch: refetchTopic } = useGetPublishedTopicQuery(params.id);
    const { data: allTopicsData } = useGetPublishedTopicsQuery({ limit: 1000 });
    const { data: enrollmentData, isLoading: isLoadingEnrollment } = useGetEnrollmentQuery(params.id, {
        skip: !params.id, // Skip if no topic ID
    });
    const { data: userData } = useGetMeQuery();
    const [enrollInTopic, { isLoading: isEnrolling }] = useEnrollInTopicMutation();
    const [generateLessons] = useGenerateLessonsMutation();
    const [saveLessons] = useSaveLessonsMutation();
    const [generateLessonContent] = useGenerateLessonContentMutation();
    const [saveLessonContent] = useSaveLessonContentMutation();
    
    const topic = topicData?.data;
    const allTopics = allTopicsData?.data || [];
    const lessons = topic?.lessons || [];
    const enrollment = enrollmentData?.data;
    const isEnrolled = !!enrollment;
    const user = userData?.data;
    const userLearnLevel = user?.learnLevel;
    
    // Check if user can enroll in this topic
    const canEnroll = !userLearnLevel || userLearnLevel === topic?.gradeBand;

    const clampNumber = (value, min, max) => {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return min;
        return Math.max(min, Math.min(max, parsed));
    };

    const handleGenerateContent = async (lesson) => {
        if (!topic) {
            toast.error('Topic data is not available. Please try again.');
            return;
        }

        const lessonId = lesson._id?.toString() || lesson.id?.toString();
        const topicId = topic.id || topic._id;

        if (!lessonId || !topicId) {
            toast.error('Missing lesson or topic ID. Please refresh and try again.');
            return;
        }

        try {
            setGeneratingLessonId(lessonId);

            const generatedResult = await generateLessonContent({
                topicTitle: topic.title,
                lessonTitle: lesson.title,
                grade: topic.gradeBand,
                difficultyLevel: topic.difficulty,
                exercisesCount: contentSettings.exercisesCount,
                quizCount: contentSettings.quizCount,
                generateImages: contentSettings.generateImages,
            }).unwrap();

            const lessonContent = generatedResult?.data?.lesson || generatedResult?.lesson;

            if (!lessonContent) {
                throw new Error('No lesson content returned from the generator.');
            }

            await saveLessonContent({
                topicId,
                lessonId,
                content: lessonContent,
            }).unwrap();

            toast.success(`Content generated for "${lesson.title}"`);
            refetchTopic();
        } catch (error) {
            const errorMessage = error?.data?.error?.message
                || error?.data?.message
                || error?.error
                || error?.message
                || 'Failed to generate content. Please try again.';
            toast.error(errorMessage);
        } finally {
            setGeneratingLessonId(null);
        }
    };

    const handleGenerateLessons = async () => {
        if (!topic) {
            toast.error('Topic data is not available. Please try again.');
            return;
        }

        const topicId = topic.id || topic._id;
        if (!topicId) {
            toast.error('Missing topic ID. Please refresh and try again.');
            return;
        }

        try {
            setIsGeneratingLessons(true);
            const lessonsResult = await generateLessons({
                topicTitle: topic.title,
                grade: topic.gradeBand,
                difficultyLevel: topic.difficulty,
                numberOfLessons: newLessonsCount,
            }).unwrap();

            const lessonsArray = lessonsResult?.data?.lessons || lessonsResult?.lessons || [];
            if (!lessonsArray.length) {
                throw new Error('No lessons were generated.');
            }

            const existingTitles = new Set(
                (topic.lessons || []).map((lesson) => (lesson.title || '').trim().toLowerCase())
            );
            const uniqueLessons = lessonsArray.filter((title) => {
                const normalized = (title || '').trim().toLowerCase();
                return normalized && !existingTitles.has(normalized);
            });

            if (!uniqueLessons.length) {
                toast.info('All generated lessons already exist in this topic.');
                return;
            }

            await saveLessons({
                topicId,
                lessons: uniqueLessons,
            }).unwrap();

            toast.success(`Added ${uniqueLessons.length} new lesson(s).`);
            refetchTopic();
        } catch (error) {
            const errorMessage = error?.data?.error?.message
                || error?.data?.message
                || error?.error
                || error?.message
                || 'Failed to generate lessons. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsGeneratingLessons(false);
        }
    };

    if (isLoadingTopic) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-20">
                    <FaSpinner className="text-6xl mb-4 mx-auto animate-spin text-primary-500" />
                    <h2 className="text-2xl font-bold mb-2">Loading topic...</h2>
                </div>
            </div>
        );
    }

    if (topicError || !topic) {
        return (
            <div className="p-6 lg:p-8">
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Topic Not Found</h2>
                    <p className="text-foreground-secondary mb-6">The topic you&apos;re looking for doesn&apos;t exist or is not published.</p>
                    <Link href="/topics">
                        <Button>Back to Topics</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const prerequisiteTopics = (topic.prerequisites || [])
        .map(id => allTopics.find(t => t.id === id))
        .filter(Boolean);
    
    // Get progress from enrollment or default to 0
    const completedLessons = enrollment?.lessonsCompleted || 0;
    const progressPercent = enrollment?.progress || 0;
    const estimatedDuration = lessons.reduce((sum, lesson) => sum + (lesson.estimatedTime || 15), 0);

    // Handle enrollment
    const handleEnroll = async () => {
        try {
            await enrollInTopic(params.id).unwrap();
            toast.success('Successfully enrolled! Start learning now.');
        } catch (error) {
            const errorMsg = error?.data?.error?.message || error?.data?.message || 'Failed to enroll. Please try again.';
            toast.error(errorMsg);
        }
    };

    // Get lesson progress from enrollment
    const getLessonProgress = (lessonId) => {
        if (!enrollment?.lessonProgress) return null;
        return enrollment.lessonProgress.find((lp) => 
            lp.lessonId === lessonId || lp.lessonId === lessonId.toString()
        );
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Back Button */}
            <Link
                href="/topics"
                className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground font-medium transition-colors group"
            >
                <FaArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Topics
            </Link>

            {/* Header Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Topic Overview */}
                <div className="lg:col-span-2">
                    <Card variant="glass" className="p-8">
                        <div className="flex items-start gap-6 mb-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                                <FaBook />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <StatusBadge status={topic.status} />
                                    <DifficultyBadge level={topic.difficulty} />
                                </div>
                                <h1 className="text-3xl font-display font-black mb-3">{topic.title}</h1>
                                <p className="text-foreground-secondary text-lg mb-4">{topic.subtitle || 'Explore this topic to learn more.'}</p>

                                <div className="flex flex-wrap gap-6 text-sm text-foreground-secondary">
                                    <span className="flex items-center gap-2">
                                        <FaBook className="text-xl" />
                                        <strong className="text-foreground">{lessons.length}</strong> lessons
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaClock className="text-xl" />
                                        <strong className="text-foreground">{formatDuration(estimatedDuration)}</strong> total
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaCheckCircle className="text-xl" />
                                        <strong className="text-foreground">{completedLessons}/{lessons.length}</strong> completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {isEnrolled && lessons.length > 0 ? (
                            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-950/30 dark:to-primary-900/20 border border-primary-200/50 dark:border-primary-800/50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-lg">Your Progress</span>
                                    <span className="text-2xl font-black text-primary-600">{Math.round(progressPercent)}%</span>
                                </div>
                                <Progress value={progressPercent / 100} size="lg" variant="primary" />
                                <p className="text-sm text-foreground-secondary mt-2 text-center">
                                    {completedLessons} of {lessons.length} lessons completed
                                </p>
                            </div>
                        ) : !isEnrolled && lessons.length > 0 ? (
                            <div className="mt-8">
                                {canEnroll ? (
                                    <Button 
                                        className="w-full btn-lg font-bold"
                                        onClick={() => setShowEnrollmentModal(true)}
                                    >
                                        <FaRocket className="text-lg mr-2" />
                                        Start Learning
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                            <div className="flex items-center gap-3">
                                                <FaLock className="text-neutral-400 dark:text-neutral-500 text-xl" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                        This topic is for {topic?.gradeBand || 'another'} level
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                        You can only enroll in {userLearnLevel || 'your'} level topics
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            className="w-full btn-lg font-bold"
                                            disabled
                                        >
                                            <FaLock className="text-lg mr-2" />
                                            Enrollment Restricted
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-8">
                                <Button className="w-full btn-lg font-bold" disabled>
                                    <FaRocket className="text-lg mr-2" />
                                    No Lessons Available
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Prerequisites */}
                    {prerequisiteTopics.length > 0 && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FaLink />
                                    Prerequisites
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {prerequisiteTopics.map(prereq => (
                                    <Link key={prereq.id} href={`/topics/${prereq.id}`}>
                                        <div className="p-3 rounded-xl bg-background-secondary hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors border border-transparent hover:border-primary-300 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <FaBook className="text-2xl text-primary-500" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{prereq.title}</p>
                                                    <p className="text-xs text-foreground-secondary">
                                                        {prereq.lessonsCount || 0} lessons
                                                    </p>
                                                </div>
                                                <StatusBadge status={prereq.status} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Stats */}
                    <Card variant="premium" className="text-center p-6">
                        <div className="relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                                <FaBullseye className="text-3xl text-success" />
                            </div>
                            <h3 className="font-black text-2xl mb-2">{Math.round(progressPercent)}%</h3>
                            <p className="text-sm text-foreground-secondary font-medium">Overall Mastery</p>
                            {!isEnrolled && (
                                <p className="text-xs text-foreground-secondary mt-2">
                                    Enroll to track progress
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Resume Learning Banner */}
            {isEnrolled && enrollment && lessons.length > 0 && (
                (() => {
                    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
                    const inProgressLesson = sortedLessons.find((lesson) => {
                        const lessonId = lesson._id?.toString() || lesson.id?.toString();
                        const lessonProgress = getLessonProgress(lessonId);
                        return lessonProgress?.status === 'in_progress';
                    });

                    if (inProgressLesson) {
                        const lessonId = inProgressLesson._id?.toString() || inProgressLesson.id?.toString();
                        return (
                            <Card variant="premium" className="mb-6 border-l-4 border-l-primary-500">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                                <FaPlay className="text-xl text-primary-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">Continue Learning</h3>
                                                <p className="text-sm text-foreground-secondary">
                                                    You were learning: <span className="font-semibold text-foreground">{inProgressLesson.title}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/topics/${topic.id}/lesson/${lessonId || inProgressLesson.order}`}>
                                            <Button>
                                                <FaPlay className="mr-2" />
                                                Resume
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }
                    return null;
                })()
            )}

            {/* Lessons Section */}
            <div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                        <FaBook />
                        Lessons & Activities
                    </h2>
                    <div className="inline-flex items-center gap-1 rounded-xl bg-background-secondary border border-[var(--card-border)] p-1">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'lessons'
                                    ? 'bg-primary-500 text-white shadow'
                                    : 'text-foreground-secondary hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('lessons')}
                        >
                            Lessons
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'generate'
                                    ? 'bg-primary-500 text-white shadow'
                                    : 'text-foreground-secondary hover:text-foreground'
                            }`}
                            onClick={() => setActiveTab('generate')}
                        >
                            Generate Content
                        </button>
                    </div>
                </div>

                {activeTab === 'lessons' && (
                    lessons.length > 0 ? (
                        <div className="grid gap-4">
                            {[...lessons]
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((lesson, index) => {
                                    const lessonContent = lesson?.content?.lesson || lesson?.content || null;
                                    const hasContent = lessonContent && Object.keys(lessonContent).length > 0;
                                    const lessonId = lesson._id?.toString() || lesson.id?.toString();
                                    
                                    // Get lesson progress from enrollment
                                    const lessonProgress = getLessonProgress(lessonId);
                                    const isCompleted = lessonProgress?.status === 'completed';
                                    const isInProgress = lessonProgress?.status === 'in_progress';
                                    
                                    // Lessons are locked if:
                                    // 1. Not enrolled and not first lesson
                                    // 2. Previous lesson doesn't have content
                                    // 3. Previous lesson is not completed (if enrolled)
                                    const prevLesson = index > 0 ? lessons[index - 1] : null;
                                    const prevLessonId = prevLesson?._id?.toString() || prevLesson?.id?.toString();
                                    const prevLessonProgress = prevLessonId ? getLessonProgress(prevLessonId) : null;
                                    const prevLessonCompleted = prevLessonProgress?.status === 'completed';
                                    
                                    const isLocked = !isEnrolled 
                                        ? index > 0 // Lock all except first if not enrolled
                                        : index > 0 && (!prevLesson?.content || (!prevLessonCompleted && isEnrolled)); // Lock if previous not completed
                                    
                                    return (
                                        <Card
                                            key={lesson._id || lesson.id || index}
                                            variant={isCompleted ? 'glass' : 'default'}
                                            interactive={!isLocked && hasContent}
                                            className={`group transition-all duration-300 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <CardContent className="flex items-center gap-6 p-6">
                                                {/* Lesson Number */}
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all ${
                                                    isCompleted
                                                        ? 'bg-success/20 text-success'
                                                        : isLocked
                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                                                            : 'bg-primary-500/20 text-primary-600 group-hover:scale-110'
                                                }`}>
                                                    {isCompleted ? <FaCheckCircle /> : isLocked ? <FaLock /> : index + 1}
                                                </div>

                                                {/* Lesson Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-bold mb-1 text-lg ${isLocked ? 'text-foreground-secondary' : ''}`}>
                                                        {lesson.title}
                                                    </h3>
                                                    <p className="text-sm text-foreground-secondary flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <FaClock className="text-xs" />
                                                            {lesson.estimatedTime || 15} min
                                                        </span>
                                                        {isCompleted && (
                                                            <span className="flex items-center gap-1 text-success font-medium">
                                                                <FaCheckCircle className="text-xs" />
                                                                Completed
                                                            </span>
                                                        )}
                                                        {isInProgress && !isCompleted && (
                                                            <span className="flex items-center gap-1 text-primary font-medium">
                                                                <FaPlay className="text-xs" />
                                                                In Progress
                                                            </span>
                                                        )}
                                                        {isLocked && (
                                                            <span className="flex items-center gap-1">
                                                                <FaLock className="text-xs" />
                                                                {!isEnrolled 
                                                                    ? 'Enroll to unlock' 
                                                                    : 'Complete previous lessons to unlock'}
                                                            </span>
                                                        )}
                                                        {!hasContent && !isLocked && (
                                                            <span className="flex items-center gap-1 text-warning font-medium">
                                                                Content coming soon
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Action Button */}
                                                {!isEnrolled && !isLocked && hasContent && (
                                                    canEnroll ? (
                                                        <Button
                                                            variant="secondary"
                                                            className="font-bold"
                                                            onClick={() => setShowEnrollmentModal(true)}
                                                        >
                                                            <FaLock className="mr-2" />
                                                            Enroll to Start
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="secondary"
                                                            className="font-bold"
                                                            disabled
                                                            title={`You can only enroll in ${userLearnLevel || 'your'} level topics`}
                                                        >
                                                            <FaLock className="mr-2" />
                                                            Enrollment Restricted
                                                        </Button>
                                                    )
                                                )}
                                                {isEnrolled && !isLocked && hasContent && (
                                                    <Link href={`/topics/${topic.id}/lesson/${lesson._id || lesson.id || lesson.order}`}>
                                                        <Button
                                                            variant={isCompleted ? 'secondary' : 'primary'}
                                                            className="font-bold"
                                                        >
                                                            {isCompleted ? (
                                                                <>
                                                                    <FaBook className="mr-2" />
                                                                    Review
                                                                </>
                                                            ) : isInProgress ? (
                                                                <>
                                                                    <FaPlay className="mr-2" />
                                                                    Continue
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaPlay className="mr-2" />
                                                                    Start
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                        </div>
                    ) : (
                        <Card variant="glass" className="p-12 text-center">
                            <HiInbox className="text-5xl mb-4 mx-auto text-foreground-secondary" />
                            <h3 className="text-xl font-bold mb-2">Lessons Coming Soon</h3>
                            <p className="text-foreground-secondary">
                                We&apos;re working on creating engaging lessons for this topic. Check back soon!
                            </p>
                        </Card>
                    )
                )}

                {activeTab === 'generate' && (
                    <div className="space-y-6">
                        <Card variant="glass" className="p-6">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FaRobot />
                                    Add Lessons
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
                                    <Input
                                        label="Number of lessons"
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={newLessonsCount}
                                        onChange={(event) => {
                                            const value = clampNumber(event.target.value, 1, 5);
                                            setNewLessonsCount(value);
                                        }}
                                    />
                                    <Button
                                        className="font-bold sm:mt-6"
                                        onClick={handleGenerateLessons}
                                        loading={isGeneratingLessons}
                                        disabled={isGeneratingLessons}
                                    >
                                        {isGeneratingLessons ? 'Generating...' : 'Generate Lesson Titles'}
                                    </Button>
                                </div>
                                <p className="text-xs text-foreground-secondary mt-4">
                                    This will add new lessons to the topic. Generate content for each lesson below.
                                </p>
                            </CardContent>
                        </Card>

                        <Card variant="glass" className="p-6">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FaRobot />
                                    Content Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Input
                                        label="Exercises per lesson"
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={contentSettings.exercisesCount}
                                        onChange={(event) => {
                                            const value = clampNumber(event.target.value, 1, 5);
                                            setContentSettings((prev) => ({ ...prev, exercisesCount: value }));
                                        }}
                                    />
                                    <Input
                                        label="Quiz questions"
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={contentSettings.quizCount}
                                        onChange={(event) => {
                                            const value = clampNumber(event.target.value, 1, 5);
                                            setContentSettings((prev) => ({ ...prev, quizCount: value }));
                                        }}
                                    />
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            id="generate-images-toggle"
                                            type="checkbox"
                                            className="h-4 w-4 accent-primary-500"
                                            checked={contentSettings.generateImages}
                                            onChange={(event) => {
                                                setContentSettings((prev) => ({ ...prev, generateImages: event.target.checked }));
                                            }}
                                        />
                                        <label htmlFor="generate-images-toggle" className="text-sm font-medium text-foreground">
                                            Generate images
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-foreground-secondary mt-4">
                                    Limits: 1-5 exercises, 1-5 quiz questions per lesson.
                                </p>
                            </CardContent>
                        </Card>

                        {lessons.length > 0 ? (
                            <div className="grid gap-4">
                                {[...lessons]
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((lesson, index) => {
                                        const hasContent = lesson.content && Object.keys(lesson.content).length > 0;
                                        const lessonId = lesson._id?.toString() || lesson.id?.toString();
                                        const isGenerating = generatingLessonId === lessonId;
                                        const isBusy = generatingLessonId !== null && generatingLessonId !== lessonId;

                                        return (
                                            <Card key={lesson._id || lesson.id || index} variant="glass">
                                                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">{lesson.title}</h3>
                                                            <p className="text-sm text-foreground-secondary">
                                                                {hasContent ? 'Content ready' : 'No content yet'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant={hasContent ? 'secondary' : 'primary'}
                                                            className="font-bold"
                                                            loading={isGenerating}
                                                            disabled={isGenerating || isBusy}
                                                            onClick={() => handleGenerateContent(lesson)}
                                                        >
                                                            {hasContent ? 'Regenerate' : 'Generate'}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </div>
                        ) : (
                            <Card variant="glass" className="p-12 text-center">
                                <HiInbox className="text-5xl mb-4 mx-auto text-foreground-secondary" />
                                <h3 className="text-xl font-bold mb-2">No Lessons Available</h3>
                                <p className="text-foreground-secondary">
                                    This topic does not have lessons yet. Add lessons before generating content.
                                </p>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Enrollment Modal */}
            <EnrollmentModal
                isOpen={showEnrollmentModal && canEnroll}
                onClose={() => setShowEnrollmentModal(false)}
                topic={topic}
                onEnroll={handleEnroll}
            />
        </div>
    );
}
