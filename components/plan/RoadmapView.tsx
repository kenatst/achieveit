import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronDown, Target, AlertTriangle } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import { triggerSelection } from "@/utils/haptics";

export default function RoadmapView({ plan }: { plan: any }) {
    const { colors, shadows } = useTheme();
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

    const togglePhase = (index: number) => {
        triggerSelection();
        setExpandedPhase(expandedPhase === index ? null : index);
    };

    return (
        <View style={styles.container}>
            {/* Timeline Line (Visual) */}
            <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />

            {plan.content.phases.map((phase: any, index: number) => {
                const isExpanded = expandedPhase === index;
                const isCompleted = false; // Logic for phase completion could go here

                return (
                    <View key={index} style={styles.phaseContainer}>
                        {/* Phase Node */}
                        <Pressable
                            style={[
                                styles.phaseHeader,
                                { backgroundColor: colors.surface },
                                shadows.card,
                                isExpanded && { borderColor: colors.rust, borderWidth: 1 }
                            ]}
                            onPress={() => togglePhase(index)}
                        >
                            <View style={styles.headerLeft}>
                                <Text style={[styles.phaseLabel, { color: colors.rust }]}>PHASE {index + 1}</Text>
                                <Text style={[styles.phaseTitle, { color: colors.ink }]}>{phase.name}</Text>
                            </View>
                            <MotiView animate={{ rotate: isExpanded ? "180deg" : "0deg" }}>
                                <ChevronDown color={colors.inkMuted} size={20} />
                            </MotiView>
                        </Pressable>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <MotiView
                                from={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                style={styles.phaseContent}
                            >
                                {/* Key Actions */}
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionHeader}>
                                        <Target size={14} color={colors.inkMuted} />
                                        <Text style={[styles.sectionTitle, { color: colors.inkMuted }]}>KEY ACTIONS</Text>
                                    </View>
                                    {phase.keyActions.map((action: string, i: number) => (
                                        <View key={i} style={styles.bulletItem}>
                                            <View style={[styles.bullet, { backgroundColor: colors.rust }]} />
                                            <Text style={[styles.bulletText, { color: colors.ink }]}>{action}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Obstacles (if any match this phase/general) */}
                                <View style={[styles.obstacleBlock, { backgroundColor: colors.backgroundDeep }]}>
                                    <View style={styles.sectionHeader}>
                                        <AlertTriangle size={14} color={colors.negative} />
                                        <Text style={[styles.sectionTitle, { color: colors.negative }]}>POTENTIAL RISKS</Text>
                                    </View>
                                    <Text style={[styles.obstacleText, { color: colors.inkMedium }]}>
                                        Watch out for burnout during this intensive phase. Keep routines steady.
                                    </Text>
                                </View>

                            </MotiView>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 60,
        position: "relative",
    },
    timelineLine: {
        position: "absolute",
        left: 48, // Aligned with nodes ideally, needs adjustment based on design
        top: 0,
        bottom: 0,
        width: 2,
        opacity: 0, // Hidden for now, can be enabled for strict timeline look
    },
    phaseContainer: {
        marginBottom: 20,
    },
    phaseHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderRadius: 16,
    },
    headerLeft: {
        flex: 1,
    },
    phaseLabel: {
        ...Typography.sans.label,
        fontSize: 10,
        marginBottom: 4,
    },
    phaseTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    phaseContent: {
        backgroundColor: "rgba(0,0,0,0.02)",
        marginTop: -10,
        paddingTop: 26,
        padding: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    sectionBlock: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    sectionTitle: {
        ...Typography.sans.label,
        fontSize: 11,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    obstacleBlock: {
        padding: 16,
        borderRadius: 12,
    },
    obstacleText: {
        fontSize: 14,
        fontStyle: "italic",
    },
});
