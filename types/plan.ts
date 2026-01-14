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

export interface Plan {
  id: string;
  goal: string;
  answers: QuestionnaireAnswer;
  content: PlanContent;
  createdAt: string;
  isPremium: boolean;
}

export interface QuestionnaireQuestion {
  id: keyof QuestionnaireAnswer;
  question: string;
  type: "single" | "multi" | "text";
  options?: { value: string; label: string; icon?: string }[];
}
