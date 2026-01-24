// Dummy user data
export const currentUser = {
  id: "user-001",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  avatarUrl: null,
  gradeBand: "secondary",
  grade: 8,
  languagePreference: "en",
  createdAt: "2024-09-15T10:30:00Z",
  subscriptionTier: "premium",
  streak: 12,
  totalMinutesLearned: 1250,
  problemsSolved: 347,
  hintsUsed: 89,
  accuracy: 0.78,
  lastActive: "2024-12-19T08:15:00Z"
};

export const userStats = {
  todayMinutes: 35,
  todayProblems: 12,
  weeklyGoal: 120, // minutes
  weeklyProgress: 85, // minutes
  currentStreak: 12,
  longestStreak: 28,
  totalTopicsCompleted: 8,
  totalLessonsCompleted: 42,
  averageAccuracy: 0.78,
  rankPercentile: 85,
  xpPoints: 4580,
  level: 15,
  levelProgress: 0.65, // 65% to next level
  nextLevelXp: 5000
};

export const recentActivity = [
  {
    id: "act-1",
    type: "lesson_completed",
    title: "Completed: Equivalent Fractions",
    topicId: "fractions",
    timestamp: "2024-12-19T08:15:00Z",
    xpEarned: 50
  },
  {
    id: "act-2",
    type: "problem_solved",
    title: "Solved 5 practice problems",
    topicId: "algebra-basics",
    timestamp: "2024-12-19T07:45:00Z",
    xpEarned: 25
  },
  {
    id: "act-3",
    type: "streak_milestone",
    title: "🔥 12 Day Streak!",
    timestamp: "2024-12-19T06:00:00Z",
    xpEarned: 100
  },
  {
    id: "act-4",
    type: "topic_mastered",
    title: "Mastered: Counting & Numbers",
    topicId: "counting",
    timestamp: "2024-12-18T15:30:00Z",
    xpEarned: 200
  },
  {
    id: "act-5",
    type: "lesson_completed",
    title: "Completed: Introduction to Variables",
    topicId: "algebra-basics",
    timestamp: "2024-12-18T14:20:00Z",
    xpEarned: 50
  }
];

export const achievements = [
  {
    id: "ach-1",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    unlocked: true,
    unlockedAt: "2024-09-15T11:00:00Z"
  },
  {
    id: "ach-2",
    title: "Problem Solver",
    description: "Solve 100 problems",
    icon: "🧩",
    unlocked: true,
    unlockedAt: "2024-10-20T14:30:00Z"
  },
  {
    id: "ach-3",
    title: "Week Warrior",
    description: "Study for 7 days in a row",
    icon: "🔥",
    unlocked: true,
    unlockedAt: "2024-11-05T09:00:00Z"
  },
  {
    id: "ach-4",
    title: "Math Master",
    description: "Master 5 topics",
    icon: "🏆",
    unlocked: true,
    unlockedAt: "2024-12-10T16:45:00Z"
  },
  {
    id: "ach-5",
    title: "Perfect Score",
    description: "Get 100% on 10 practice sessions",
    icon: "⭐",
    unlocked: false,
    progress: 0.7
  },
  {
    id: "ach-6",
    title: "Night Owl",
    description: "Study after 10 PM",
    icon: "🦉",
    unlocked: true,
    unlockedAt: "2024-09-22T22:15:00Z"
  },
  {
    id: "ach-7",
    title: "Calculus Champion",
    description: "Master all calculus topics",
    icon: "∫",
    unlocked: false,
    progress: 0.3
  },
  {
    id: "ach-8",
    title: "Speed Demon",
    description: "Solve 10 problems in under 5 minutes",
    icon: "⚡",
    unlocked: false,
    progress: 0.5
  }
];

export const progressByTopic = [
  { topicId: "counting", mastery: 1.0, lastPracticed: "2024-12-01" },
  { topicId: "addition", mastery: 0.85, lastPracticed: "2024-12-18" },
  { topicId: "subtraction", mastery: 0.65, lastPracticed: "2024-12-17" },
  { topicId: "multiplication", mastery: 0.4, lastPracticed: "2024-12-15" },
  { topicId: "algebra-basics", mastery: 0.7, lastPracticed: "2024-12-19" },
  { topicId: "linear-equations", mastery: 0.45, lastPracticed: "2024-12-14" },
  { topicId: "calculus-limits", mastery: 0.55, lastPracticed: "2024-12-16" }
];

export const weeklyStudyData = [
  { day: "Mon", minutes: 25 },
  { day: "Tue", minutes: 40 },
  { day: "Wed", minutes: 15 },
  { day: "Thu", minutes: 35 },
  { day: "Fri", minutes: 50 },
  { day: "Sat", minutes: 20 },
  { day: "Sun", minutes: 35 }
];
