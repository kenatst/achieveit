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
            {/* Timeline Line */}
            <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />

            {plan.content.phases.map((phase: any, index: number) => {
                const isExpanded = expandedPhase === index;

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
                                    <View style={styles.bullets}>
                                        {phase.keyActions.map((action: string, i: number) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <View style={[styles.bullet, { backgroundColor: colors.rust }]} />
                                                <Text style={[styles.bulletText, { color: colors.ink }]}>{action}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Risks */}
                                <View style={[styles.riskBlock, { backgroundColor: colors.backgroundDeep }]}>
                                    <View style={styles.sectionHeader}>
                                        <AlertTriangle size={14} color={colors.inkMuted} />
                                        <Text style={[styles.sectionTitle, { color: colors.inkMuted }]}>RISKS</Text>
                                    </View>
                                    <Text style={[styles.riskText, { color: colors.inkMedium }]}>
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
        paddingBottom: 80,
        paddingTop: 20,
    },
    timelineLine: {
        position: "absolute",
        left: 48,
        top: 0,
        bottom: 0,
        width: 2,
        opacity: 0.1, // Visible but faint
    },
    phaseContainer: {
        marginBottom: 24, // Increased spacing
    },
    phaseHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 24,
        borderRadius: 20,
    },
    headerLeft: {
        flex: 1,
    },
    phaseLabel: {
        ...Typography.sans.label,
        fontSize: 11,
        marginBottom: 6,
    },
    phaseTitle: {
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 26,
    },
    phaseContent: {
        backgroundColor: "rgba(0,0,0,0.02)",
        marginTop: -16,
        paddingTop: 32,
        padding: 24,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    sectionBlock: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        ...Typography.sans.label,
        fontSize: 12,
    },
    bullets: {
        gap: 12,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 9,
    },
    bulletText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
    },
    riskBlock: {
        padding: 20,
        borderRadius: 16,
    },
    riskText: {
        fontSize: 15,
        fontStyle: "italic",
        lineHeight: 22,
    },
});
