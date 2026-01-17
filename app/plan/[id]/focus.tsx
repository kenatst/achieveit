import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import { Flag, Trophy, Clock } from "lucide-react-native";

export default function PlanFocusScreen() {
    const { id } = useLocalSearchParams();
    const { plans } = usePlans();
    const { colors, shadows } = useTheme();

    const plan = plans.find((p) => p.id === id);
    if (!plan) return null;

    const currentWeek = plan.content.weeklyPlans[0]; // Assuming week 1 for now

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
                    <Text style={[styles.weekTitle, { color: colors.ink }]}>Week 1</Text>
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
                        {currentWeek.tasks.map((task: string, i: number) => (
                            <View key={i} style={[styles.taskItem, { borderLeftColor: colors.rust }]}>
                                <Text style={[styles.taskText, { color: colors.ink }]}>{task}</Text>
                            </View>
                        ))}
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
                    <Text style={[styles.statValue, { color: colors.ink }]}>0/4</Text>
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
        paddingBottom: 120,
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
        gap: 16,
    },
    taskItem: {
        paddingLeft: 16,
        borderLeftWidth: 3,
        paddingVertical: 2,
    },
    taskText: {
        fontSize: 16,
        lineHeight: 24,
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
