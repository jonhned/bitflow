export interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedSkins: string[];
  currentCourseId: string;
  completedChallenges: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  technology: Technology;
  icon: string;
  color: string;
  finalProject: FinalProject;
  modules: CourseModule[];
}

export interface FinalProject {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  requirements: ProjectRequirement[];
  starterCode: string;
  solution?: string;
}

export interface ProjectRequirement {
  id: string;
  text: string;
  hint: string;
  validationRegex?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  challenges: Challenge[];
}

export interface BaseChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  instructions: string;
  rewardXP: number;
  difficulty: Difficulty;
  hints: string[];
}

export interface CodeChallenge extends BaseChallenge {
  type: "code" | "bug-fix";
  initialCode: string;
  validationType: "regex" | "contains" | "output";
  validation: string;
}

export interface QuizChallenge extends BaseChallenge {
  type: "quiz";
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface FillBlankChallenge extends BaseChallenge {
  type: "fill-blank";
  code: string;
  blanks: { id: string; answer: string; hint: string }[];
}

export type Challenge = CodeChallenge | QuizChallenge | FillBlankChallenge;

export interface LearningAnalytics {
  id: string;
  userId: string;
  challengeId: string;
  courseId: string;
  moduleId: string;
  attempts: number;
  timeSpent: number;
  completed: boolean;
  completedAt: string | null;
  hintsUsed: number;
  errorCount: number;
}

export type Technology = "html" | "css" | "javascript" | "php" | "python";

export type ChallengeType = "code" | "quiz" | "bug-fix" | "fill-blank";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type SkinId = "default" | "neon_hacker" | "pixel_master" | "code_ninja";

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  requiredLevel: number;
  accentColor: string;
}

export interface AppState {
  user: User | null;
  analytics: LearningAnalytics[];
  isLoading: boolean;

  setUser: (user: User) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  completeChallenge: (challengeId: string, analytics: LearningAnalytics) => void;
  updateAnalytics: (entry: LearningAnalytics) => void;
  setAnalytics: (entries: LearningAnalytics[]) => void;
  resetProgress: () => void;
}