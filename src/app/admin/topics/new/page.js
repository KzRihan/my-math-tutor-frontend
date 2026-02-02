'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { topics, GRADE_BANDS, DIFFICULTY_LEVELS } from '@/data/admin-data';
import { cn } from '@/lib/utils';
import {
    useGenerateLessonsMutation,
    useCreateTopicMutation,
    useSaveLessonsMutation,
    useGenerateLessonContentMutation,
    useSaveLessonContentMutation
} from '@/store/adminApi';
import { useToast } from '@/components/providers/ToastProvider';
import { FaRobot, FaPencilAlt, FaBook, FaCheckCircle, FaSearch, FaSpinner, FaSave } from 'react-icons/fa';
import { HiHandRaised } from 'react-icons/hi2';

export default function NewTopicPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        gradeBand: '',
        difficulty: '',
        subject: 'Mathematics',
        prerequisite: '',
        creationMethod: 'ai',
    });

    // Learning objectives state
    const [objectives, setObjectives] = useState(['']);

    // AI settings state
    const [aiSettings, setAiSettings] = useState({
        lessonsCount: 5, // AI service limit is 5
        exercisesPerLesson: 4,
        quizQuestions: 5, // AI service limit is 5
        generateImages: true,
        includeLatex: true,
    });

    // RTK Query hooks
    const [generateLessons, { isLoading: isGeneratingLessons }] = useGenerateLessonsMutation();
    const [createTopic, { isLoading: isCreatingTopic }] = useCreateTopicMutation();
    const [saveLessons] = useSaveLessonsMutation();
    const [generateLessonContent] = useGenerateLessonContentMutation();
    const [saveLessonContent] = useSaveLessonContentMutation();
    const toast = useToast();

    // State for dynamic generation steps
    const [generationSteps, setGenerationSteps] = useState([
        { label: 'Creating topic...', icon: FaBook },
        { label: 'Generating lesson titles...', icon: FaRobot },
        { label: 'Saving lessons...', icon: FaSave },
        { label: 'Finalizing...', icon: FaCheckCircle },
    ]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle objective changes
    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };

    const addObjective = () => {
        setObjectives([...objectives, '']);
    };

    const removeObjective = (index) => {
        if (objectives.length > 1) {
            setObjectives(objectives.filter((_, i) => i !== index));
        }
    };

    // Suggest objectives with AI (simulation)
    const suggestObjectives = () => {
        const suggestions = [
            'Understand the fundamental concepts and definitions',
            'Apply learned techniques to solve practical problems',
            'Analyze and interpret mathematical expressions',
            'Demonstrate proficiency through practice exercises',
        ];
        setObjectives(suggestions);
    };

    // Handle AI generation
    const handleAIGenerate = async () => {
        if (!formData.title || !formData.gradeBand || !formData.difficulty) {
            toast.error('Please fill in the required fields (Title, Grade Band, Difficulty)');
            return;
        }

        setIsGenerating(true);
        setGenerationStep(0);

        try {
            // Step 1: Create topic first
            setGenerationStep(0);
            const topicData = {
                title: formData.title,
                subtitle: formData.subtitle,
                gradeBand: formData.gradeBand,
                difficulty: formData.difficulty,
                subject: formData.subject,
                objectives: objectives.filter(obj => obj.trim() !== ''),
                status: 'generated',
            };

            const topicResult = await createTopic(topicData).unwrap();
            console.log('Topic creation result:', topicResult);

            // Extract topicId from response - sendCreated wraps in { success: true, data: {...} }
            const createdTopic = topicResult?.data;
            const topicId = createdTopic?.id || createdTopic?._id || topicResult?.id || topicResult?._id;

            if (!topicId) {
                console.error('Topic result structure:', JSON.stringify(topicResult, null, 2));
                throw new Error('Failed to get topic ID from response. Response structure: ' + JSON.stringify(topicResult));
            }

            console.log('Extracted topicId:', topicId);

            // Step 2: Generate lessons
            setGenerationStep(1);
            const lessonsResult = await generateLessons({
                topicTitle: formData.title,
                grade: formData.gradeBand,
                difficultyLevel: formData.difficulty,
                numberOfLessons: aiSettings.lessonsCount,
            }).unwrap();

            // Extract lessons array from response
            const lessonsArray = lessonsResult?.data?.lessons || lessonsResult?.lessons || [];
            console.log('Generated lessons:', lessonsArray);

            if (lessonsArray.length === 0) {
                throw new Error('No lessons generated');
            }

            // Update generation steps to include each lesson
            const newSteps = [
                { label: 'Creating topic...', icon: FaBook },
                { label: 'Generating lesson titles...', icon: FaRobot },
                { label: 'Saving lessons...', icon: FaSave },
            ];
            for (let i = 0; i < lessonsArray.length; i++) {
                newSteps.push({
                    label: `Generating content for lesson ${i + 1} of ${lessonsArray.length}...`,
                    icon: FaBook
                });
            }
            newSteps.push({ label: 'Finalizing topic...', icon: FaCheckCircle });
            setGenerationSteps(newSteps);

            // Step 3: Save lessons to topic
            setGenerationStep(2);
            console.log('Saving lessons with topicId:', topicId, 'lessons:', lessonsArray);

            if (!topicId) {
                throw new Error('Topic ID is missing. Cannot save lessons.');
            }

            const saveLessonsResult = await saveLessons({
                topicId,
                lessons: lessonsArray,
            }).unwrap();

            console.log('Save lessons result:', saveLessonsResult);

            // Get the updated topic with lesson IDs
            const updatedTopic = saveLessonsResult?.data || saveLessonsResult;
            const savedLessons = updatedTopic?.lessons || [];

            // Step 4: Generate content for each lesson one by one (OPTIONAL - can be done later)
            // Track which lessons succeeded/failed - each is INDEPENDENT
            const contentGenerationResults = [];

            for (let i = 0; i < savedLessons.length; i++) {
                const lesson = savedLessons[i];
                const lessonId = lesson._id || lesson.id;
                const lessonTitle = lesson.title;

                if (!lessonId || !lessonTitle) {
                    console.warn(`Skipping lesson ${i + 1}: missing ID or title`);
                    contentGenerationResults.push({ lessonId, lessonTitle, success: false, error: 'Missing ID or title' });
                    continue;
                }

                // Update progress: "Generating content for lesson X of Y"
                setGenerationStep(3 + i);

                try {
                    // Generate lesson content (INDEPENDENT - failure doesn't affect others)
                    const contentResult = await generateLessonContent({
                        topicTitle: formData.title,
                        lessonTitle: lessonTitle,
                        grade: formData.gradeBand,
                        difficultyLevel: formData.difficulty,
                        exercisesCount: aiSettings.exercisesPerLesson,
                        quizCount: aiSettings.quizQuestions,
                        generateImages: aiSettings.generateImages,
                    }).unwrap();

                    // Save lesson content
                    const lessonContent = contentResult?.data?.lesson || contentResult?.lesson;
                    if (lessonContent) {
                        console.log(`Saving content for lesson ${i + 1}...`);
                        await saveLessonContent({
                            topicId,
                            lessonId,
                            content: lessonContent,
                        }).unwrap();
                        console.log(`Successfully saved content for lesson ${i + 1}`);
                        contentGenerationResults.push({ lessonId, lessonTitle, success: true });
                    } else {
                        console.warn(`No content returned for lesson ${i + 1}`);
                        contentGenerationResults.push({ lessonId, lessonTitle, success: false, error: 'No content returned' });
                    }
                } catch (lessonError) {
                    // RTK Query errors can have different structures
                    // Backend returns: { success: false, error: { code, message, details } }
                    let errorMsg = 'Failed to generate lesson content';

                    // Try to extract error message from various possible structures
                    if (lessonError) {
                        // Backend error structure: { status, data: { success: false, error: { message } } }
                        if (lessonError.data?.error?.message) {
                            errorMsg = lessonError.data.error.message;
                        }
                        // Alternative: direct error.message in data
                        else if (lessonError.data?.message) {
                            errorMsg = lessonError.data.message;
                        }
                        // RTK Query might also have error.message directly
                        else if (lessonError.message) {
                            errorMsg = lessonError.message;
                        }
                        // String error
                        else if (typeof lessonError === 'string') {
                            errorMsg = lessonError;
                        }
                        // If it's an empty object or we can't extract message, provide default
                        else if (typeof lessonError === 'object' && Object.keys(lessonError).length === 0) {
                            errorMsg = 'An error occurred but no details were provided. Please try again.';
                        }
                        // Try to stringify if it's an object with content
                        else if (typeof lessonError === 'object') {
                            try {
                                const errorStr = JSON.stringify(lessonError);
                                if (errorStr !== '{}') {
                                    errorMsg = `Error: ${errorStr.substring(0, 200)}`;
                                }
                            } catch {
                                errorMsg = 'Error occurred (could not parse error details)';
                            }
                        }
                    }

                    // Enhanced logging for debugging
                    console.error(`Error generating content for lesson ${i + 1} (${lessonTitle}):`, {
                        error: lessonError,
                        errorMessage: errorMsg,
                        errorData: lessonError?.data,
                        errorStatus: lessonError?.status,
                        errorCode: lessonError?.data?.error?.code,
                        fullError: JSON.stringify(lessonError, null, 2)
                    });

                    toast.error(`Failed to generate content for lesson ${i + 1}: ${lessonTitle}. You can regenerate it later.`);
                    contentGenerationResults.push({ lessonId, lessonTitle, success: false, error: errorMsg });
                    // Continue with next lesson - each is independent
                }
            }

            // Count successes and failures
            const successful = contentGenerationResults.filter(r => r.success).length;
            const failed = contentGenerationResults.filter(r => !r.success).length;

            setGenerationStep(generationSteps.length - 1);
            setIsGenerating(false);
            setShowSuccess(true);

            // Show appropriate success message - topic is ALWAYS saved regardless of content generation
            if (successful === savedLessons.length) {
                toast.success(`Topic created successfully! All ${successful} lessons have content.`);
            } else if (successful > 0) {
                toast.success(`Topic created successfully! ${successful} lessons have content. ${failed} lesson(s) can be regenerated from the topic page.`);
            } else {
                toast.success(`Topic created successfully! You can generate lesson content from the topic page.`);
            }

            // ALWAYS redirect to topic detail page - content can be regenerated there independently
            setTimeout(() => {
                router.push(`/admin/topics/${topicId}`);
            }, 2000);
        } catch (error) {
            console.error('Generation error:', error);
            setIsGenerating(false);
            setGenerationStep(0);
            toast.error(error?.data?.message || 'Failed to generate topic. Please try again.');
        }
    };

    // Handle manual creation (save as draft)
    const handleSaveAsDraft = async () => {
        if (!formData.title) {
            toast.error('Please enter a topic title');
            return;
        }

        setIsSubmitting(true);
        try {
            const topicData = {
                title: formData.title,
                subtitle: formData.subtitle,
                gradeBand: formData.gradeBand,
                difficulty: formData.difficulty,
                subject: formData.subject,
                objectives: objectives.filter(obj => obj.trim() !== ''),
                status: 'draft',
            };

            const result = await createTopic(topicData).unwrap();
            setIsSubmitting(false);
            setShowSuccess(true);
            toast.success('Topic saved as draft!');

            setTimeout(() => {
                const topicId = result.id || result._id;
                router.push(`/admin/topics/${topicId}`);
            }, 1500);
        } catch (error) {
            console.error('Save error:', error);
            setIsSubmitting(false);
            toast.error(error?.data?.message || 'Failed to save topic. Please try again.');
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        if (formData.creationMethod === 'ai') {
            handleAIGenerate();
        } else {
            handleSaveAsDraft();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/topics"
                    className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create New Topic</h1>
                    <p className="text-foreground-secondary">Add a new curriculum topic</p>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="glass-card p-6 border-success/50 bg-success/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-success">Topic Created Successfully!</h3>
                            <p className="text-sm text-foreground-secondary">Redirecting to topics list...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generation Progress Modal */}
            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                                <FaRobot className="text-4xl text-primary-500 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Generating Content with AI</h3>
                            <p className="text-foreground-secondary text-sm">
                                Creating {aiSettings.lessonsCount} lessons with {aiSettings.exercisesPerLesson} exercises each...
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="space-y-3">
                            {generationSteps.map((step, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all',
                                        index < generationStep ? 'bg-success text-white' :
                                            index === generationStep ? 'bg-primary-500 text-white animate-pulse' :
                                                'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
                                    )}>
                                        {index < generationStep ? (
                                            <FaCheckCircle className="w-4 h-4" />
                                        ) : index === generationStep ? (
                                            <FaSpinner className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <step.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        'text-sm transition-colors',
                                        index <= generationStep ? 'text-foreground' : 'text-foreground-secondary'
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                                    style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-foreground-secondary text-center mt-2">
                                Step {generationStep + 1} of {generationSteps.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="glass-card p-6 space-y-6">
                {                /* Basic Info */}
                <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">1</span>
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Topic Title <span className="text-error">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Introduction to Trigonometry"
                                className="w-full px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                placeholder="e.g., Learn sine, cosine, and tangent functions"
                                className="w-full px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        {/* Grade Band */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Grade Band <span className="text-error">*</span></label>
                            <select
                                name="gradeBand"
                                value={formData.gradeBand}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            >
                                <option value="">Select grade band...</option>
                                {Object.entries(GRADE_BANDS).map(([key, band]) => (
                                    <option key={key} value={band.id}>{band.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Difficulty Level <span className="text-error">*</span></label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            >
                                <option value="">Select difficulty...</option>
                                {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                                    <option key={key} value={level.id}>{level.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        {/* Prerequisites */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Prerequisite Topic</label>
                            <select
                                name="prerequisite"
                                value={formData.prerequisite}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                style={{ 
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--foreground)'
                                }}
                            >
                                <option value="">None</option>
                                {topics.filter(t => t.status === 'published').map((topic) => (
                                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Learning Objectives */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">2</span>
                            Learning Objectives
                        </h3>
                        <button
                            onClick={suggestObjectives}
                            className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
                        >
                            <FaRobot className="text-sm" />
                            Suggest with AI
                        </button>
                    </div>
                    <div className="space-y-2">
                        {objectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-foreground-secondary w-6 text-center">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                    placeholder="Enter a learning objective..."
                                    className="flex-1 px-4 py-2 text-sm text-foreground placeholder:text-foreground-secondary border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--search-bg)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <button
                                    onClick={() => removeObjective(index)}
                                    disabled={objectives.length === 1}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        objectives.length === 1
                                            ? "text-foreground-secondary/30 cursor-not-allowed"
                                            : "hover:bg-error/10 text-foreground-secondary hover:text-error"
                                    )}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addObjective}
                            className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1 mt-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Objective
                        </button>
                    </div>
                </div>

                {/* Content Creation Method */}
                <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold">3</span>
                        Content Creation Method
                    </h3>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, creationMethod: 'ai' }))}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left max-w-md w-full",
                                formData.creationMethod === 'ai'
                                    ? "border-primary-500 bg-primary-500/10"
                                    : "border-transparent bg-neutral-50 dark:bg-neutral-800/50 hover:border-primary-500/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    formData.creationMethod === 'ai' ? "bg-primary-500/20" : "bg-primary-500/10"
                                )}>
                                    <FaRobot className="text-2xl text-primary-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Generate with AI</p>
                                    <p className="text-xs text-foreground-secondary">AI creates lessons, exercises, and quizzes automatically</p>
                                </div>
                                {formData.creationMethod === 'ai' && (
                                    <svg className="w-5 h-5 text-primary-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                )}
                            </div>
                        </button>
                        {/* <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, creationMethod: 'manual' }))}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all text-left",
                                formData.creationMethod === 'manual'
                                    ? "border-secondary-500 bg-secondary-500/10"
                                    : "border-transparent bg-neutral-50 dark:bg-neutral-800/50 hover:border-secondary-500/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    formData.creationMethod === 'manual' ? "bg-secondary-500/20" : "bg-secondary-500/10"
                                )}>
                                    <FaPencilAlt className="text-2xl text-secondary-500" />
                                </div>
                                <div>
                                    <p className="font-medium">Create Manually</p>
                                    <p className="text-xs text-foreground-secondary">Write content yourself from scratch</p>
                                </div>
                                {formData.creationMethod === 'manual' && (
                                    <svg className="w-5 h-5 text-secondary-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                )}
                            </div>
                        </button> */}
                    </div>
                </div>

                {/* AI Generation Settings - Only show when AI method selected */}
                {formData.creationMethod === 'ai' && (
                    <div className="p-5 rounded-xl bg-primary-500/5 border border-primary-500/20">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                            <FaRobot className="text-primary-500" />
                            AI Generation Settings
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Number of Lessons</label>
                                <input
                                    type="number"
                                    value={aiSettings.lessonsCount}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        const clampedValue = Math.min(Math.max(value, 1), 5);
                                        setAiSettings(prev => ({ ...prev, lessonsCount: clampedValue }));
                                    }}
                                    min={1}
                                    max={5}
                                    className="w-full px-4 py-2.5 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--search-bg)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <p className="text-xs text-foreground-secondary mt-1">Maximum 5 lessons (AI service limit)</p>
                                <p className="text-xs text-foreground-secondary mt-1">3-15 lessons</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Exercises per Lesson</label>
                                <input
                                    type="number"
                                    value={aiSettings.exercisesPerLesson}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        const clampedValue = Math.min(Math.max(value, 1), 5);
                                        setAiSettings(prev => ({ ...prev, exercisesPerLesson: clampedValue }));
                                    }}
                                    min={1}
                                    max={5}
                                    className="w-full px-4 py-2.5 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--search-bg)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <p className="text-xs text-foreground-secondary mt-1">1-5 exercises (AI service limit)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Quiz Questions</label>
                                <input
                                    type="number"
                                    value={aiSettings.quizQuestions}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        const clampedValue = Math.min(Math.max(value, 1), 5);
                                        setAiSettings(prev => ({ ...prev, quizQuestions: clampedValue }));
                                    }}
                                    min={1}
                                    max={5}
                                    className="w-full px-4 py-2.5 text-sm text-foreground border border-neutral-200 dark:border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--search-bg)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                                <p className="text-xs text-foreground-secondary mt-1">Maximum 5 quiz questions (AI service limit)</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={aiSettings.generateImages}
                                    onChange={(e) => setAiSettings(prev => ({ ...prev, generateImages: e.target.checked }))}
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-foreground">Generate images with AI</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={aiSettings.includeLatex}
                                    onChange={(e) => setAiSettings(prev => ({ ...prev, includeLatex: e.target.checked }))}
                                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-foreground">Include LaTeX math expressions</span>
                            </label>
                        </div>

                        {/* Estimated Output */}
                        <div className="mt-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-foreground-secondary">
                                <span className="font-medium text-foreground">Estimated output:</span> {aiSettings.lessonsCount} lessons, {aiSettings.lessonsCount * aiSettings.exercisesPerLesson} exercises, {aiSettings.quizQuestions} quiz questions
                                {aiSettings.generateImages && `, ~${aiSettings.lessonsCount * 2} images`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Manual Creation Info - Only show when manual method selected */}
                {formData.creationMethod === 'manual' && (
                    <div className="p-5 rounded-xl bg-secondary-500/5 border border-secondary-500/20">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FaPencilAlt className="text-secondary-500" />
                            Manual Creation
                        </h4>
                        <p className="text-sm text-foreground-secondary mb-3">
                            Your topic will be saved as a draft. You can then add lessons, exercises, and quizzes manually through the topic editor.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-foreground-secondary">You can always use AI generation later from the topic editor.</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--card-border)]">
                    <Link href="/admin/topics" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <div className="flex items-center gap-3">
                        {formData.creationMethod === 'ai' ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isGenerating || !formData.title}
                                className="btn btn-primary"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaRobot />
                                        Create & Generate Content
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSaveAsDraft}
                                    disabled={isSubmitting || !formData.title}
                                    className="btn btn-primary"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save as Draft
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
