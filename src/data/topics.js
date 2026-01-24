// Dummy data for topics
export const topics = [
  // PRIMARY LEVEL (Grades 1-5)
  {
    id: "counting",
    title: "Counting & Numbers",
    gradeBand: "primary",
    difficulty: 1,
    duration: 30,
    lessonsCount: 6,
    progress: 1.0,
    status: "mastered",
    prerequisites: [],
    icon: "🔢",
    description: "Learn to count from 1 to 1000 and understand number patterns"
  },
  {
    id: "addition",
    title: "Addition",
    gradeBand: "primary",
    difficulty: 1,
    duration: 45,
    lessonsCount: 8,
    progress: 0.85,
    status: "in_progress",
    prerequisites: ["counting"],
    icon: "➕",
    description: "Master the art of adding numbers together"
  },
  {
    id: "subtraction",
    title: "Subtraction",
    gradeBand: "primary",
    difficulty: 1,
    duration: 45,
    lessonsCount: 8,
    progress: 0.65,
    status: "in_progress",
    prerequisites: ["addition"],
    icon: "➖",
    description: "Learn to subtract numbers and find differences"
  },
  {
    id: "multiplication",
    title: "Multiplication",
    gradeBand: "primary",
    difficulty: 2,
    duration: 60,
    lessonsCount: 10,
    progress: 0.4,
    status: "in_progress",
    prerequisites: ["addition"],
    icon: "✖️",
    description: "Discover the magic of multiplying numbers"
  },
  {
    id: "division",
    title: "Division",
    gradeBand: "primary",
    difficulty: 2,
    duration: 60,
    lessonsCount: 10,
    progress: 0.2,
    status: "in_progress",
    prerequisites: ["multiplication"],
    icon: "➗",
    description: "Learn to divide and share equally"
  },
  {
    id: "fractions",
    title: "Fractions",
    gradeBand: "primary",
    difficulty: 3,
    duration: 75,
    lessonsCount: 12,
    progress: 0,
    status: "not_started",
    prerequisites: ["division"],
    icon: "🍕",
    description: "Understand parts of a whole with fractions"
  },
  {
    id: "decimals",
    title: "Decimals",
    gradeBand: "primary",
    difficulty: 3,
    duration: 60,
    lessonsCount: 8,
    progress: 0,
    status: "not_started",
    prerequisites: ["fractions"],
    icon: "🔵",
    description: "Learn about decimal numbers and place values"
  },
  {
    id: "shapes",
    title: "Basic Shapes",
    gradeBand: "primary",
    difficulty: 1,
    duration: 40,
    lessonsCount: 6,
    progress: 0.9,
    status: "in_progress",
    prerequisites: [],
    icon: "🔷",
    description: "Explore circles, squares, triangles and more"
  },

  // SECONDARY LEVEL (Grades 6-10)
  {
    id: "algebra-basics",
    title: "Algebra Basics",
    gradeBand: "secondary",
    difficulty: 2,
    duration: 90,
    lessonsCount: 15,
    progress: 0.7,
    status: "in_progress",
    prerequisites: [],
    icon: "🔤",
    description: "Introduction to variables, expressions, and equations"
  },
  {
    id: "linear-equations",
    title: "Linear Equations",
    gradeBand: "secondary",
    difficulty: 3,
    duration: 75,
    lessonsCount: 12,
    progress: 0.45,
    status: "in_progress",
    prerequisites: ["algebra-basics"],
    icon: "📈",
    description: "Solve equations and graph linear functions"
  },
  {
    id: "geometry",
    title: "Geometry",
    gradeBand: "secondary",
    difficulty: 3,
    duration: 90,
    lessonsCount: 16,
    progress: 0.3,
    status: "in_progress",
    prerequisites: ["shapes"],
    icon: "📐",
    description: "Explore angles, proofs, and geometric relationships"
  },
  {
    id: "quadratic",
    title: "Quadratic Equations",
    gradeBand: "secondary",
    difficulty: 4,
    duration: 80,
    lessonsCount: 14,
    progress: 0.15,
    status: "in_progress",
    prerequisites: ["linear-equations"],
    icon: "📊",
    description: "Master parabolas and quadratic formulas"
  },
  {
    id: "statistics",
    title: "Statistics & Probability",
    gradeBand: "secondary",
    difficulty: 3,
    duration: 70,
    lessonsCount: 12,
    progress: 0,
    status: "not_started",
    prerequisites: [],
    icon: "📉",
    description: "Learn to analyze data and calculate probabilities"
  },
  {
    id: "trigonometry",
    title: "Trigonometry",
    gradeBand: "secondary",
    difficulty: 4,
    duration: 100,
    lessonsCount: 18,
    progress: 0,
    status: "not_started",
    prerequisites: ["geometry"],
    icon: "📏",
    description: "Explore sine, cosine, tangent and their applications"
  },

  // COLLEGE LEVEL (Grades 11-12+)
  {
    id: "calculus-limits",
    title: "Limits & Continuity",
    gradeBand: "college",
    difficulty: 4,
    duration: 120,
    lessonsCount: 20,
    progress: 0.55,
    status: "in_progress",
    prerequisites: [],
    icon: "∞",
    description: "Understand the foundation of calculus"
  },
  {
    id: "derivatives",
    title: "Derivatives",
    gradeBand: "college",
    difficulty: 5,
    duration: 150,
    lessonsCount: 25,
    progress: 0.25,
    status: "in_progress",
    prerequisites: ["calculus-limits"],
    icon: "📈",
    description: "Master rates of change and differentiation"
  },
  {
    id: "integrals",
    title: "Integration",
    gradeBand: "college",
    difficulty: 5,
    duration: 150,
    lessonsCount: 25,
    progress: 0,
    status: "not_started",
    prerequisites: ["derivatives"],
    icon: "∫",
    description: "Learn definite and indefinite integrals"
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra",
    gradeBand: "college",
    difficulty: 5,
    duration: 180,
    lessonsCount: 30,
    progress: 0.1,
    status: "in_progress",
    prerequisites: [],
    icon: "🔲",
    description: "Explore matrices, vectors, and linear transformations"
  },
  {
    id: "differential-eq",
    title: "Differential Equations",
    gradeBand: "college",
    difficulty: 5,
    duration: 200,
    lessonsCount: 35,
    progress: 0,
    status: "not_started",
    prerequisites: ["derivatives", "integrals"],
    icon: "🌊",
    description: "Solve equations involving derivatives"
  },
  {
    id: "probability-theory",
    title: "Probability Theory",
    gradeBand: "college",
    difficulty: 4,
    duration: 120,
    lessonsCount: 22,
    progress: 0,
    status: "not_started",
    prerequisites: ["statistics"],
    icon: "🎲",
    description: "Advanced probability and distributions"
  }
];

export const getTopicsByGrade = (gradeBand) => {
  return topics.filter(t => t.gradeBand === gradeBand);
};

export const getTopicById = (id) => {
  return topics.find(t => t.id === id);
};

export const gradeBands = [
  { 
    id: "primary", 
    label: "Primary", 
    grades: "1-5", 
    icon: "🌟",
    description: "Foundation mathematics",
    color: "from-green-400 to-emerald-500"
  },
  { 
    id: "secondary", 
    label: "Secondary", 
    grades: "6-10", 
    icon: "🚀",
    description: "Intermediate concepts",
    color: "from-blue-400 to-indigo-500"
  },
  { 
    id: "college", 
    label: "College", 
    grades: "11+", 
    icon: "🎓",
    description: "Advanced mathematics",
    color: "from-purple-400 to-pink-500"
  }
];

// Dummy lessons data
export const lessons = {
  "algebra-basics": [
    { id: 1, title: "Introduction to Variables", duration: 15, completed: true, locked: false },
    { id: 2, title: "Understanding Expressions", duration: 20, completed: true, locked: false },
    { id: 3, title: "Simple Equations", duration: 25, completed: true, locked: false },
    { id: 4, title: "Solving for X", duration: 30, completed: false, locked: false },
    { id: 5, title: "Word Problems", duration: 35, completed: false, locked: false },
    { id: 6, title: "Practice Quiz", duration: 20, completed: false, locked: true }
  ],
  "linear-equations": [
    { id: 1, title: "Introduction to Linear Functions", duration: 20, completed: true, locked: false },
    { id: 2, title: "Slope and Y-Intercept", duration: 25, completed: true, locked: false },
    { id: 3, title: "Graphing Linear Equations", duration: 30, completed: false, locked: false },
    { id: 4, title: "Systems of Equations", duration: 35, completed: false, locked: false },
    { id: 5, title: "Final Assessment", duration: 25, completed: false, locked: true }
  ],
  "counting": [
    { id: 1, title: "Numbers 1-10", duration: 10, completed: true, locked: false },
    { id: 2, title: "Numbers 11-20", duration: 10, completed: true, locked: false },
    { id: 3, title: "Counting to 100", duration: 15, completed: true, locked: false },
    { id: 4, title: "Skip Counting", duration: 15, completed: true, locked: false },
    { id: 5, title: "Number Patterns", duration: 20, completed: true, locked: false },
    { id: 6, title: "Practice Quiz", duration: 15, completed: true, locked: false }
  ]
};

export const getLessonsByTopicId = (topicId) => {
  return lessons[topicId] || [];
};
