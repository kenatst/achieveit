import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Award } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";
import Tick from "./Tick";

interface WeeklySectionProps {
    plan: Plan;
    onToggleTask: (planId: string, weekIndex: number, taskIndex: number, task: string) => void;
    onToggleMilestone: (planId: string, weekIndex: number, milestone: string) => void;
}

export default function WeeklySection({ plan, onToggleTask, onToggleMilestone }: WeeklySectionProps) {
    const { colors, shadows } = useTheme();

    const weekProgress = (i: number) => {
        const tasks = plan.content.weeklyPlans[i].tasks;
        const done = tasks.filter((_, ti) => plan.progress.weeklyTasks[i]?.[ti]).length;
        return { done, total: tasks.length };
    };

    return (
        <View style={styles.sectionBody}>
            {plan.content.weeklyPlans.map((week, wi) => {
                const { done, total } = weekProgress(wi);
                const mileDone = plan.progress.weeklyMilestones[wi] || false;
                return (
                    <View
                        key={wi}
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface },
                            shadows.sm,
                        ]}
                    >
                        <View style={styles.weekHeader}>
                            <Text style={[styles.weekNum, { color: colors.rust }]}>Week {week.week}</Text>
                            <Text style={[styles.weekCount, { color: colors.inkMuted }]}>
                                {done}/{total}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.weekFocus,
                                { color: colors.ink, borderColor: colors.divider },
                            ]}
                        >
                            {week.focus}
                        </Text>
                        {week.tasks.map((task, ti) => {
                            const checked = plan.progress.weeklyTasks[wi]?.[ti] || false;
                            return (
                                <View key={ti} style={styles.itemRow}>
                                    <Tick
                                        on={checked}
                                        onPress={() => onToggleTask(plan.id, wi, ti, task)}
                                    />
                                    <Text
                                        style={[
                                            styles.itemText,
                                            { color: colors.ink },
                                            checked && { color: colors.inkFaint, textDecorationLine: "line-through" },
                                        ]}
                                    >
                                        {task}
                                    </Text>
                                </View>
                            );
                        })}
                        <Pressable
                            style={[
                                styles.milestone,
                                { borderColor: colors.divider },
                                mileDone && {}, // Logic was to remove this line if done, but style is just border top
                            ]}
                            onPress={() => onToggleMilestone(plan.id, wi, week.milestone)}
                        >
                            <Award
                                color={mileDone ? colors.sage : colors.inkFaint}
                                size={16}
                            />
                            <View style={styles.milestoneBody}>
                                <Text style={[styles.milestoneLabel, { color: colors.inkFaint }]}>Milestone</Text>
                                <Text
                                    style={[
                                        styles.milestoneText,
                                        { color: colors.ink },
                                        mileDone && { color: colors.sage },
                                    ]}
                                >
                                    {week.milestone}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionBody: { marginTop: 12, gap: 12 },
    card: {
        borderRadius: 14,
        padding: 18,
    },
    weekHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    weekNum: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    weekCount: { fontSize: 13, fontWeight: "500" },
    weekFocus: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: 0.5,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    milestone: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 0.5,
        gap: 12,
    },
    milestoneBody: { flex: 1 },
    milestoneLabel: {
        fontSize: 11,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    milestoneText: { fontSize: 15, lineHeight: 22 },
});
