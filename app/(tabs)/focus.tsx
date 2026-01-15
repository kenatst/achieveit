import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Target, Check, MessageCircle, Calendar } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";

export default function FocusScreen() {
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { plans, toggleWeeklyTask, logRoutine } = usePlans();

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    interface TodayTask {
        planId: string;
        planTitle: string;
        task: string;
        completed: boolean;
        weekIndex: number;
        taskIndex: number;
    }

    const todayTasks: TodayTask[] = [];

    plans.forEach((plan) => {
        const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
            const tasksDone = week.tasks.filter((_, ti) =>
                plan.progress.weeklyTasks[wi]?.[ti]
            ).length;
            return tasksDone < week.tasks.length;
        });

        if (currentWeekIndex !== -1) {
            const week = plan.content.weeklyPlans[currentWeekIndex];
            week.tasks.slice(0, 3).forEach((task, ti) => {
                todayTasks.push({
                    planId: plan.id,
                    planTitle: plan.content.title,
                    task,
                    completed: plan.progress.weeklyTasks[currentWeekIndex]?.[ti] || false,
                    weekIndex: currentWeekIndex,
                    taskIndex: ti,
                });
            });
        }
    });

    interface TodayRoutine {
        planId: string;
        routineName: string;
        completed: boolean;
        routineIndex: number;
    }

    const todayRoutines: TodayRoutine[] = [];

    plans.forEach((plan) => {
        plan.content.routines.forEach((routine, ri) => {
            const logged = plan.progress.routineHistory[ri]?.includes(todayStr);
            todayRoutines.push({
                planId: plan.id,
                routineName: routine.name,
                completed: logged,
                routineIndex: ri,
            });
        });
    });

    const totalTasks = todayTasks.length + todayRoutines.length;
    const completedTasks =
        todayTasks.filter((t) => t.completed).length +
        todayRoutines.filter((r) => r.completed).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Toggle task using PlansContext function
    const handleToggleTask = (task: TodayTask) => {
        toggleWeeklyTask(task.planId, task.weekIndex, task.taskIndex, task.task);
    };

    // Toggle routine using PlansContext function
    const handleToggleRoutine = (routine: TodayRoutine) => {
        logRoutine(routine.planId, routine.routineIndex, routine.routineName);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.dateLabel, { color: colors.inkMuted }]}>
                            {formattedDate.toUpperCase()}
                        </Text>
                        <Text style={[styles.title, { color: colors.ink }]}>
                            Today's Focus
                        </Text>
                    </View>

                    {/* Progress Ring */}
                    <View style={[styles.progressCard, { backgroundColor: colors.surface }, shadows.card]}>
                        <View style={[styles.progressRing, { borderColor: colors.rust }]}>
                            <View style={[styles.progressRingInner, { backgroundColor: colors.background }]}>
                                <Text style={[styles.progressPercent, { color: colors.ink }]}>
                                    {progressPercent}%
                                </Text>
                                <Text style={[styles.progressLabel, { color: colors.inkMuted }]}>
                                    complete
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.progressStats, { color: colors.inkMedium }]}>
                            {completedTasks} of {totalTasks} tasks done
                        </Text>
                    </View>

                    {/* Tasks Section */}
                    {todayTasks.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Target color={colors.rust} size={18} />
                                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                    Key Actions
                                </Text>
                            </View>
                            {todayTasks.map((item) => (
                                <Pressable
                                    key={`${item.planId}-${item.weekIndex}-${item.taskIndex}`}
                                    style={[styles.taskCard, { backgroundColor: colors.surface }, shadows.card]}
                                    onPress={() => handleToggleTask(item)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            { borderColor: colors.dividerStrong },
                                            item.completed && { backgroundColor: colors.sage, borderColor: colors.sage },
                                        ]}
                                    >
                                        {item.completed && <Check color="#FFF" size={14} strokeWidth={3} />}
                                    </View>
                                    <View style={styles.taskContent}>
                                        <Text
                                            style={[
                                                styles.taskText,
                                                { color: colors.ink },
                                                item.completed && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                            ]}
                                        >
                                            {item.task}
                                        </Text>
                                        <Text style={[styles.taskPlan, { color: colors.inkMuted }]}>
                                            {item.planTitle}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Routines Section */}
                    {todayRoutines.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Calendar color={colors.sage} size={18} />
                                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                    Daily Routines
                                </Text>
                            </View>
                            {todayRoutines.map((routine) => (
                                <Pressable
                                    key={`routine-${routine.planId}-${routine.routineIndex}`}
                                    style={[styles.taskCard, { backgroundColor: colors.surface }, shadows.card]}
                                    onPress={() => handleToggleRoutine(routine)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            { borderColor: colors.dividerStrong },
                                            routine.completed && { backgroundColor: colors.sage, borderColor: colors.sage },
                                        ]}
                                    >
                                        {routine.completed && <Check color="#FFF" size={14} strokeWidth={3} />}
                                    </View>
                                    <Text
                                        style={[
                                            styles.routineText,
                                            { color: colors.ink },
                                            routine.completed && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                        ]}
                                    >
                                        {routine.routineName}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Empty State */}
                    {totalTasks === 0 && (
                        <View style={[styles.emptyCard, { backgroundColor: colors.surface }, shadows.card]}>
                            <Target color={colors.inkMuted} size={40} strokeWidth={1.5} />
                            <Text style={[styles.emptyTitle, { color: colors.ink }]}>
                                No tasks for today
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: colors.inkMedium }]}>
                                Create a plan to get started with your goals
                            </Text>
                        </View>
                    )}

                    {/* Coach CTA - Removed, only accessible from plan detail */}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: { marginBottom: 24 },
    dateLabel: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    progressCard: {
        alignItems: "center",
        padding: 24,
        borderRadius: 16,
        marginBottom: 32,
    },
    progressRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    progressRingInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    progressPercent: { fontSize: 28, fontWeight: "700" },
    progressLabel: { fontSize: 12, marginTop: -2 },
    progressStats: { fontSize: 14, fontWeight: "500" },
    section: { marginBottom: 24 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: "600" },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        gap: 14,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    taskContent: { flex: 1 },
    taskText: { fontSize: 15, fontWeight: "500", lineHeight: 22 },
    taskPlan: { fontSize: 12, marginTop: 2 },
    routineText: { flex: 1, fontSize: 15, fontWeight: "500" },
    emptyCard: {
        alignItems: "center",
        padding: 40,
        borderRadius: 16,
        gap: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: "600" },
    emptySubtitle: { fontSize: 14, textAlign: "center" },
});
