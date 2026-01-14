import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { Plan, QuestionnaireAnswer } from "@/types/plan";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

const PLANS_STORAGE_KEY = "how_to_achieve_plans";

const planContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  diagnosis: z.object({
    currentState: z.string(),
    gap: z.string(),
    successFactors: z.array(z.string()),
  }),
  phases: z.array(
    z.object({
      name: z.string(),
      duration: z.string(),
      objective: z.string(),
      keyActions: z.array(z.string()),
      deliverables: z.array(z.string()),
    })
  ),
  weeklyPlans: z.array(
    z.object({
      week: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
      milestone: z.string(),
    })
  ),
  routines: z.array(
    z.object({
      name: z.string(),
      frequency: z.string(),
      duration: z.string(),
      description: z.string(),
    })
  ),
  obstacles: z.array(
    z.object({
      challenge: z.string(),
      solution: z.string(),
      prevention: z.string(),
    })
  ),
  checkpoints: z.object({
    day30: z.array(z.string()),
    day60: z.array(z.string()),
    day90: z.array(z.string()),
  }),
  successMetrics: z.array(z.string()),
  motivationalQuote: z.string(),
});

export const [PlansProvider, usePlans] = createContextHook(() => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PLANS_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Plan[]) : [];
    },
  });

  useEffect(() => {
    if (plansQuery.data) {
      setPlans(plansQuery.data);
    }
  }, [plansQuery.data]);

  const savePlansMutation = useMutation({
    mutationFn: async (newPlans: Plan[]) => {
      await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(newPlans));
      return newPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async ({
      goal,
      answers,
    }: {
      goal: string;
      answers: QuestionnaireAnswer;
    }) => {
      const timeframeMap = {
        "1_month": "1 month",
        "3_months": "3 months",
        "6_months": "6 months",
        "1_year": "1 year",
      };

      const commitmentMap = {
        light: "30 minutes to 1 hour daily",
        moderate: "1 to 3 hours daily",
        intensive: "3+ hours daily",
      };

      const prompt = `Create a comprehensive, premium-quality achievement plan for the following goal:

GOAL: "${goal}"

USER PROFILE:
- Timeframe: ${timeframeMap[answers.timeframe]}
- Daily commitment: ${commitmentMap[answers.commitment]}
- Experience level: ${answers.experience}
- Anticipated challenges: ${answers.obstacles.join(", ") || "None specified"}
- Personal motivation: ${answers.motivation || "Not specified"}

Generate a detailed, actionable plan that includes:
1. A compelling title and executive summary
2. A diagnosis of current state, gap analysis, and success factors
3. 3-4 distinct phases with clear objectives and deliverables
4. Weekly plans for the first 4-8 weeks with specific tasks
5. Daily/weekly routines to build consistency
6. Potential obstacles with solutions and prevention strategies
7. 30/60/90 day checkpoints with measurable milestones
8. Success metrics to track progress
9. An inspiring motivational quote relevant to the goal

Make the content:
- Highly specific and actionable (not generic advice)
- Realistic given the user's timeframe and commitment level
- Motivating and encouraging while being practical
- Structured for easy implementation`;

      const content = await generateObject({
        messages: [{ role: "user", content: prompt }],
        schema: planContentSchema,
      });

      const newPlan: Plan = {
        id: Date.now().toString(),
        goal,
        answers,
        content,
        createdAt: new Date().toISOString(),
        isPremium: true,
      };

      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      savePlansMutation.mutate(updatedPlans);

      return newPlan;
    },
  });

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter((p) => p.id !== planId);
    setPlans(updatedPlans);
    savePlansMutation.mutate(updatedPlans);
  };

  return {
    plans,
    isLoading: plansQuery.isLoading,
    generatePlan: generatePlanMutation.mutateAsync,
    isGenerating: generatePlanMutation.isPending,
    generationError: generatePlanMutation.error,
    deletePlan,
  };
});
