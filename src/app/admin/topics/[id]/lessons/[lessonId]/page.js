'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useGetTopicQuery } from '@/store/adminApi';

export default function LessonEditorPage() {
  const params = useParams();
  const { id: topicId, lessonId } = params;
  const [content, setContent] = useState('');

  const { data: topicResponse, isLoading, error } = useGetTopicQuery(topicId);
  const topic = topicResponse?.data || topicResponse;
  const topicLessons = topic?.lessons || [];
  const lesson = topicLessons.find((l) => (l._id || l.id) === lessonId);

  const contentFromLesson = useMemo(() => {
    const lessonContent = lesson?.content;
    if (!lessonContent) return '';
    if (typeof lessonContent === 'string') return lessonContent;

    const lines = [];
    if (lessonContent.title) lines.push(`# ${lessonContent.title}`);
    if (lessonContent.introduction) {
      lines.push('', '## Introduction', lessonContent.introduction);
    }
    if (lessonContent.explanation) {
      lines.push('', '## Explanation', lessonContent.explanation);
    }
    if (Array.isArray(lessonContent.worked_examples) && lessonContent.worked_examples.length) {
      lines.push('', '## Worked Examples');
      lessonContent.worked_examples.forEach((ex, index) => {
        const title = ex.problem || ex.example || `Example ${index + 1}`;
        lines.push('', `### ${title}`);
        const steps = Array.isArray(ex.steps) ? ex.steps : [];
        if (steps.length) {
          steps.forEach((step) => lines.push(`- ${step}`));
        }
        if (ex.solution) lines.push('', `**Solution:** ${ex.solution}`);
      });
    }
    if (Array.isArray(lessonContent.tips) && lessonContent.tips.length) {
      lines.push('', '## Tips');
      lessonContent.tips.forEach((tip) => lines.push(`- ${tip}`));
    }
    if (Array.isArray(lessonContent.common_mistakes) && lessonContent.common_mistakes.length) {
      lines.push('', '## Common Mistakes');
      lessonContent.common_mistakes.forEach((mistake) => lines.push(`- ${mistake}`));
    }
    if (Array.isArray(lessonContent.practice_exercises) && lessonContent.practice_exercises.length) {
      lines.push('', '## Practice Exercises');
      lessonContent.practice_exercises.forEach((ex, index) => {
        const question = ex.question || ex.exercise || `Exercise ${index + 1}`;
        lines.push(`- ${question}`);
      });
    }
    if (Array.isArray(lessonContent.quiz) && lessonContent.quiz.length) {
      lines.push('', '## Quiz');
      lessonContent.quiz.forEach((q, index) => {
        const question = q.question || `Question ${index + 1}`;
        lines.push(`- ${question}`);
      });
    }

    return lines.join('\n');
  }, [lesson]);

  useEffect(() => {
    if (contentFromLesson) {
      setContent(contentFromLesson);
    }
  }, [contentFromLesson]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-foreground-secondary">Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 text-center">
          <p className="text-error mb-4">Failed to load lesson. Please try again.</p>
          <Link href={`/admin/topics/${topicId}`} className="btn btn-primary">
            Back to Topic
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/admin/topics/${topicId}`}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-foreground-secondary hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
              <span>{topic?.title || 'Topic'}</span>
              <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Lesson {lesson?.order || 1}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{lesson?.title || 'Lesson Title'}</h1>
          </div>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            lesson?.status === 'approved' ? 'bg-success/10 text-success' : 'bg-neutral-200 dark:bg-neutral-700 text-foreground-secondary'
          )}>
            {lesson?.status || 'draft'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <span>👁️</span>
            Preview
          </button>
          <button className="btn btn-primary">
            <span>✅</span>
            Mark Approved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-foreground">Lesson Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Title</label>
                <input
                  type="text"
                  defaultValue={lesson?.title}
                  className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 text-foreground border border-transparent dark:border-neutral-700 rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-foreground-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Estimated Time (min)</label>
                <input
                  type="number"
                  defaultValue={lesson?.estimatedTime}
                  className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 text-foreground border border-transparent dark:border-neutral-700 rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-foreground-secondary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
                <input
                  type="text"
                  defaultValue={lesson?.description}
                  className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800 text-foreground border border-transparent dark:border-neutral-700 rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-foreground-secondary"
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Content</h3>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary btn-sm">
                  <span>🤖</span>
                  Rewrite with AI
                </button>
                <button className="btn btn-secondary btn-sm">
                  <span>🌐</span>
                  Translate
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-t-xl border-b border-[var(--card-border)]">
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-bold text-foreground">
                B
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors italic text-foreground">
                I
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors underline text-foreground">
                U
              </button>
              <div className="w-px h-6 bg-[var(--card-border)] mx-1" />
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-foreground">
                H1
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-foreground">
                H2
              </button>
              <div className="w-px h-6 bg-[var(--card-border)] mx-1" />
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-foreground" title="LaTeX">
                ∑
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-foreground" title="Image">
                🖼️
              </button>
              <button className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-foreground" title="Link">
                🔗
              </button>
            </div>

            {/* Editor Area */}
            <textarea
              value={content || '# Introduction\n\nStart writing your lesson content here...\n\n## Key Concepts\n\n- Concept 1\n- Concept 2\n\n## Example\n\n$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$'}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[400px] px-4 py-4 text-sm bg-neutral-100 dark:bg-neutral-800 text-foreground border border-transparent dark:border-neutral-700 rounded-b-xl focus:outline-none focus:border-primary-500 resize-none font-mono placeholder:text-foreground-secondary"
              placeholder="Write your lesson content in Markdown..."
            />

            <p className="text-xs text-foreground-secondary mt-2">
              Supports Markdown and LaTeX. Use $$ for block equations and $ for inline math.
            </p>
          </div>

          {/* LaTeX Preview */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-foreground">LaTeX Preview</h3>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-[var(--card-border)]">
              <div className="text-center">
                <p className="text-2xl font-serif text-foreground">x = (-b ± √(b² - 4ac)) / 2a</p>
                <p className="text-xs text-foreground-secondary mt-2">Quadratic Formula</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Media */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-foreground">Media</h3>
            {lesson?.hasImage ? (
              <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-video mb-4 border border-[var(--card-border)]">
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">
                  🖼️
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-xl p-8 text-center mb-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                <div className="text-3xl mb-2 opacity-60">🖼️</div>
                <p className="text-sm text-foreground-secondary">No image yet</p>
              </div>
            )}
            <div className="space-y-2">
              <button className="btn btn-secondary btn-sm w-full">
                <span>🤖</span>
                Generate with AI
              </button>
              <button className="btn btn-secondary btn-sm w-full">
                <span>📤</span>
                Upload Image
              </button>
            </div>
          </div>

          {/* Exercises */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Exercises</h3>
              <button className="text-sm text-primary-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors">
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {(lesson?.content?.practice_exercises || []).slice(0, 3).map((ex, index) => (
                <div key={index} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-[var(--card-border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                      practice
                    </span>
                  </div>
                  <p className="text-sm truncate text-foreground">{ex.question || ex.exercise}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-foreground">Actions</h3>
            <div className="space-y-2">
              <button className="btn btn-primary w-full">
                <span>💾</span>
                Save Changes
              </button>
              <button className="btn btn-secondary w-full">
                <span>✅</span>
                Mark as Approved
              </button>
              <button className="btn btn-secondary w-full text-error hover:bg-error/10 dark:hover:bg-error/20 dark:text-error/90">
                <span>🗑️</span>
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
