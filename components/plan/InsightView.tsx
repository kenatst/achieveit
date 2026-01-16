import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart3, Award } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";

export default function InsightView({ plan }: { plan: any }) {
    const { colors, shadows } = useTheme();

    return (
        <View style={styles.container}>
            {/* Stats Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
                <View style={styles.cardHeader}>
                    <BarChart3 size={20} color={colors.rust} />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>Completion Velocity</Text>
                </View>
                <View style={styles.statRow}>
                    <View>
                        <Text style={[styles.statValue, { color: colors.ink }]}>12</Text>
                        <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Days Active</Text>
                    </View>
                    <View style={[styles.vertDivider, { backgroundColor: colors.divider }]} />
                    <View>
                        <Text style={[styles.statValue, { color: colors.ink }]}>84%</Text>
                        <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Consistency</Text>
                    </View>
                </View>
            </View>

            {/* Checkpoints */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.inkMuted }]}>MILESTONES</Text>

                {["Day 30", "Day 60", "Day 90"].map((day, i) => (
                    <View key={i} style={[styles.milestoneRow, { borderBottomColor: colors.divider }]}>
                        <View style={[styles.iconCircle, { backgroundColor: i === 0 ? colors.sageSoft : colors.divider }]}>
                            <Award size={16} color={i === 0 ? colors.sage : colors.inkMuted} />
                        </View>
                        <View style={styles.milestoneContent}>
                            <Text style={[styles.milestoneTitle, { color: colors.ink }]}>
                                {day} Checkpoint
                            </Text>
                            <Text style={[styles.milestoneStatus, { color: colors.inkMuted }]}>
                                {i === 0 ? "In Progress" : "Locked"}
                            </Text>
                        </View>
                        <Text style={[styles.dateText, { color: colors.inkMuted }]}>
                            {i === 0 ? "Due Oct 24" : "—"}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    card: {
        padding: 28, // Louder padding
        borderRadius: 24,
        marginBottom: 40,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statValue: {
        ...Typography.display.h1,
        textAlign: "center",
        fontSize: 40, // Bigger
    },
    statLabel: {
        ...Typography.sans.caption,
        textAlign: "center",
        marginTop: 8,
        fontSize: 12,
    },
    vertDivider: {
        width: 1,
        height: "80%",
        alignSelf: "center",
    },
    section: {
        marginTop: 0,
    },
    sectionTitle: {
        ...Typography.sans.label,
        marginBottom: 20,
    },
    milestoneRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20, // More breathing room
        borderBottomWidth: 1,
        gap: 20,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    milestoneContent: {
        flex: 1,
    },
    milestoneTitle: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 4,
    },
    milestoneStatus: {
        fontSize: 14,
    },
    dateText: {
        fontSize: 14,
        fontVariant: ["tabular-nums"],
    },
});
