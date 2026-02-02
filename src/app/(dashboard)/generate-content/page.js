'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/providers/ToastProvider';
import {
  useCreateTopicMutation,
  useGenerateLessonsMutation,
  useSaveLessonsMutation,
  useGenerateLessonContentMutation,
  useSaveLessonContentMutation,
} from '@/store/adminApi';
import { FaMagic, FaCheckCircle } from 'react-icons/fa';

const gradeBands = [
  { id: 'primary', label: 'Primary', grades: 'Grades 1-5' },
  { id: 'secondary', label: 'Secondary', grades: 'Grades 6-12' },
  { id: 'college', label: 'College', grades: 'Higher Ed' },
];

const difficultyLevels = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function GenerateContentPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    subject: 'Mathematics',
    gradeBand: 'primary',
    difficulty: 'easy',
    lessonsCount: 3,
    exercisesCount: 4,
    quizCount: 5,
    generateImages: true,
  });
  const [progressSteps, setProgressSteps] = useState([]);
  const [createdTopic, setCreatedTopic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createTopic] = useCreateTopicMutation();
  const [generateLessons] = useGenerateLessonsMutation();
  const [saveLessons] = useSaveLessonsMutation();
  const [generateLessonContent] = useGenerateLessonContentMutation();
  const [saveLessonContent] = useSaveLessonContentMutation();

  const clampNumber = (value, min, max) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return min;
    return Math.max(min, Math.min(max, parsed));
  };

  const addProgressStep = (label, status = 'info') => {
    setProgressSteps((prev) => [...prev, { label, status }]);
  };

  const handleCreateAndGenerate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a topic title.');
      return;
    }

    setIsSubmitting(true);
    setProgressSteps([]);
    setCreatedTopic(null);

    try {
      addProgressStep('Creating topic...');
      const topicPayload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        subject: formData.subject.trim() || 'Mathematics',
        gradeBand: formData.gradeBand,
        difficulty: formData.difficulty,
        status: 'published',
      };

      const created = await createTopic(topicPayload).unwrap();
      const topicId = created?.data?.id || created?.data?._id || created?.id || created?._id;

      if (!topicId) {
        throw new Error('Failed to get topic ID from server response.');
      }

      addProgressStep('Topic created successfully.', 'success');

      addProgressStep('Generating lesson titles...');
      const lessonsResult = await generateLessons({
        topicTitle: formData.title.trim(),
        grade: formData.gradeBand,
        difficultyLevel: formData.difficulty,
        numberOfLessons: formData.lessonsCount,
      }).unwrap();

      const lessonsArray = lessonsResult?.data?.lessons || lessonsResult?.lessons || [];

      if (lessonsArray.length === 0) {
        throw new Error('No lessons were generated.');
      }

      addProgressStep('Lesson titles generated.', 'success');
      addProgressStep('Saving lessons to topic...');

      const savedTopicResponse = await saveLessons({
        topicId,
        lessons: lessonsArray,
      }).unwrap();

      const savedTopic = savedTopicResponse?.data || savedTopicResponse;
      const savedLessons = savedTopic?.lessons || [];

      if (!Array.isArray(savedLessons) || savedLessons.length === 0) {
        throw new Error('Saved topic did not return lesson IDs.');
      }

      addProgressStep('Lessons saved.', 'success');
      addProgressStep('Generating lesson content...');

      let successful = 0;
      let failed = 0;

      for (let i = 0; i < savedLessons.length; i += 1) {
        const lesson = savedLessons[i];
        const lessonId = lesson._id || lesson.id;
        const lessonTitle = lesson.title;

        if (!lessonId || !lessonTitle) {
          failed += 1;
          addProgressStep(`Skipped lesson ${i + 1} due to missing ID or title.`, 'error');
          continue;
        }

        try {
          addProgressStep(`Generating content for lesson ${i + 1}: ${lessonTitle}`);
          const contentResult = await generateLessonContent({
            topicTitle: formData.title.trim(),
            lessonTitle,
            grade: formData.gradeBand,
            difficultyLevel: formData.difficulty,
            exercisesCount: formData.exercisesCount,
            quizCount: formData.quizCount,
            generateImages: formData.generateImages,
          }).unwrap();

          const lessonContent = contentResult?.data?.lesson || contentResult?.lesson;
          if (!lessonContent) {
            throw new Error('No content returned by generator.');
          }

          await saveLessonContent({
            topicId,
            lessonId,
            content: lessonContent,
          }).unwrap();

          successful += 1;
          addProgressStep(`Lesson ${i + 1} content saved.`, 'success');
        } catch (error) {
          failed += 1;
          const errorMessage = error?.data?.error?.message
            || error?.data?.message
            || error?.error
            || error?.message
            || 'Generation failed.';
          addProgressStep(`Lesson ${i + 1} failed: ${errorMessage}`, 'error');
        }
      }

      addProgressStep(`Generation complete. Success: ${successful}, Failed: ${failed}.`, 'success');

      setCreatedTopic({
        id: topicId,
        title: formData.title.trim(),
      });

      toast.success('Topic created and content generated.');
    } catch (error) {
      const errorMessage = error?.data?.error?.message
        || error?.data?.message
        || error?.error
        || error?.message
        || 'Failed to generate content.';
      toast.error(errorMessage);
      addProgressStep(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2 flex items-center gap-2">
          <FaMagic className="text-primary-500" />
          Generate Content
        </h1>
        <p className="text-foreground-secondary">
          Create a new topic from scratch and automatically generate lesson content.
        </p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Create New Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Topic title"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="e.g. Introduction to Fractions"
            />
            <Input
              label="Subtitle (optional)"
              value={formData.subtitle}
              onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
              placeholder="Short description"
            />
            <Input
              label="Subject"
              value={formData.subject}
              onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Mathematics"
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Grade band</label>
              <select
                className="input"
                value={formData.gradeBand}
                onChange={(event) => setFormData((prev) => ({ ...prev, gradeBand: event.target.value }))}
              >
                {gradeBands.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label} ({band.grades})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Difficulty</label>
              <select
                className="input"
                value={formData.difficulty}
                onChange={(event) => setFormData((prev) => ({ ...prev, difficulty: event.target.value }))}
              >
                {difficultyLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Number of lessons"
              type="number"
              min={1}
              max={5}
              value={formData.lessonsCount}
              onChange={(event) => setFormData((prev) => ({
                ...prev,
                lessonsCount: clampNumber(event.target.value, 1, 5),
              }))}
            />
            <Input
              label="Exercises per lesson"
              type="number"
              min={1}
              max={10}
              value={formData.exercisesCount}
              onChange={(event) => setFormData((prev) => ({
                ...prev,
                exercisesCount: clampNumber(event.target.value, 1, 10),
              }))}
            />
            <Input
              label="Quiz questions"
              type="number"
              min={1}
              max={5}
              value={formData.quizCount}
              onChange={(event) => setFormData((prev) => ({
                ...prev,
                quizCount: clampNumber(event.target.value, 1, 5),
              }))}
            />
            <div className="flex items-center gap-3 pt-6">
              <input
                id="generate-images"
                type="checkbox"
                className="h-4 w-4 accent-primary-500"
                checked={formData.generateImages}
                onChange={(event) => setFormData((prev) => ({
                  ...prev,
                  generateImages: event.target.checked,
                }))}
              />
              <label htmlFor="generate-images" className="text-sm font-medium text-foreground">
                Generate images
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="font-bold"
              onClick={handleCreateAndGenerate}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating...' : 'Create and Generate'}
            </Button>
            <span className="text-xs text-foreground-secondary">
              This will create a published topic and generate lessons + content automatically.
            </span>
          </div>
        </CardContent>
      </Card>

      {progressSteps.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {progressSteps.map((step, index) => (
              <div
                key={`${step.label}-${index}`}
                className={`text-sm flex items-start gap-2 ${
                  step.status === 'error'
                    ? 'text-error'
                    : step.status === 'success'
                      ? 'text-success'
                      : 'text-foreground-secondary'
                }`}
              >
                {step.status === 'success' ? (
                  <FaCheckCircle className="mt-0.5" />
                ) : step.status === 'error' ? (
                  <span className="mt-0.5">!</span>
                ) : (
                  <span className="mt-0.5">-</span>
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {createdTopic && (
        <Card variant="glass">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-lg">{createdTopic.title}</h3>
              <p className="text-sm text-foreground-secondary">
                Topic created successfully. It is now visible under Topics.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/topics/${createdTopic.id}?tab=generate`}>
                <Button variant="secondary">Open Topic</Button>
              </Link>
              <Link href="/topics">
                <Button>View Topics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
