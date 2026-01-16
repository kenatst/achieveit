import { QuestionnaireQuestion } from "@/types/plan";

// Get translated questions based on current locale
export const getQuestions = (t: (key: string) => string): QuestionnaireQuestion[] => [
  {
    id: "timeframe",
    question: t("questionnaire.q1_title"),
    type: "single",
    options: [
      { value: "1_month", label: t("questionnaire.q1_opt1"), icon: "⚡" },
      { value: "3_months", label: t("questionnaire.q1_opt2"), icon: "🎯" },
      { value: "6_months", label: t("questionnaire.q1_opt3"), icon: "📈" },
      { value: "1_year", label: t("questionnaire.q1_opt4"), icon: "🏆" },
    ],
  },
  {
    id: "commitment",
    question: t("questionnaire.q2_title"),
    type: "single",
    options: [
      { value: "light", label: t("questionnaire.q2_opt1"), icon: "🌱" },
      { value: "moderate", label: t("questionnaire.q2_opt2"), icon: "🔥" },
      { value: "intensive", label: t("questionnaire.q2_opt3"), icon: "💪" },
    ],
  },
  {
    id: "experience",
    question: t("questionnaire.q3_title"),
    type: "single",
    options: [
      { value: "beginner", label: t("questionnaire.q3_opt1"), icon: "🌟" },
      { value: "intermediate", label: t("questionnaire.q3_opt2"), icon: "📚" },
      { value: "advanced", label: t("questionnaire.q3_opt3"), icon: "🎓" },
    ],
  },
  {
    id: "obstacles",
    question: t("questionnaire.q4_title"),
    type: "multi",
    options: [
      { value: "time", label: t("questionnaire.q4_opt1"), icon: "⏰" },
      { value: "motivation", label: t("questionnaire.q4_opt2"), icon: "💭" },
      { value: "resources", label: t("questionnaire.q4_opt3"), icon: "💰" },
      { value: "knowledge", label: t("questionnaire.q4_opt4"), icon: "📖" },
      { value: "overwhelm", label: t("questionnaire.q4_opt5"), icon: "🤝" },
    ],
  },
  {
    id: "motivation",
    question: t("questionnaire.q5_title"),
    type: "text",
  },
];

// Legacy export for backwards compatibility (English only)
export const questions: QuestionnaireQuestion[] = [
  {
    id: "timeframe",
    question: "What's your target timeframe?",
    type: "single",
    options: [
      { value: "1_month", label: "1 Month", icon: "⚡" },
      { value: "3_months", label: "3 Months", icon: "🎯" },
      { value: "6_months", label: "6 Months", icon: "📈" },
      { value: "1_year", label: "1 Year", icon: "🏆" },
    ],
  },
  {
    id: "commitment",
    question: "How much time can you dedicate daily?",
    type: "single",
    options: [
      { value: "light", label: "30 min - 1 hour", icon: "🌱" },
      { value: "moderate", label: "1 - 3 hours", icon: "🔥" },
      { value: "intensive", label: "3+ hours", icon: "💪" },
    ],
  },
  {
    id: "experience",
    question: "What's your experience level in this area?",
    type: "single",
    options: [
      { value: "beginner", label: "Complete beginner", icon: "🌟" },
      { value: "intermediate", label: "Some experience", icon: "📚" },
      { value: "advanced", label: "Looking to master", icon: "🎓" },
    ],
  },
  {
    id: "obstacles",
    question: "What challenges do you anticipate?",
    type: "multi",
    options: [
      { value: "time", label: "Limited time", icon: "⏰" },
      { value: "motivation", label: "Staying motivated", icon: "💭" },
      { value: "resources", label: "Limited resources", icon: "💰" },
      { value: "knowledge", label: "Lack of knowledge", icon: "📖" },
      { value: "accountability", label: "Staying accountable", icon: "🤝" },
    ],
  },
  {
    id: "motivation",
    question: "Why is this goal important to you?",
    type: "text",
  },
];
