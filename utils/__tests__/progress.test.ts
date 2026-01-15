import { calculateProgress, createEmptyProgress } from "../progress";
import { Plan } from "../../types/plan";

const mockPlan = (overrides: Partial<Plan> = {}): Plan => ({
    id: "1",
    goal: "Test Goal",
    answers: {} as any,
    content: {
        title: "Test Plan",
        summary: "Summary",
        diagnosis: { currentState: "", gap: "", successFactors: [] },
        phases: [
            {
                name: "Phase 1",
                duration: "1 month",
                objective: "Obj",
                keyActions: ["Action 1", "Action 2"],
                deliverables: [],
            },
        ],
        weeklyPlans: [
            { week: 1, focus: "Focus", tasks: ["Task 1", "Task 2"], milestone: "Milestone" },
        ],
        routines: [],
        obstacles: [],
        checkpoints: { day30: ["Check 1"], day60: [], day90: [] },
        successMetrics: ["Metric 1"],
        motivationalQuote: "Quote",
    },
    createdAt: new Date().toISOString(),
    isPremium: true,
    progress: createEmptyProgress(),
    ...overrides,
});

describe("calculateProgress", () => {
    it("should return 0 for a new plan", () => {
        const plan = mockPlan();
        expect(calculateProgress(plan)).toBe(0);
    });

    it("should calculate correct percentage for mixed items", () => {
        const plan = mockPlan();
        // Total items:
        // Phases: 2 actions
        // Weekly: 2 tasks
        // Checkpoints: 1 (day30)
        // Metrics: 1
        // Total = 6 items

        // Complete 1 action
        plan.progress.phaseActions[0] = { 0: true };
        // Complete 1 task
        plan.progress.weeklyTasks[0] = { 0: true };
        // Complete 1 metric
        plan.progress.successMetrics[0] = true;

        // Completed = 3 items
        // 3/6 = 50%

        expect(calculateProgress(plan)).toBe(50);
    });

    it("should handle rounding correctly", () => {
        const plan = mockPlan();
        // 6 items total
        // Complete 1 item -> 1/6 = 16.666% -> 17%
        plan.progress.phaseActions[0] = { 0: true };

        expect(calculateProgress(plan)).toBe(17);
    });

    it("should return 100 when everything is done", () => {
        const plan = mockPlan();
        plan.progress.phaseActions[0] = { 0: true, 1: true };
        plan.progress.weeklyTasks[0] = { 0: true, 1: true };
        plan.progress.checkpoints.day30 = [true];
        plan.progress.successMetrics[0] = true;

        expect(calculateProgress(plan)).toBe(100);
    });
});
