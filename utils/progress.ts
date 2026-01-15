import { Plan, PlanProgress } from "@/types/plan";

export const createEmptyProgress = (): PlanProgress => ({
    phases: {},
    phaseActions: {},
    weeklyTasks: {},
    weeklyMilestones: {},
    routineHistory: {},
    checkpoints: {
        day30: {},
        day60: {},
        day90: {},
    },
    successMetrics: {},
    activityLog: [],
    overallProgress: 0,
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
});

export const calculateProgress = (plan: Plan): number => {
    let totalItems = 0;
    let completedItems = 0;

    // Count phase actions
    plan.content.phases.forEach((phase, phaseIndex) => {
        phase.keyActions.forEach((_, actionIndex) => {
            totalItems++;
            if (plan.progress.phaseActions[phaseIndex]?.[actionIndex]) {
                completedItems++;
            }
        });
    });

    // Count weekly tasks
    plan.content.weeklyPlans.forEach((week, weekIndex) => {
        week.tasks.forEach((_, taskIndex) => {
            totalItems++;
            if (plan.progress.weeklyTasks[weekIndex]?.[taskIndex]) {
                completedItems++;
            }
        });
    });

    // Count checkpoints
    ["day30", "day60", "day90"].forEach((day) => {
        // @ts-ignore - Dynamic key access
        const items = plan.content.checkpoints[day as keyof typeof plan.content.checkpoints];
        items.forEach((_, index) => {
            totalItems++;
            // @ts-ignore
            if (plan.progress.checkpoints[day as keyof typeof plan.progress.checkpoints][index]) {
                completedItems++;
            }
        });
    });

    // Count success metrics
    plan.content.successMetrics.forEach((_, index) => {
        totalItems++;
        if (plan.progress.successMetrics[index]) {
            completedItems++;
        }
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
};
