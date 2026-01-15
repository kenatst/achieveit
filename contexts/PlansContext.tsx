import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { Plan, QuestionnaireAnswer, PlanProgress, ActivityLogEntry } from "@/types/plan";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { cancelMissedRoutineNudge } from "@/utils/notifications";
import { calculateProgress, createEmptyProgress } from "@/utils/progress";

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
      if (!stored) return [];

      const parsedPlans = JSON.parse(stored) as Plan[];
      // Migrate old plans without progress
      return parsedPlans.map(plan => ({
        ...plan,
        progress: plan.progress || createEmptyProgress(),
      }));
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
        progress: createEmptyProgress(),
      };

      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      savePlansMutation.mutate(updatedPlans);

      return newPlan;
    },
  });

  const updatePlanProgress = (
    planId: string,
    updateFn: (progress: PlanProgress) => PlanProgress,
    activityEntry?: Omit<ActivityLogEntry, "id" | "timestamp">
  ) => {
    const updatedPlans = plans.map((plan) => {
      if (plan.id !== planId) return plan;

      let newProgress = updateFn(plan.progress);

      // Add activity log entry if provided
      if (activityEntry) {
        const logEntry: ActivityLogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...activityEntry,
        };
        newProgress = {
          ...newProgress,
          activityLog: [logEntry, ...newProgress.activityLog].slice(0, 100), // Keep last 100
          lastActivityAt: logEntry.timestamp,
        };
      }

      const updatedPlan = { ...plan, progress: newProgress };
      // Recalculate overall progress
      updatedPlan.progress.overallProgress = calculateProgress(updatedPlan);

      return updatedPlan;
    });

    setPlans(updatedPlans);
    savePlansMutation.mutate(updatedPlans);
  };

  const togglePhaseAction = (planId: string, phaseIndex: number, actionIndex: number, actionText: string) => {
    updatePlanProgress(
      planId,
      (progress) => {
        const current = progress.phaseActions[phaseIndex]?.[actionIndex] || false;
        return {
          ...progress,
          phaseActions: {
            ...progress.phaseActions,
            [phaseIndex]: {
              ...progress.phaseActions[phaseIndex],
              [actionIndex]: !current,
            },
          },
        };
      },
      {
        type: "task_completed",
        description: actionText,
        category: "phase",
      }
    );
  };

  const toggleWeeklyTask = (planId: string, weekIndex: number, taskIndex: number, taskText: string) => {
    updatePlanProgress(
      planId,
      (progress) => {
        const current = progress.weeklyTasks[weekIndex]?.[taskIndex] || false;
        return {
          ...progress,
          weeklyTasks: {
            ...progress.weeklyTasks,
            [weekIndex]: {
              ...progress.weeklyTasks[weekIndex],
              [taskIndex]: !current,
            },
          },
        };
      },
      {
        type: "task_completed",
        description: taskText,
        category: "weekly",
      }
    );
  };

  const toggleWeeklyMilestone = (planId: string, weekIndex: number, milestoneText: string) => {
    updatePlanProgress(
      planId,
      (progress) => {
        const current = progress.weeklyMilestones[weekIndex] || false;
        return {
          ...progress,
          weeklyMilestones: {
            ...progress.weeklyMilestones,
            [weekIndex]: !current,
          },
        };
      },
      {
        type: "milestone_reached",
        description: milestoneText,
        category: "weekly",
      }
    );
  };

  const toggleCheckpoint = (planId: string, day: "day30" | "day60" | "day90", itemIndex: number, itemText: string) => {
    updatePlanProgress(
      planId,
      (progress) => {
        const current = progress.checkpoints[day][itemIndex] || false;
        return {
          ...progress,
          checkpoints: {
            ...progress.checkpoints,
            [day]: {
              ...progress.checkpoints[day],
              [itemIndex]: !current,
            },
          },
        };
      },
      {
        type: "checkpoint_reached",
        description: itemText,
        category: "checkpoint",
      }
    );
  };

  const toggleSuccessMetric = (planId: string, metricIndex: number, metricText: string) => {
    updatePlanProgress(
      planId,
      (progress) => {
        const current = progress.successMetrics[metricIndex] || false;
        return {
          ...progress,
          successMetrics: {
            ...progress.successMetrics,
            [metricIndex]: !current,
          },
        };
      },
      {
        type: "milestone_reached",
        description: metricText,
        category: "metric",
      }
    );
  };

  const logRoutine = (planId: string, routineIndex: number, routineName: string) => {
    const today = new Date().toISOString().split("T")[0];
    updatePlanProgress(
      planId,
      (progress) => {
        const history = progress.routineHistory[routineIndex] || [];
        const alreadyLogged = history.includes(today);

        // Smart Reminder Logic: If marking as done, cancel any pending nudge
        if (!alreadyLogged) {
          cancelMissedRoutineNudge();
        }

        return {
          ...progress,
          routineHistory: {
            ...progress.routineHistory,
            [routineIndex]: alreadyLogged
              ? history.filter((d) => d !== today)
              : [...history, today],
          },
        };
      },
      {
        type: "routine_done",
        description: routineName,
        category: "routine",
      }
    );
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter((p) => p.id !== planId);
    setPlans(updatedPlans);
    savePlansMutation.mutate(updatedPlans);
  };

  const getPlanById = (planId: string) => plans.find((p) => p.id === planId);

  return {
    plans,
    isLoading: plansQuery.isLoading,
    generatePlan: generatePlanMutation.mutateAsync,
    isGenerating: generatePlanMutation.isPending,
    generationError: generatePlanMutation.error,
    deletePlan,
    getPlanById,
    // Progress tracking
    togglePhaseAction,
    toggleWeeklyTask,
    toggleWeeklyMilestone,
    toggleCheckpoint,
    toggleSuccessMetric,
    logRoutine,
  };
});
