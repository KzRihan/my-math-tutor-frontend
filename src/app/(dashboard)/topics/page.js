'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import Badge, { DifficultyBadge, StatusBadge } from '@/components/ui/Badge';
import { useGetPublishedTopicsQuery } from '@/store/topicApi';
import { useGetUserEnrollmentsQuery } from '@/store/enrollmentApi';
import { useGetMeQuery } from '@/store/userApi';
import { formatDuration } from '@/lib/utils';
import { FaBook, FaClock, FaSpinner, FaCheckCircle, FaLock } from 'react-icons/fa';
import { HiInbox } from 'react-icons/hi2';

const gradeBands = [
  { id: 'primary', label: 'Primary', grades: 'Grades 1-5', color: 'from-blue-500 to-blue-600', icon: '📚' },
  { id: 'secondary', label: 'Secondary', grades: 'Grades 6-12', color: 'from-purple-500 to-purple-600', icon: '🎓' },
  { id: 'college', label: 'College', grades: 'Higher Ed', color: 'from-green-500 to-green-600', icon: '🎯' },
];

export default function TopicsPage() {
  const [selectedBand, setSelectedBand] = useState('primary');
  const { data, isLoading, error } = useGetPublishedTopicsQuery({ 
    gradeBand: selectedBand,
    limit: 100 
  });
  const { data: enrollmentsData } = useGetUserEnrollmentsQuery();

  const { data: userData } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  // Use API data if available, otherwise fallback to Redux
  const user = userData?.data;
  const userLearnLevel = user?.learnLevel;

  const topics = data?.data || [];
  const enrollments = enrollmentsData?.data || [];
  const filteredTopics = topics;

  // Create a map of topicId -> enrollment for quick lookup
  const enrollmentMap = new Map();
  enrollments.forEach((enrollment) => {
    enrollmentMap.set(enrollment.topicId, enrollment);
  });

  // Helper function to check if user can enroll in a topic
  const canEnroll = (topicGradeBand) => {
    // If user has no learnLevel set, allow enrollment (backward compatibility)
    if (!userLearnLevel) return true;
    // User can only enroll in topics matching their learnLevel
    return userLearnLevel === topicGradeBand;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2 flex items-center gap-2">
          <FaBook className="text-primary-500" />
          Explore Topics
        </h1>
        <p className="text-foreground-secondary">
          Master mathematics from fundamentals to advanced concepts
        </p>
      </div>

      {/* Grade Band Selector */}
      <div className="flex flex-wrap gap-3">
        {gradeBands.map((band) => (
          <button
            key={band.id}
            onClick={() => setSelectedBand(band.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              selectedBand === band.id
                ? 'bg-gradient-to-r ' + band.color + ' text-white shadow-lg'
                : 'bg-card-bg border border-[var(--card-border)] hover:border-primary-300'
            }`}
          >
            <span className="text-xl">{band.icon}</span>
            <span>{band.label}</span>
            <span className="text-sm opacity-80">({band.grades})</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <FaSpinner className="text-6xl mb-4 mx-auto animate-spin text-primary-500" />
          <h3 className="text-xl font-semibold mb-2">Loading topics...</h3>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">Error loading topics</h3>
          <p className="text-foreground-secondary">
            {error?.data?.error?.message || 'Failed to load topics. Please try again.'}
          </p>
        </div>
      )}

      {/* Topics Grid */}
      {!isLoading && !error && (
        <>
          {filteredTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => {
                const estimatedDuration = topic.lessonsCount * 15; // 15 min per lesson
                const enrollment = enrollmentMap.get(topic.id);
                const isEnrolled = !!enrollment;
                const progress = enrollment?.progress || 0;
                const completedLessons = enrollment?.lessonsCompleted || 0;
                
                return (
                  <Link key={topic.id} href={`/topics/${topic.id}`}>
                    <Card interactive className="h-full group">
                      <CardContent className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            <FaBook />
                          </div>
                          <div className="flex items-center gap-2">
                            {isEnrolled && (
                              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                                <FaCheckCircle className="mr-1" />
                                Enrolled
                              </Badge>
                            )}
                            <StatusBadge status={topic.status} />
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                        <p className="text-sm text-foreground-secondary mb-4 flex-1">
                          {topic.subtitle || topic.description || 'Explore this topic to learn more.'}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-4 text-sm text-foreground-secondary">
                          <span className="flex items-center gap-1">
                            <FaBook className="text-xs" />
                            {topic.lessonsCount || 0} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {formatDuration(estimatedDuration)}
                          </span>
                        </div>

                        {/* Progress or Start Button */}
                        {isEnrolled ? (
                          <div className="mt-auto space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Progress</span>
                              <span className="text-primary-500 font-semibold">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress / 100} size="md" />
                            <p className="text-xs text-foreground-secondary text-center">
                              {completedLessons} of {topic.lessonsCount || 0} lessons completed
                            </p>
                          </div>
                        ) : !canEnroll(topic.gradeBand) ? (
                          <div className="mt-auto">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                              <div className="flex items-center gap-2">
                                <FaLock className="text-neutral-400 dark:text-neutral-500 text-sm" />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                                  {userLearnLevel ? `Available for ${userLearnLevel} level` : 'Not available'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                              You can only enroll in {userLearnLevel || 'your'} level topics
                            </p>
                          </div>
                        ) : (
                          <div className="mt-auto">
                            <div className="flex items-center justify-between">
                              <DifficultyBadge level={topic.difficulty} />
                              <span className="text-sm text-primary-500 font-medium flex items-center gap-1">
                                Start Learning →
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiInbox className="text-6xl mb-4 mx-auto text-foreground-secondary" />
              <h3 className="text-xl font-semibold mb-2">No topics found</h3>
              <p className="text-foreground-secondary mb-4">
                Try selecting a different grade level
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
