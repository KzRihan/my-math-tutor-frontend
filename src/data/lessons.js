// Complete lessons data with rich content for all topics
export const lessons = [
  // ============================================
  // ALGEBRA BASICS - 6 LESSONS
  // ============================================
  {
    id: "algebra-basics-1",
    topicId: "algebra-basics",
    lessonNumber: 1,
    title: "Introduction to Variables",
    duration: 15,
    status: "completed",
    content: "A variable is a letter or symbol that represents an unknown number. Variables are the foundation of algebra and allow us to write general expressions and equations that work for many different numbers. Think of a variable like a box that can hold different values. The most commonly used variables are x, y, and z, but any letter can be used.",
    examples: [
      {
        latex: "x + 5 = 10",
        explanation: "Here 'x' is a variable representing an unknown number. To find x, we subtract 5 from both sides: x = 10 - 5 = 5"
      },
      {
        latex: "2y = 14",
        explanation: "The variable 'y' represents a number. Since 2 × 7 = 14, we can find that y = 7 by dividing both sides by 2"
      },
      {
        latex: "a + b = 12",
        explanation: "We can use multiple variables in the same expression. Here, 'a' and 'b' could be any numbers that add up to 12, like 5 and 7, or 6 and 6"
      }
    ],
    practiceProblems: [
      { question: "If x + 3 = 8, what is x?", answer: "5" },
      { question: "If 5y = 25, what is y?", answer: "5" },
      { question: "If z - 7 = 10, what is z?", answer: "17" }
    ]
  },
  {
    id: "algebra-basics-2",
    topicId: "algebra-basics",
    lessonNumber: 2,
    title: "Understanding Expressions",
    duration: 20,
    status: "completed",
    content: "An algebraic expression combines numbers, variables, and operations (like +, -, ×, ÷). Unlike equations, expressions don't have an equals sign - they're just mathematical phrases. We can simplify expressions by combining like terms (terms with the same variable and power). Understanding expressions is crucial for solving equations later.",
    examples: [
      {
        latex: "3x + 2x = 5x",
        explanation: "These are 'like terms' because they both have the variable x. We add the coefficients (3 + 2 = 5) to get 5x"
      },
      {
        latex: "2(x + 4) = 2x + 8",
        explanation: "Using the distributive property: multiply 2 by each term inside the parentheses. 2 × x = 2x, and 2 × 4 = 8"
      },
      {
        latex: "5a + 3b - 2a = 3a + 3b",
        explanation: "Combine like terms: 5a - 2a = 3a. The 3b stays the same since there's no other 'b' term to combine with"
      }
    ],
    practiceProblems: [
      { question: "Simplify: 4x + 3x", answer: "7x" },
      { question: "Expand: 3(y + 2)", answer: "3y + 6" },
      { question: "Simplify: 8m - 3m + 2n", answer: "5m + 2n" }
    ]
  },
  {
    id: "algebra-basics-3",
    topicId: "algebra-basics",
    lessonNumber: 3,
    title: "Simple Equations",
    duration: 25,
    status: "completed",
    content: "An equation is a mathematical statement that shows two expressions are equal, connected by an equals sign (=). The goal of solving an equation is to find the value of the unknown variable that makes the equation true. We solve equations by performing the same operation on both sides to keep them balanced - this is called the 'balance method'.",
    examples: [
      {
        latex: "x + 7 = 12 → x = 5",
        explanation: "Subtract 7 from both sides to isolate x: x + 7 - 7 = 12 - 7, so x = 5"
      },
      {
        latex: "3x = 15 → x = 5",
        explanation: "Divide both sides by 3 to isolate x: 3x ÷ 3 = 15 ÷ 3, so x = 5"
      },
      {
        latex: "x - 4 = 9 → x = 13",
        explanation: "Add 4 to both sides to isolate x: x - 4 + 4 = 9 + 4, so x = 13"
      }
    ],
    practiceProblems: [
      { question: "Solve: x + 5 = 11", answer: "6" },
      { question: "Solve: 4x = 24", answer: "6" },
      { question: "Solve: y - 8 = 15", answer: "23" }
    ]
  },
  {
    id: "algebra-basics-4",
    topicId: "algebra-basics",
    lessonNumber: 4,
    title: "Solving for X",
    duration: 30,
    status: "in_progress",
    content: "Now we'll tackle more complex equations that require multiple steps to solve. The key strategy is to isolate the variable on one side of the equation. Think of it as 'undoing' operations in reverse order. First, undo addition or subtraction, then undo multiplication or division. Always perform the same operation on both sides to maintain balance.",
    examples: [
      {
        latex: "2x + 5 = 13 → x = 4",
        explanation: "Step 1: Subtract 5 from both sides: 2x = 8. Step 2: Divide both sides by 2: x = 4"
      },
      {
        latex: "3x - 7 = 14 → x = 7",
        explanation: "Step 1: Add 7 to both sides: 3x = 21. Step 2: Divide both sides by 3: x = 7"
      },
      {
        latex: "(x + 3)/2 = 5 → x = 7",
        explanation: "Step 1: Multiply both sides by 2: x + 3 = 10. Step 2: Subtract 3 from both sides: x = 7"
      }
    ],
    practiceProblems: [
      { question: "Solve: 2x + 4 = 12", answer: "4" },
      { question: "Solve: 5x - 10 = 25", answer: "7" },
      { question: "Solve: 3x + 6 = 21", answer: "5" },
      { question: "Solve: (x - 2)/3 = 4", answer: "14" }
    ]
  },
  {
    id: "algebra-basics-5",
    topicId: "algebra-basics",
    lessonNumber: 5,
    title: "Word Problems",
    duration: 35,
    status: "not_started",
    content: "Word problems let us apply algebra to real-life situations. The key is to translate the words into a mathematical equation. Look for keywords: 'sum' or 'total' means addition, 'difference' means subtraction, 'product' means multiplication, and 'quotient' means division. Identify what you're trying to find (the unknown), assign it a variable, and then write an equation.",
    examples: [
      {
        latex: "Age Problem: x + 5 = 18",
        explanation: "Problem: 'In 5 years, Maria will be 18 years old. How old is she now?' Let x = Maria's current age. In 5 years means we add 5, so: x + 5 = 18. Solving: x = 13 years old"
      },
      {
        latex: "Shopping: 3x = 27",
        explanation: "Problem: 'Three identical books cost $27. How much does one book cost?' Let x = price of one book. Three books: 3x = 27. Solving: x = $9"
      },
      {
        latex: "Perimeter: 2x + 2(x+3) = 30",
        explanation: "Problem: 'A rectangle has length 3 more than width, perimeter is 30. Find dimensions.' Let x = width. Length = x + 3. Perimeter formula gives us: 2x + 2(x+3) = 30 → x = 6 (width), length = 9"
      }
    ],
    practiceProblems: [
      { question: "Tom is twice as old as his sister. If Tom is 16, how old is his sister?", answer: "8" },
      { question: "5 pens cost $15. What is the cost of 1 pen?", answer: "$3" },
      { question: "A number plus 12 equals 25. What is the number?", answer: "13" }
    ]
  },
  {
    id: "algebra-basics-6",
    topicId: "algebra-basics",
    lessonNumber: 6,
    title: "Practice Quiz",
    duration: 20,
    status: "not_started",
    isQuiz: true,
    content: "Test your understanding of Algebra Basics! This quiz covers all the concepts we've learned: variables, expressions, equations, solving for unknowns, and word problems. Take your time and show your work. You can use scratch paper to work through the problems.",
    examples: [],
    practiceProblems: [
      { question: "What is a variable?", answer: "A letter or symbol that represents an unknown number" },
      { question: "Simplify: 6x + 2x - 3x", answer: "5x" },
      { question: "Solve: x + 9 = 15", answer: "6" },
      { question: "Solve: 4x = 28", answer: "7" },
      { question: "Solve: 2x + 6 = 20", answer: "7" },
      { question: "If a number doubled equals 18, what is the number?", answer: "9" },
      { question: "Expand: 4(x + 5)", answer: "4x + 20" },
      { question: "Solve: 3x - 9 = 12", answer: "7" }
    ]
  },

  // ============================================
  // FRACTIONS - Existing lessons
  // ============================================
  {
    id: "fractions-intro",
    topicId: "fractions",
    lessonNumber: 1,
    title: "What is a Fraction?",
    duration: 10,
    status: "completed",
    content: "A fraction represents a part of a whole. When we divide something into equal parts, each part is a fraction of the whole. Fractions are written with two numbers: the top number (numerator) and the bottom number (denominator), separated by a line.",
    examples: [
      {
        latex: "1/2",
        explanation: "One half - when you divide something into 2 equal parts and take 1"
      },
      {
        latex: "3/4",
        explanation: "Three quarters - divide into 4 parts, take 3"
      }
    ],
    practiceProblems: [
      { question: "What fraction is shaded if 1 out of 4 parts is colored?", answer: "1/4" },
      { question: "Write the fraction for three out of five parts", answer: "3/5" }
    ]
  },
  {
    id: "fractions-numerator-denominator",
    topicId: "fractions",
    lessonNumber: 2,
    title: "Numerator and Denominator",
    duration: 12,
    status: "completed",
    content: "Every fraction has two parts: the numerator (top number) tells us how many parts we have, and the denominator (bottom number) tells us how many equal parts the whole is divided into.",
    examples: [
      {
        latex: "numerator/denominator = 3/5",
        explanation: "3 is the numerator, 5 is the denominator"
      }
    ],
    practiceProblems: [
      { question: "In the fraction 7/8, what is the numerator?", answer: "7" },
      { question: "In the fraction 2/3, what is the denominator?", answer: "3" }
    ]
  },
  {
    id: "fractions-equivalent",
    topicId: "fractions",
    lessonNumber: 3,
    title: "Equivalent Fractions",
    duration: 15,
    status: "in_progress",
    content: "Equivalent fractions are different fractions that represent the same value. You can create equivalent fractions by multiplying or dividing both the numerator and denominator by the same number.",
    examples: [
      {
        latex: "1/2 = 2/4 = 3/6 = 4/8",
        explanation: "All these fractions represent the same amount - one half"
      }
    ],
    practiceProblems: [
      { question: "Find an equivalent fraction to 1/3", answer: "2/6" }
    ]
  },

  // ============================================
  // CALCULUS LIMITS - Existing lessons
  // ============================================
  {
    id: "limits-intro",
    topicId: "calculus-limits",
    lessonNumber: 1,
    title: "Introduction to Limits",
    duration: 20,
    status: "completed",
    content: "A limit describes the value that a function approaches as the input approaches some value. Limits are fundamental to calculus and help define derivatives and integrals.",
    examples: [
      {
        latex: "lim(x→2) x² = 4",
        explanation: "As x gets closer to 2, x² gets closer to 4"
      },
      {
        latex: "lim(x→0) sin(x)/x = 1",
        explanation: "A famous limit used throughout calculus"
      }
    ],
    practiceProblems: [
      { question: "Find the limit: lim(x→3) of (x + 1)", answer: "4" }
    ]
  },
  {
    id: "limits-properties",
    topicId: "calculus-limits",
    lessonNumber: 2,
    title: "Properties of Limits",
    duration: 25,
    status: "in_progress",
    content: "Limits follow several important properties: the limit of a sum is the sum of limits, the limit of a product is the product of limits.",
    examples: [
      {
        latex: "lim[f(x) + g(x)] = lim f(x) + lim g(x)",
        explanation: "Sum property of limits"
      },
      {
        latex: "lim[c · f(x)] = c · lim f(x)",
        explanation: "Constant multiple property"
      }
    ],
    practiceProblems: [
      { question: "If lim f(x) = 3 and lim g(x) = 2, find lim[f(x) + g(x)]", answer: "5" }
    ]
  },
  {
    id: "derivatives-intro",
    topicId: "derivatives",
    lessonNumber: 1,
    title: "The Derivative Concept",
    duration: 25,
    status: "completed",
    content: "The derivative measures the instantaneous rate of change of a function. It represents the slope of the tangent line to a curve at any point.",
    examples: [
      {
        latex: "f'(x) = lim(h→0) [f(x+h) - f(x)]/h",
        explanation: "The formal definition of a derivative"
      },
      {
        latex: "d/dx(x²) = 2x",
        explanation: "The derivative of x² is 2x"
      }
    ],
    practiceProblems: [
      { question: "Find the derivative of f(x) = x³", answer: "3x²" }
    ]
  }
];

export const getLessonsByTopic = (topicId) => {
  return lessons.filter(l => l.topicId === topicId);
};

export const getLessonById = (id) => {
  return lessons.find(l => l.id === id);
};

// Get lesson by topic and lesson number
export const getLessonByNumber = (topicId, lessonNumber) => {
  return lessons.find(l => l.topicId === topicId && l.lessonNumber === lessonNumber);
};
