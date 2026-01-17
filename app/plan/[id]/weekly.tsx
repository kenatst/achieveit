import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, Check, ChevronDown, ChevronUp, Flag } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, mediumTap, successNotification } from "@/utils/haptics";

export default function WeeklyScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, toggleWeeklyTask, toggleWeeklyMilestone } = usePlans();

    const plan = plans.find(p => p.id === id);

    // Auto-expand current week
    const findCurrentWeek = () => {
        if (!plan) return 0;
        const idx = plan.content.weeklyPlans.findIndex((week, wi) => {
            const tasksDone = week.tasks.filter((_, ti) =>
                plan.progress.weeklyTasks[wi]?.[ti]
            ).length;
            return tasksDone < week.tasks.length;
        });
        return idx !== -1 ? idx : 0;
    };

    const [expandedWeek, setExpandedWeek] = useState<number | null>(findCurrentWeek());

    if (!plan) return null;

    const handleToggleTask = (weekIndex: number, taskIndex: number, task: string) => {
        mediumTap();
        toggleWeeklyTask(plan.id, weekIndex, taskIndex, task);

        // Check if week completed
        const week = plan.content.weeklyPlans[weekIndex];
        const willBeComplete = week.tasks.every((_, ti) =>
            ti === taskIndex || plan.progress.weeklyTasks[weekIndex]?.[ti]
        );
        if (willBeComplete && !plan.progress.weeklyTasks[weekIndex]?.[taskIndex]) {
            setTimeout(() => successNotification(), 300);
        }
    };

    const handleToggleMilestone = (weekIndex: number) => {
        successNotification();
        toggleWeeklyMilestone(plan.id, weekIndex, plan.content.weeklyPlans[weekIndex].milestone);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>
                        {t("planDetail.weeklyPlans")}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {plan.content.weeklyPlans.map((week, wi) => {
                        const isExpanded = expandedWeek === wi;
                        const tasksCompleted = week.tasks.filter((_, ti) =>
                            plan.progress.weeklyTasks[wi]?.[ti]
                        ).length;
                        const progress = week.tasks.length > 0
                            ? Math.round((tasksCompleted / week.tasks.length) * 100)
                            : 0;
                        const isCurrent = wi === findCurrentWeek();
                        const milestoneCompleted = plan.progress.weeklyMilestones[wi];

                        return (
                            <MotiView
                                key={wi}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: wi * 50 }}
                            >
                                <Pressable
                                    style={[
                                        styles.weekCard,
                                        { backgroundColor: colors.surface },
                                        shadows.card,
                                        isCurrent && { borderWidth: 2, borderColor: colors.rust },
                                    ]}
                                    onPress={() => {
                                        lightTap();
                                        setExpandedWeek(isExpanded ? null : wi);
                                    }}
                                >
                                    <View style={styles.weekHeader}>
                                        <View style={[
                                            styles.weekNumber,
                                            { backgroundColor: isCurrent ? colors.rust : colors.sageSoft },
                                        ]}>
                                            <Text style={[
                                                styles.weekNumberText,
                                                { color: isCurrent ? "#FFF" : colors.sage },
                                            ]}>
                                                {week.week}
                                            </Text>
                                        </View>
                                        <View style={styles.weekInfo}>
                                            <Text style={[styles.weekFocus, { color: colors.ink }]}>
                                                {week.focus}
                                            </Text>
                                            <View style={styles.weekProgress}>
                                                <View style={[styles.weekProgressBar, { backgroundColor: colors.divider }]}>
                                                    <View style={[
                                                        styles.weekProgressFill,
                                                        { backgroundColor: colors.sage, width: `${progress}%` }
                                                    ]} />
                                                </View>
                                                <Text style={[styles.weekProgressText, { color: colors.inkMuted }]}>
                                                    {tasksCompleted}/{week.tasks.length}
                                                </Text>
                                            </View>
                                        </View>
                                        {isExpanded ? (
                                            <ChevronUp color={colors.inkFaint} size={20} />
                                        ) : (
                                            <ChevronDown color={colors.inkFaint} size={20} />
                                        )}
                                    </View>

                                    {isExpanded && (
                                        <MotiView
                                            from={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={styles.weekContent}
                                        >
                                            <View style={[styles.tasksDivider, { backgroundColor: colors.divider }]} />

                                            {week.tasks.map((task, ti) => {
                                                const isDone = plan.progress.weeklyTasks[wi]?.[ti];
                                                return (
                                                    <Pressable
                                                        key={ti}
                                                        style={styles.taskRow}
                                                        onPress={() => handleToggleTask(wi, ti, task)}
                                                    >
                                                        <View style={[
                                                            styles.taskCheck,
                                                            { borderColor: colors.dividerStrong },
                                                            isDone && { backgroundColor: colors.sage, borderColor: colors.sage },
                                                        ]}>
                                                            {isDone && <Check color="#FFF" size={12} strokeWidth={3} />}
                                                        </View>
                                                        <Text style={[
                                                            styles.taskText,
                                                            { color: colors.ink },
                                                            isDone && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                                        ]}>
                                                            {task}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}

                                            {/* Milestone */}
                                            <Pressable
                                                style={[
                                                    styles.milestone,
                                                    { backgroundColor: colors.rustSoft },
                                                    milestoneCompleted && { backgroundColor: colors.sageSoft },
                                                ]}
                                                onPress={() => handleToggleMilestone(wi)}
                                            >
                                                <Flag
                                                    color={milestoneCompleted ? colors.sage : colors.rust}
                                                    size={16}
                                                />
                                                <Text style={[
                                                    styles.milestoneText,
                                                    { color: milestoneCompleted ? colors.sage : colors.rust },
                                                ]}>
                                                    {t("planDetail.milestone")}: {week.milestone}
                                                </Text>
                                                {milestoneCompleted && (
                                                    <Check color={colors.sage} size={16} strokeWidth={3} />
                                                )}
                                            </Pressable>
                                        </MotiView>
                                    )}
                                </Pressable>
                            </MotiView>
                        );
                    })}

                    <View style={{ height: 32 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "600",
        textAlign: "center",
    },
    scroll: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    weekCard: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
    },
    weekHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    weekNumber: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    weekNumberText: {
        fontSize: 14,
        fontWeight: "700",
    },
    weekInfo: {
        flex: 1,
    },
    weekFocus: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },
    weekProgress: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    weekProgressBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
    },
    weekProgressFill: {
        height: "100%",
        borderRadius: 2,
    },
    weekProgressText: {
        fontSize: 13,
        fontWeight: "500",
        minWidth: 30,
    },
    weekContent: {
        marginTop: 4,
    },
    tasksDivider: {
        height: 1,
        marginVertical: 14,
    },
    taskRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    taskCheck: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    taskText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
    },
    milestone: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    milestoneText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
    },
});
