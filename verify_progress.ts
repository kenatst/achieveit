
import { calculateProgress, createEmptyProgress } from "./utils/progress";

const mockPlan = (overrides = {}) => ({
    id: "1",
    goal: "Test Goal",
    answers: {},
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

console.log("Running Progress Calculation Tests...");

const plan = mockPlan();
// Total items: 6 (2 actions + 2 tasks + 1 checkpoint + 1 metric)

// Test 1: 0%
const res0 = calculateProgress(plan);
console.log(`Test 1 (0%): ${res0 === 0 ? "PASS" : "FAIL (" + res0 + ")"}`);

// Test 2: 50%
plan.progress.phaseActions[0] = { 0: true }; // 1
plan.progress.weeklyTasks[0] = { 0: true }; // 1
plan.progress.successMetrics[0] = true; // 1
// 3/6 = 50%
const res50 = calculateProgress(plan);
console.log(`Test 2 (50%): ${res50 === 50 ? "PASS" : "FAIL (" + res50 + ")"}`);

// Test 3: 100%
plan.progress.phaseActions[0] = { 0: true, 1: true };
plan.progress.weeklyTasks[0] = { 0: true, 1: true };
plan.progress.checkpoints.day30 = [true];
plan.progress.successMetrics[0] = true;
const res100 = calculateProgress(plan);
console.log(`Test 3 (100%): ${res100 === 100 ? "PASS" : "FAIL (" + res100 + ")"}`);

console.log("Done.");
