import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronDown, Target, AlertTriangle, Circle } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import { triggerSelection } from "@/utils/haptics";

export default function RoadmapView({ plan }: { plan: any }) {
    const { colors } = useTheme();
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

    const togglePhase = (index: number) => {
        triggerSelection();
        setExpandedPhase(expandedPhase === index ? null : index);
    };

    return (
        <View style={styles.container}>
            {/* Continuous Vertical Line */}
            <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />

            {plan.content.phases.map((phase: any, index: number) => {
                const isExpanded = expandedPhase === index;
                const isLast = index === plan.content.phases.length - 1;

                return (
                    <View key={index} style={styles.phaseContainer}>

                        {/* Interactive Node Area */}
                        <Pressable
                            style={styles.nodeRow}
                            onPress={() => togglePhase(index)}
                        >
                            {/* The Dot on the Line */}
                            <View style={[styles.nodeDotContainer, { backgroundColor: colors.background }]}>
                                <View style={[
                                    styles.nodeDot,
                                    {
                                        borderColor: isExpanded ? colors.rust : colors.inkMuted,
                                        backgroundColor: isExpanded ? colors.rust : colors.background
                                    }
                                ]}>
                                    <Text style={[styles.nodeNumber, { color: isExpanded ? "#FFF" : colors.inkMuted }]}>
                                        {index + 1}
                                    </Text>
                                </View>
                            </View>

                            {/* Minimalist Header */}
                            <View style={styles.headerContent}>
                                <Text style={[
                                    styles.phaseTitle,
                                    { color: isExpanded ? colors.rust : colors.ink }
                                ]}>
                                    {phase.name}
                                </Text>
                                <Text style={[styles.phaseDate, { color: colors.inkMuted }]}>
                                    Weeks {index * 4 + 1}-{index * 4 + 4}
                                </Text>
                            </View>

                            <MotiView animate={{ rotate: isExpanded ? "180deg" : "0deg" }}>
                                <ChevronDown color={colors.inkMuted} size={16} />
                            </MotiView>
                        </Pressable>

                        {/* Unfolding Content */}
                        <MotiView
                            from={{ opacity: 0, height: 0 }}
                            animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? "auto" : 0 }}
                            transition={{ type: "timing", duration: 300 }}
                            style={styles.detailsWrapper}
                        >
                            <View style={[styles.detailsCard, { borderLeftColor: colors.rust }]}>
                                {/* Key Actions */}
                                <View style={styles.sectionBlock}>
                                    <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>KEY ACTIONS</Text>
                                    <View style={styles.bulletList}>
                                        {phase.keyActions.map((action: string, i: number) => (
                                            <View key={i} style={styles.bulletItem}>
                                                <View style={[styles.bullet, { backgroundColor: colors.rust }]} />
                                                <Text style={[styles.bulletText, { color: colors.ink }]}>{action}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Risk Note */}
                                <View style={[styles.riskNote, { backgroundColor: colors.rustSoft }]}>
                                    <Text style={[styles.riskText, { color: colors.rust }]}>
                                        Focus on consistency. Avoid burnout.
                                    </Text>
                                </View>
                            </View>
                        </MotiView>

                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 80,
    },
    timelineLine: {
        position: "absolute",
        left: 43, // Properly aligned with dot center
        top: 32,
        bottom: 0,
        width: 1,
    },
    phaseContainer: {
        marginBottom: 32,
    },
    nodeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    nodeDotContainer: {
        width: 40,
        alignItems: "center",
        zIndex: 2, // Above line
        marginRight: 16,
    },
    nodeDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    nodeNumber: {
        fontSize: 12,
        fontWeight: "600",
    },
    headerContent: {
        flex: 1,
    },
    phaseTitle: {
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    phaseDate: {
        ...Typography.sans.caption,
        fontSize: 12,
    },
    // Details
    detailsWrapper: {
        paddingLeft: 56, // Indent to align with text start
    },
    detailsCard: {
        paddingLeft: 16,
        borderLeftWidth: 2, // Minimalist accent line instead of card
        paddingVertical: 8,
    },
    sectionBlock: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    bulletList: {
        gap: 8,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    bullet: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    riskNote: {
        padding: 12,
        borderRadius: 8,
    },
    riskText: {
        fontSize: 13,
        fontWeight: "500",
    }
});
