export interface QuestionnaireAnswer {
  timeframe: "1_month" | "3_months" | "6_months" | "1_year";
  commitment: "light" | "moderate" | "intensive";
  experience: "beginner" | "intermediate" | "advanced";
  obstacles: string[];
  motivation: string;
}

export interface WeeklyPlan {
  week: number;
  focus: string;
  tasks: string[];
  milestone: string;
}

export interface Phase {
  name: string;
  duration: string;
  objective: string;
  keyActions: string[];
  deliverables: string[];
}

export interface Routine {
  name: string;
  frequency: string;
  duration: string;
  description: string;
}

export interface Obstacle {
  challenge: string;
  solution: string;
  prevention: string;
}

export interface PlanContent {
  title: string;
  summary: string;
  diagnosis: {
    currentState: string;
    gap: string;
    successFactors: string[];
  };
  phases: Phase[];
  weeklyPlans: WeeklyPlan[];
  routines: Routine[];
  obstacles: Obstacle[];
  checkpoints: {
    day30: string[];
    day60: string[];
    day90: string[];
  };
  successMetrics: string[];
  motivationalQuote: string;
}

// Progress tracking for each plan
export interface PlanProgress {
  // Phase completion (index -> completed)
  phases: Record<number, boolean>;
  // Phase actions completion (phaseIndex -> actionIndex -> completed)
  phaseActions: Record<number, Record<number, boolean>>;
  // Weekly tasks completion (weekIndex -> taskIndex -> completed)
  weeklyTasks: Record<number, Record<number, boolean>>;
  // Weekly milestones completion
  weeklyMilestones: Record<number, boolean>;
  // Routines tracked (index -> array of dates completed)
  routineHistory: Record<number, string[]>;
  // Checkpoints (day30/day60/day90 -> itemIndex -> completed)
  checkpoints: {
    day30: Record<number, boolean>;
    day60: Record<number, boolean>;
    day90: Record<number, boolean>;
  };
  // Success metrics (index -> completed)
  successMetrics: Record<number, boolean>;
  // Activity history
  activityLog: ActivityLogEntry[];
  // Overall progress percentage (0-100)
  overallProgress: number;
  // Start date
  startedAt: string;
  // Last activity date
  lastActivityAt: string;
}

export interface ActivityLogEntry {
  id: string;
  type: "task_completed" | "milestone_reached" | "phase_completed" | "routine_done" | "checkpoint_reached";
  description: string;
  timestamp: string;
  category: "phase" | "weekly" | "routine" | "checkpoint" | "metric";
}

export interface Plan {
  id: string;
  goal: string;
  answers: QuestionnaireAnswer;
  content: PlanContent;
  createdAt: string;
  isPremium: boolean;
  progress: PlanProgress;
}

export interface QuestionnaireQuestion {
  id: keyof QuestionnaireAnswer;
  question: string;
  type: "single" | "multi" | "text";
  options?: { value: string; label: string; icon?: string }[];
}

// App settings
export interface AppSettings {
  hasCompletedOnboarding: boolean;
  userName?: string;
  notifications: boolean;
}
