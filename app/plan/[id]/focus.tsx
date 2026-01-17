import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import { Flag, Trophy, Clock, Check } from "lucide-react-native";
import { triggerSuccess } from "@/utils/haptics";

export default function PlanFocusScreen() {
    const { id } = useLocalSearchParams();
    const { plans, toggleWeeklyTask } = usePlans();
    const { colors, shadows } = useTheme();

    const plan = plans.find((p) => p.id === id);
    if (!plan) return null;

    const currentWeekIndex = 0; // Hardcoded to week 0 for now, logic can be dynamic later
    const currentWeek = plan.content.weeklyPlans[currentWeekIndex];

    // Calculate progress
    const weeklyTasksProgress = plan.progress.weeklyTasks[currentWeekIndex] || {};
    const totalTasks = currentWeek.tasks.length;
    const completedCount = Object.values(weeklyTasksProgress).filter(Boolean).length;

    const handleToggleTask = (taskIndex: number, task: string) => {
        triggerSuccess();
        toggleWeeklyTask(plan.id, currentWeekIndex, taskIndex, task);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Week Container */}
            <View style={[styles.mainCard, { backgroundColor: colors.surface }, shadows.card]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardLabel, { color: colors.rust }]}>CURRENT SPRINT</Text>
                    <Text style={[styles.weekTitle, { color: colors.ink }]}>Week {currentWeek.week}</Text>
                </View>

                <Text style={[styles.focusStatement, { color: colors.ink }]}>
                    "{currentWeek.focus}"
                </Text>

                <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                {/* Strategic Objectives */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Flag size={16} color={colors.inkMuted} />
                        <Text style={[styles.sectionTitle, { color: colors.inkMuted }]}>KEY DELIVERABLES</Text>
                    </View>

                    <View style={styles.taskList}>
                        {currentWeek.tasks.map((task: string, i: number) => {
                            const isCompleted = weeklyTasksProgress[i] || false;
                            return (
                                <Pressable
                                    key={i}
                                    style={[
                                        styles.taskItem,
                                        {
                                            backgroundColor: isCompleted ? colors.background : "transparent",
                                            borderColor: isCompleted ? "transparent" : colors.divider,
                                            opacity: isCompleted ? 0.6 : 1
                                        }
                                    ]}
                                    onPress={() => handleToggleTask(i, task)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        {
                                            borderColor: isCompleted ? colors.sage : colors.inkMuted,
                                            backgroundColor: isCompleted ? colors.sage : "transparent"
                                        }
                                    ]}>
                                        {isCompleted && <Check size={12} color="#FFF" strokeWidth={3} />}
                                    </View>
                                    <Text style={[
                                        styles.taskText,
                                        {
                                            color: colors.ink,
                                            textDecorationLine: isCompleted ? "line-through" : "none"
                                        }
                                    ]}>
                                        {task}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Milestone */}
                <View style={[styles.milestoneBlock, { backgroundColor: colors.success + '10' }]}>
                    <Trophy size={20} color={colors.success} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.milestoneLabel, { color: colors.success }]}>MILESTONE</Text>
                        <Text style={[styles.milestoneText, { color: colors.ink }]}>{currentWeek.milestone}</Text>
                    </View>
                </View>

            </View>

            {/* Time Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.surface }, shadows.card]}>
                    <Clock size={20} color={colors.inkMuted} />
                    <Text style={[styles.statValue, { color: colors.ink }]}>3d</Text>
                    <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Remaining</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surface }, shadows.card]}>
                    <Flag size={20} color={colors.inkMuted} />
                    <Text style={[styles.statValue, { color: colors.ink }]}>
                        {completedCount}/{totalTasks}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Completed</Text>
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 120,
        paddingHorizontal: 20,
        paddingBottom: 120, // Space for Bottom Bar
    },
    mainCard: {
        padding: 24,
        borderRadius: 32, // Very round
        marginBottom: 20,
    },
    cardHeader: {
        marginBottom: 16,
    },
    cardLabel: {
        ...Typography.sans.label,
        fontSize: 11,
        marginBottom: 4,
    },
    weekTitle: {
        ...Typography.display.h1,
        fontSize: 32,
    },
    focusStatement: {
        fontSize: 20,
        lineHeight: 30,
        fontWeight: '500',
        fontStyle: 'italic',
        marginBottom: 24,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        ...Typography.sans.label,
        fontSize: 12,
    },
    taskList: {
        gap: 12,
    },
    taskItem: {
        flexDirection: 'row', // Horizontal alignment for checkbox
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2, // Align with text top
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    milestoneBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 16,
    },
    milestoneLabel: {
        ...Typography.sans.label,
        fontSize: 10,
        marginBottom: 2,
    },
    milestoneText: {
        fontSize: 15,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    statLabel: {
        fontSize: 13,
    }
});
