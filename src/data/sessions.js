// Dummy chat session data
export const mockChatHistory = [
  {
    id: "msg-1",
    role: "teacher",
    message: "👋 Welcome! I'm your AI math tutor. I see you're working on quadratic equations. Let's solve this together!",
    type: "greeting",
    timestamp: "2024-12-19T10:00:00Z"
  },
  {
    id: "msg-2",
    role: "teacher",
    message: "Here's the problem we'll work on:",
    type: "problem",
    latex: "x^2 + 5x + 6 = 0",
    timestamp: "2024-12-19T10:00:05Z"
  },
  {
    id: "msg-3",
    role: "student",
    message: "I'm not sure how to start. Can you help?",
    timestamp: "2024-12-19T10:00:30Z"
  },
  {
    id: "msg-4",
    role: "teacher",
    message: "Of course! Let's break it down. This is a quadratic equation in the form $ax^2 + bx + c = 0$. \n\n**Think about this:** Can you identify what values a, b, and c have in our equation?",
    type: "hint",
    timestamp: "2024-12-19T10:00:45Z"
  },
  {
    id: "msg-5",
    role: "student",
    message: "a = 1, b = 5, and c = 6?",
    timestamp: "2024-12-19T10:01:15Z"
  },
  {
    id: "msg-6",
    role: "teacher",
    message: "✅ **Excellent!** You got it! Now, there are several ways to solve this:\n\n1. **Factoring** (if possible)\n2. **Quadratic Formula**\n3. **Completing the Square**\n\nSince the numbers are small, let's try factoring first. We need two numbers that **multiply to give 6** and **add up to 5**. Can you think of what those numbers might be?",
    type: "teaching",
    timestamp: "2024-12-19T10:01:30Z"
  },
  {
    id: "msg-7",
    role: "student",
    message: "2 and 3?",
    timestamp: "2024-12-19T10:02:00Z"
  },
  {
    id: "msg-8",
    role: "teacher",
    message: "🎯 **Perfect!** 2 × 3 = 6 and 2 + 3 = 5. Now we can write the equation as:",
    type: "teaching",
    latex: "(x + 2)(x + 3) = 0",
    timestamp: "2024-12-19T10:02:15Z"
  },
  {
    id: "msg-9",
    role: "teacher",
    message: "Using the **Zero Product Property**, if a product equals zero, at least one factor must be zero. So what are the values of x?",
    type: "hint",
    timestamp: "2024-12-19T10:02:30Z"
  },
  {
    id: "msg-10",
    role: "student",
    message: "x = -2 or x = -3",
    timestamp: "2024-12-19T10:03:00Z"
  },
  {
    id: "msg-11",
    role: "teacher",
    message: "🏆 **Brilliant work!** That's absolutely correct!\n\nThe solutions are $x = -2$ and $x = -3$.\n\nLet's verify by substituting back:\n- When $x = -2$: $(-2)^2 + 5(-2) + 6 = 4 - 10 + 6 = 0$ ✓\n- When $x = -3$: $(-3)^2 + 5(-3) + 6 = 9 - 15 + 6 = 0$ ✓\n\nYou've mastered factoring quadratics! Ready for another problem?",
    type: "success",
    timestamp: "2024-12-19T10:03:15Z"
  }
];

export const sampleProblems = [
  {
    id: "prob-1",
    latex: "x^2 + 5x + 6 = 0",
    text: "Solve the quadratic equation",
    difficulty: 2,
    topic: "quadratic",
    hints: [
      "This is a standard quadratic equation",
      "Try to factor by finding two numbers that multiply to 6 and add to 5",
      "The equation can be written as (x + ?)(x + ?) = 0"
    ],
    solution: "x = -2 or x = -3"
  },
  {
    id: "prob-2",
    latex: "\\frac{3}{4} + \\frac{1}{2} = ?",
    text: "Add the fractions",
    difficulty: 1,
    topic: "fractions",
    hints: [
      "First, find a common denominator",
      "The least common denominator is 4",
      "Convert 1/2 to fourths first"
    ],
    solution: "\\frac{5}{4} = 1\\frac{1}{4}"
  },
  {
    id: "prob-3",
    latex: "\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}",
    text: "Find the limit",
    difficulty: 3,
    topic: "calculus-limits",
    hints: [
      "Direct substitution gives 0/0, which is indeterminate",
      "Try factoring the numerator",
      "x² - 4 is a difference of squares"
    ],
    solution: "4"
  },
  {
    id: "prob-4",
    latex: "2x + 7 = 15",
    text: "Solve for x",
    difficulty: 1,
    topic: "algebra-basics",
    hints: [
      "Start by isolating the term with x",
      "Subtract 7 from both sides first",
      "Then divide both sides by 2"
    ],
    solution: "x = 4"
  }
];

export const ocrSampleResults = {
  success: {
    blocks: [
      {
        type: "text",
        content: "Solve for x:",
        confidence: 0.95,
        bbox: [10, 20, 100, 50]
      },
      {
        type: "formula",
        latex: "x^2 + 5x + 6 = 0",
        confidence: 0.92,
        bbox: [15, 60, 200, 100]
      }
    ],
    layoutMarkdown: "# Problem\nSolve for x:\n$$x^2 + 5x + 6 = 0$$"
  },
  processing: {
    status: "processing",
    progress: 65,
    message: "Analyzing math expressions..."
  }
};

export const sessionSteps = [
  "greeting",
  "problem_presentation",
  "initial_assessment",
  "teaching",
  "guided_practice",
  "hint",
  "answer_check",
  "success",
  "next_problem"
];
