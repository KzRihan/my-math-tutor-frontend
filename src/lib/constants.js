// Application constants

export const APP_NAME = 'MathTutor AI';
export const APP_TAGLINE = 'Your Personal AI Mathematics Tutor';

export const GRADE_BANDS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  COLLEGE: 'college'
};

export const SESSION_STEPS = {
  GREETING: 'greeting',
  PROBLEM: 'problem_presentation',
  TEACHING: 'teaching',
  PRACTICE: 'guided_practice',
  HINT: 'hint',
  CHECK: 'answer_check',
  SUCCESS: 'success'
};

export const MESSAGE_TYPES = {
  GREETING: 'greeting',
  TEACHING: 'teaching',
  HINT: 'hint',
  PROBLEM: 'problem',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/topics', label: 'Topics', icon: 'book' },
  { href: '/capture', label: 'Capture', icon: 'camera' },
  { href: '/solve', label: 'AI Tutor', icon: 'chat' },
  { href: '/progress', label: 'Progress', icon: 'chart' }
];

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: null },
  { code: 'hi', label: 'हिंदी', flag: null },
  { code: 'te', label: 'తెలుగు', flag: null },
  { code: 'ta', label: 'தமிழ்', flag: null },
  { code: 'ml', label: 'മലയാളം', flag: null }
];

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 AI tutoring sessions/day',
      'Basic topics access',
      'Progress tracking',
      'Community support'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 9, // USD/month
    features: [
      'Unlimited AI tutoring',
      'All topics & lessons',
      'Advanced analytics',
      'Offline mode',
      'Priority support',
      'No ads'
    ]
  },
  FAMILY: {
    id: 'family',
    name: 'Family',
    price: 19, // USD/month
    features: [
      'Everything in Premium',
      'Up to 5 family members',
      'Parent dashboard',
      'Progress reports',
      'Custom learning paths'
    ]
  }
};

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/mathtutor',
  instagram: 'https://instagram.com/mathtutor',
  youtube: 'https://youtube.com/@mathtutor',
  discord: 'https://discord.gg/mathtutor'
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password'
  },
  USER: {
    PROFILE: '/me',
    PREFERENCES: '/me/preferences',
    PROGRESS: '/progress'
  },
  TOPICS: '/topics',
  SESSIONS: '/sessions',
  UPLOADS: '/uploads'
};
