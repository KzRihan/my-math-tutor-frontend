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
  totalTopicsCompleted: 8,
  totalLessonsCompleted: 42,
  averageAccuracy: 0.78,
  rankPercentile: 85,};

export const recentActivity = [
  {
    id: "act-1",
    type: "lesson_completed",
    title: "Completed: Equivalent Fractions",
    topicId: "fractions",
    timestamp: "2024-12-19T08:15:00Z",  },
  {
    id: "act-2",
    type: "problem_solved",
    title: "Solved 5 practice problems",
    topicId: "algebra-basics",
    timestamp: "2024-12-19T07:45:00Z",  },
  {
    id: "act-4",
    type: "topic_mastered",
    title: "Mastered: Counting & Numbers",
    topicId: "counting",
    timestamp: "2024-12-18T15:30:00Z",  },
  {
    id: "act-5",
    type: "lesson_completed",
    title: "Completed: Introduction to Variables",
    topicId: "algebra-basics",
    timestamp: "2024-12-18T14:20:00Z",  }
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

