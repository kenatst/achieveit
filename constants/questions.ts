import { QuestionnaireQuestion } from "@/types/plan";

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
