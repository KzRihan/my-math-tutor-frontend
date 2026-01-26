'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { topics, lessons, exercises, GRADE_BANDS, DIFFICULTY_LEVELS } from '@/data/admin-data';
import { cn } from '@/lib/utils';
import { 
    useGenerateLessonContentMutation,
    useSaveLessonContentMutation,
    useSaveLessonsMutation,
    useGetTopicQuery,
    usePublishTopicMutation,
    useUnpublishTopicMutation
} from '@/store/adminApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaClipboardList, FaBook, FaQuestionCircle, FaEdit, FaRobot, FaEye, FaRocket, FaSave, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

const TABS = [
    { id: 'info', label: 'Basic Info', icon: FaClipboardList },
    { id: 'lessons', label: 'Lessons', icon: FaBook },
    { id: 'exercises', label: 'Exercises', icon: FaQuestionCircle },
    { id: 'quiz', label: 'Quiz Setup', icon: FaEdit },
    { id: 'ai', label: 'AI Generation', icon: FaRobot },
];

export default function TopicEditorPage() {
    const params = useParams();
    const topicId = params.id;
    const [activeTab, setActiveTab] = useState('info');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [generatingLessonId, setGeneratingLessonId] = useState(null);
    // State for customizable content generation settings per lesson
    const [lessonSettings, setLessonSettings] = useState({});
    const [generateImages, setGenerateImages] = useState(true);

    // RTK Query hooks
    const { data: topicResponse, isLoading: isLoadingTopic, error: topicError } = useGetTopicQuery(topicId);
    const [generateLessonContent] = useGenerateLessonContentMutation();
    const [saveLessonContent] = useSaveLessonContentMutation();
    const [saveLessons, { isLoading: isSavingLessons }] = useSaveLessonsMutation();
    const [publishTopic, { isLoading: isPublishing }] = usePublishTopicMutation();
    const [unpublishTopic, { isLoading: isUnpublishing }] = useUnpublishTopicMutation();
    const toast = useToast();

    // Extract topic data from API response
    const topic = topicResponse?.data || topicResponse;
    const topicLessons = topic?.lessons || [];
    const topicExercises = useMemo(() => {
        return topicLessons.flatMap((lesson) => {
            const lessonId = lesson._id || lesson.id || lesson.title;
            const exercises = lesson?.content?.practice_exercises || [];
            return exercises.map((ex, index) => ({
                id: `${lessonId}-${index}`,
                lessonTitle: lesson.title,
                question: ex.question || ex.exercise || 'Practice exercise',
                answer: ex.answer || ex.solution || '',
                diagramBase64: ex.diagram_base64 || '',
                diagramUrl: ex.diagram_url || '',
                difficulty: topic?.difficulty || 'medium',
                type: 'practice',
            }));
        });
    }, [topicLessons, topic?.difficulty]);

    // Show loading state
    if (isLoadingTopic) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="text-foreground-secondary">Loading topic...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (topicError || !topic) {
        return (
            <div className="space-y-6">
                <div className="glass-card p-6 text-center">
                    <p className="text-error mb-4">Failed to load topic. Please try again.</p>
                    <Link href="/admin/topics" className="btn btn-primary">
                        Back to Topics
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-success/10 text-success border-success/20',
            generated: 'bg-warning/10 text-warning border-warning/20',
            draft: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
            archived: 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary border-transparent',
        };
        return styles[status] || styles.draft;
    };

    const handleAddLesson = async () => {
        const title = window.prompt('New lesson title');
        if (!title || !title.trim()) {
            return;
        }

        try {
            await saveLessons({
                topicId,
                lessons: [title.trim()],
            }).unwrap();
            toast.success('Lesson added successfully');
        } catch (error) {
            const errorMsg =
                error?.data?.error?.message ||
                error?.data?.message ||
                error?.message ||
                'Failed to add lesson';
            console.error('Add lesson error:', error);
            toast.error(errorMsg);
        }
    };

    // Generate content for a specific lesson (INDEPENDENT - doesn't affect other lessons)
    const handleGenerateLessonContent = async (lessonTitle, lessonId, customSettings = {}) => {
        if (!topic || !lessonTitle || !lessonId) {
            toast.error('Topic or lesson information missing');
            return;
        }

        setGeneratingLessonId(lessonId);
        setIsGenerating(true);
        setGenerationStep(0);

        try {
            const steps = [
                'Generating lesson structure...',
                'Creating explanations...',
                'Building exercises...',
                'Generating quiz...',
                'Finalizing content...'
            ];

            // Use custom settings or defaults
            const exercisesCount = customSettings.exercisesCount || 4;
            const quizCount = customSettings.quizCount || 5;
            const imagesEnabled = customSettings.generateImages ?? generateImages;

            // Step 1: Generate lesson content
            setGenerationStep(1);
            const contentResult = await generateLessonContent({
                topicTitle: topic.title,
                lessonTitle: lessonTitle,
                grade: topic.gradeBand,
                difficultyLevel: topic.difficulty,
                exercisesCount: exercisesCount,
                quizCount: quizCount,
                generateImages: imagesEnabled,
            }).unwrap();

            // Step 2: Save lesson content
            setGenerationStep(2);
            const lessonContent = contentResult?.data?.lesson || contentResult?.lesson;
            if (lessonContent) {
                await saveLessonContent({
                    topicId: topicId,
                    lessonId: lessonId,
                    content: lessonContent,
                }).unwrap();
            } else {
                throw new Error('No content returned from AI service');
            }

            // Simulate remaining steps for better UX
            for (let i = 3; i < steps.length; i++) {
                setGenerationStep(i);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setIsGenerating(false);
            setGenerationStep(0);
            setGeneratingLessonId(null);
            toast.success(`Content generated successfully for "${lessonTitle}"!`);
            
            // Refetch topic to get updated lesson data
            // The query will automatically refetch due to cache invalidation
        } catch (error) {
            // RTK Query errors can have different structures
            let errorMsg = 'Failed to generate lesson content';
            
            // Try to extract error message from various possible structures
            if (error) {
                // RTK Query error structure: { status, data: { error: { message } } }
                if (error.data?.error?.message) {
                    errorMsg = error.data.error.message;
                } 
                // Direct data.message
                else if (error.data?.message) {
                    errorMsg = error.data.message;
                }
                // Error object with message property
                else if (error.message) {
                    errorMsg = error.message;
                }
                // String error
                else if (typeof error === 'string') {
                    errorMsg = error;
                }
            }
            
            console.error('Generation error:', {
                error,
                errorMessage: errorMsg,
                errorData: error?.data,
                errorStatus: error?.status
            });
            
            setIsGenerating(false);
            setGenerationStep(0);
            setGeneratingLessonId(null);
            toast.error(`${errorMsg}. Please try again.`);
        }
    };

    // AI Generation for all lessons (INDEPENDENT - each lesson is processed separately)
    const handleGenerateAll = async (customSettings = {}) => {
        if (!topic || topicLessons.length === 0) {
            toast.error('No lessons found to generate content for');
            return;
        }

        setIsGenerating(true);
        setGenerationStep(0);

        const results = [];
        const totalLessons = topicLessons.length;

        try {
            // Generate content for each lesson sequentially (each is independent)
            for (let i = 0; i < topicLessons.length; i++) {
                const lesson = topicLessons[i];
                const lessonId = lesson._id || lesson.id;
                
                if (!lessonId) {
                    console.warn(`Skipping lesson ${i + 1}: missing ID`);
                    results.push({ lessonId, lessonTitle: lesson.title, success: false, error: 'Missing ID' });
                    continue;
                }

                try {
                    await handleGenerateLessonContent(lesson.title, lessonId, customSettings);
                    results.push({ lessonId, lessonTitle: lesson.title, success: true });
                } catch (lessonError) {
                    console.error(`Error generating content for lesson ${i + 1}:`, lessonError);
                    results.push({ lessonId, lessonTitle: lesson.title, success: false, error: lessonError?.message });
                    // Continue with next lesson - each is independent
                }
            }

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            setIsGenerating(false);
            setGenerationStep(0);
            
            if (successful === totalLessons) {
                toast.success(`All ${successful} lessons generated successfully!`);
            } else if (successful > 0) {
                toast.success(`${successful} lesson(s) generated successfully. ${failed} lesson(s) failed - you can regenerate them individually.`);
            } else {
                toast.error('Failed to generate lesson content. Please try regenerating individual lessons.');
            }
        } catch (error) {
            console.error('Generation error:', error);
            setIsGenerating(false);
            setGenerationStep(0);
            toast.error('An error occurred. Some lessons may have been generated. Check individual lessons.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/topics"
                        className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{topic.title}</h1>
                        <p className="text-foreground-secondary">{topic.subtitle}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(topic.status)}`}>
                        {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href={`/topics/${topicId}`}
                        target="_blank"
                        className="btn btn-secondary"
                    >
                        <FaEye />
                        Preview
                    </Link>
                    {topic.status === 'published' ? (
                        <button 
                            className="btn btn-secondary"
                            onClick={async () => {
                                try {
                                    await unpublishTopic(topicId).unwrap();
                                    toast.success('Topic unpublished successfully');
                                } catch (error) {
                                    toast.error(error?.data?.error?.message || 'Failed to unpublish topic');
                                }
                            }}
                            disabled={isUnpublishing}
                        >
                            {isUnpublishing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Unpublishing...
                                </>
                            ) : (
                                <>
                                    <FaRocket />
                                    Unpublish
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary"
                            onClick={async () => {
                                try {
                                    await publishTopic(topicId).unwrap();
                                    toast.success('Topic published successfully! It will now be visible to users.');
                                } catch (error) {
                                    toast.error(error?.data?.error?.message || 'Failed to publish topic');
                                }
                            }}
                            disabled={isPublishing}
                        >
                            {isPublishing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <FaRocket />
                                    Publish Topic
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-card p-1 inline-flex gap-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                            activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'text-foreground-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        )}
                    >
                        <tab.icon className="text-base" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {/* Basic Info Tab */}
                {activeTab === 'info' && (
                    <div className="glass-card p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Topic Title</label>
                                <input
                                    type="text"
                                    defaultValue={topic.title}
                                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    defaultValue={topic.subtitle}
                                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>

                            {/* Grade Band */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Grade Band</label>
                                <select
                                    defaultValue={topic.gradeBand}
                                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                >
                                    {Object.entries(GRADE_BANDS).map(([key, band]) => (
                                        <option key={key} value={band.id}>{band.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                                <select
                                    defaultValue={topic.difficulty}
                                    className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                >
                                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                                        <option key={key} value={level.id}>{level.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Learning Objectives */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Learning Objectives</label>
                                <button className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
                                    <FaRobot className="text-sm" />
                                    Suggest with AI
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(topic.objectives || []).map((obj, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-foreground-secondary">•</span>
                                        <input
                                            type="text"
                                            defaultValue={obj}
                                            className="flex-1 px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                        <button className="p-2 rounded-lg hover:bg-error/10 text-foreground-secondary hover:text-error transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <button className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
                                    <span>➕</span>
                                    Add Objective
                                </button>
                            </div>
                        </div>

                        {/* Prerequisites */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Prerequisites</label>
                            <select
                                multiple
                                defaultValue={topic.prerequisites || []}
                                className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all min-h-[100px]"
                            >
                                {topics.filter(t => t.id !== topic.id).map((t) => (
                                    <option
                                        key={t.id}
                                        value={t.id}
                                    >
                                        {t.title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-foreground-secondary mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
                            <button className="btn btn-primary">
                                <span>💾</span>
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-foreground-secondary">
                                {topicLessons.length} lessons · Drag to reorder
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAddLesson}
                                disabled={isSavingLessons}
                            >
                                <FaPlus />
                                {isSavingLessons ? 'Adding...' : 'Add Lesson'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {topicLessons.map((lesson, index) => {
                                const lessonId = lesson._id || lesson.id;
                                return (
                                <div
                                    key={lessonId}
                                    className="glass-card p-4 flex items-center gap-4 cursor-move hover:border-primary-500/50 transition-colors group"
                                >
                                    {/* Drag Handle */}
                                    <div className="text-foreground-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                        </svg>
                                    </div>

                                    {/* Order Number */}
                                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-sm">
                                        {lesson.order}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">{lesson.title}</span>
                                            <span className={cn(
                                                'text-xs px-2 py-0.5 rounded-full',
                                                lesson.type === 'lesson' ? 'bg-primary-500/10 text-primary-500' :
                                                    lesson.type === 'practice' ? 'bg-warning/10 text-warning' :
                                                        'bg-success/10 text-success'
                                            )}>
                                                {lesson.type}
                                            </span>
                                            <span className={cn(
                                                'text-xs px-2 py-0.5 rounded-full',
                                                lesson.status === 'approved' ? 'bg-success/10 text-success' :
                                                    lesson.status === 'edited' ? 'bg-warning/10 text-warning' :
                                                        'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
                                            )}>
                                                {lesson.status}
                                            </span>
                                            {/* Content Status Badge */}
                                            {lesson.content ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                                                    Content Ready
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                                                    No Content
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground-secondary mt-0.5">
                                            {lesson.description || 'No description available'}
                                        </p>
                                    </div>

                                    {/* Meta */}
                                    <div className="text-right text-sm">
                                        <p className="text-foreground-secondary">{lesson.estimatedTime} min</p>
                                        <p className="text-foreground-secondary">{lesson.exercisesCount} exercises</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* Regenerate Content Button - Independent action */}
                                        <button
                                            onClick={() => handleGenerateLessonContent(lesson.title, lessonId)}
                                            disabled={generatingLessonId === lessonId}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors flex items-center gap-1",
                                                generatingLessonId === lessonId
                                                    ? "bg-primary-500/20 text-primary-500 cursor-not-allowed"
                                                    : lesson.content
                                                        ? "hover:bg-warning/10 text-foreground-secondary hover:text-warning"
                                                        : "hover:bg-primary-500/10 text-foreground-secondary hover:text-primary-500"
                                            )}
                                            title={lesson.content ? "Regenerate content" : "Generate content"}
                                        >
                                            {generatingLessonId === lessonId ? (
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <FaRobot className="w-4 h-4" />
                                            )}
                                        </button>
                                        <Link
                                            href={`/admin/topics/${topicId}/lessons/${lessonId}`}
                                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button className="p-2 rounded-lg hover:bg-error/10 text-foreground-secondary hover:text-error transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Exercises Tab */}
                {activeTab === 'exercises' && (
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold">All Exercises</h3>
                                <p className="text-sm text-foreground-secondary">Manage exercises across all lessons</p>
                            </div>
                            <button className="btn btn-primary btn-sm">
                                <FaPlus />
                                Add Exercise
                            </button>
                        </div>

                        <div className="space-y-3">
                            {topicExercises.length === 0 ? (
                                <div className="text-sm text-foreground-secondary text-center py-6">
                                    No exercises found yet. Generate lesson content to create exercises.
                                </div>
                            ) : (
                                topicExercises.map((ex) => (
                                    <details key={ex.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-[var(--card-border)]">
                                        <summary className="flex items-center gap-4 cursor-pointer list-none">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-warning/10">
                                                <FaEdit />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm line-clamp-1">{ex.question}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        ex.difficulty === 'easy' ? 'bg-success/10 text-success' :
                                                            ex.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                                                                'bg-error/10 text-error'
                                                    )}>
                                                        {ex.difficulty}
                                                    </span>
                                                    <span className="text-xs text-foreground-secondary">
                                                        {ex.lessonTitle}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-foreground-secondary">View</span>
                                        </summary>
                                        <div className="mt-3 text-sm text-foreground-secondary">
                                            <p className="text-foreground">{ex.question}</p>
                                            {ex.answer ? (
                                                <p className="mt-2"><span className="font-medium text-foreground">Answer:</span> {ex.answer}</p>
                                            ) : null}
                                            {ex.diagramUrl ? (
                                                <img
                                                    src={ex.diagramUrl}
                                                    alt="Exercise diagram"
                                                    className="mt-3 w-full max-w-md rounded-xl border border-[var(--card-border)]"
                                                />
                                            ) : ex.diagramBase64 ? (
                                                <img
                                                    src={`data:image/png;base64,${ex.diagramBase64}`}
                                                    alt="Exercise diagram"
                                                    className="mt-3 w-full max-w-md rounded-xl border border-[var(--card-border)]"
                                                />
                                            ) : null}
                                        </div>
                                    </details>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Quiz Setup Tab */}
                {activeTab === 'quiz' && (
                    <div className="glass-card p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-4">Quiz Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Questions</label>
                                    <input
                                        type="number"
                                        defaultValue={topic.quizQuestionsCount}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        defaultValue={70}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        defaultValue={30}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-neutral-300" />
                                <span className="text-sm">Shuffle question order</span>
                            </label>
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
                                <span className="text-sm">Allow retakes</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-[var(--card-border)]">
                            <button className="btn btn-primary">
                                <FaSave />
                                Save Quiz Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Generation Tab */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="font-semibold mb-4">AI Content Generation</h3>
                            <p className="text-sm text-foreground-secondary mb-6">
                                Use AI to automatically generate lessons, exercises, quizzes, and images for this topic.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Number of Lessons</label>
                                    <input
                                        type="number"
                                        defaultValue={6}
                                        min={3}
                                        max={15}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Exercises per Lesson</label>
                                    <input
                                        type="number"
                                        defaultValue={4}
                                        min={2}
                                        max={10}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quiz Questions</label>
                                    <input
                                        type="number"
                                        defaultValue={10}
                                        min={5}
                                        max={20}
                                        className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Content Language</label>
                                    <select className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all">
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="es">Spanish</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={generateImages}
                                        onChange={(e) => setGenerateImages(e.target.checked)}
                                        className="w-5 h-5 rounded border-neutral-300"
                                    />
                                    <span className="text-sm">Generate images with Stable Diffusion</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-neutral-300" />
                                    <span className="text-sm">Include LaTeX math expressions</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
                                    <span className="text-sm">Generate video explanations</span>
                                </label>
                            </div>

                            <button
                                onClick={handleGenerateAll}
                                disabled={isGenerating}
                                className="btn btn-primary w-full"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaRobot />
                                        Generate Content with AI
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Generation Progress */}
                        {isGenerating && (
                            <div className="glass-card p-6">
                                <h4 className="font-semibold mb-4">Generation Progress</h4>
                                <div className="space-y-3">
                                    {['Generating lesson structure...', 'Creating explanations...', 'Building exercises...', 'Generating quiz...', 'Creating images...'].map((step, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            {index < generationStep ? (
                                                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            ) : index === generationStep ? (
                                                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                            )}
                                            <span className={cn(
                                                'text-sm',
                                                index <= generationStep ? 'text-foreground' : 'text-foreground-secondary'
                                            )}>
                                                {step}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
