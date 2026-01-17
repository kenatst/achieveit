import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Minus, Plus } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lightTap, mediumTap } from "@/utils/haptics";
import Typography from "@/constants/typography";

export default function OverviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { plans } = usePlans();

    const plan = plans.find(p => p.id === id);
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

    if (!plan) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Editorial Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={24} strokeWidth={2} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>CONFIDENTIAL BRIEFING</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Title Block */}
                    <View style={styles.titleBlock}>
                        <Text style={[styles.kicker, { color: colors.primary }]}>EXECUTIVE DIAGNOSIS</Text>
                        <Text style={[styles.mainTitle, { color: colors.ink }]}>Strategic Assessment</Text>
                        <Text style={[styles.date, { color: colors.inkMedium }]}>Prepared for User • Jan 17, 2026</Text>
                    </View>

                    {/* Continuous Text Document */}
                    <View style={[styles.document, { backgroundColor: colors.surface }]}>
                        {/* Current State */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionHeading, { color: colors.ink }]}>Current Position</Text>
                            <Text style={[styles.bodyText, { color: colors.ink }]}>
                                {plan.content.diagnosis.currentState}
                            </Text>
                        </View>

                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

                        {/* Gap Analysis */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionHeading, { color: colors.ink }]}>Gap Analysis</Text>
                            <Text style={[styles.bodyText, { color: colors.ink }]}>
                                {plan.content.diagnosis.gap}
                            </Text>
                        </View>

                        <View style={[styles.separator, { backgroundColor: colors.divider }]} />

                        {/* Success Factors - Bulleted List */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionHeading, { color: colors.ink }]}>Critical Success Factors</Text>
                            {plan.content.diagnosis.successFactors.map((factor, i) => (
                                <View key={i} style={styles.bulletItem}>
                                    <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                                    <Text style={[styles.bodyText, { color: colors.ink }]}>{factor}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Roadmap Section */}
                    <View style={styles.roadmapHeader}>
                        <Text style={[styles.kicker, { color: colors.primary, marginTop: 40 }]}>TACTICAL EXECUTION</Text>
                        <Text style={[styles.mainTitle, { color: colors.ink }]}>90-Day Roadmap</Text>
                    </View>

                    <View style={styles.timelineContainer}>
                        {/* Vertical Line */}
                        <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />

                        {plan.content.phases.map((phase, i) => {
                            const isExpanded = expandedPhase === i;
                            const isLast = i === plan.content.phases.length - 1;

                            return (
                                <View key={i} style={styles.timelineNode}>
                                    {/* Month/Phase Marker */}
                                    <View style={[styles.markerContainer, { backgroundColor: colors.background }]}>
                                        <View style={[
                                            styles.markerDot,
                                            {
                                                borderColor: isExpanded ? colors.primary : colors.inkFaint,
                                                backgroundColor: isExpanded ? colors.primary : colors.background
                                            }
                                        ]} />
                                    </View>

                                    {/* Content */}
                                    <Pressable
                                        style={[
                                            styles.phaseContent,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: isExpanded ? colors.primary : "transparent",
                                                borderWidth: 1
                                            }
                                        ]}
                                        onPress={() => { mediumTap(); setExpandedPhase(isExpanded ? null : i); }}
                                    >
                                        <View style={styles.phaseHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.phaseSup, { color: colors.inkFaint }]}>PHASE {i + 1} • {phase.duration}</Text>
                                                <Text style={[styles.phaseTitle, { color: colors.ink }]}>{phase.name}</Text>
                                            </View>
                                            {isExpanded ? <Minus size={20} color={colors.primary} /> : <Plus size={20} color={colors.inkFaint} />}
                                        </View>

                                        {isExpanded && (
                                            <MotiView
                                                from={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                transition={{ type: 'timing', duration: 300 }}
                                                style={styles.phaseDetail}
                                            >
                                                <Text style={[styles.phaseObjective, { color: colors.ink }]}>
                                                    <Text style={{ fontWeight: "600" }}>Objective:</Text> {phase.objective}
                                                </Text>

                                                <View style={[styles.phaseDivider, { backgroundColor: colors.divider }]} />

                                                {phase.keyActions.map((action, ai) => (
                                                    <View key={ai} style={styles.actionRow}>
                                                        <Text style={[styles.actionNum, { color: colors.primary }]}>{String(ai + 1).padStart(2, '0')}</Text>
                                                        <Text style={[styles.actionText, { color: colors.inkMedium }]}>{action}</Text>
                                                    </View>
                                                ))}
                                            </MotiView>
                                        )}
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 60 }} />
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
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 56,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    scroll: {
        paddingTop: 32,
    },
    titleBlock: {
        paddingHorizontal: 28,
        marginBottom: 24,
    },
    kicker: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    mainTitle: {
        fontSize: 32,
        lineHeight: 38,
        fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
        marginBottom: 8,
    },
    date: {
        fontSize: 13,
        fontWeight: "500",
    },
    document: {
        marginHorizontal: 24,
        paddingVertical: 32,
        paddingHorizontal: 24,
        // Paper effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    section: {
        marginBottom: 4,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    },
    bodyText: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: "400",
        letterSpacing: -0.2,
    },
    separator: {
        height: 1,
        width: "20%", // Editorial style short separator
        marginVertical: 24,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 10,
    },
    roadmapHeader: {
        paddingHorizontal: 28,
        marginTop: 16,
        marginBottom: 24,
    },
    timelineContainer: {
        paddingHorizontal: 24,
    },
    timelineLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 36, // Adjust based on alignment
        width: 1,
    },
    timelineNode: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    markerContainer: {
        width: 24,
        alignItems: 'center',
        paddingTop: 24, // Align with card center(ish)
        zIndex: 1,
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
    },
    phaseContent: {
        flex: 1,
        marginLeft: 24,
        padding: 20,
        paddingVertical: 24,
        borderRadius: 2, // Sharp corners for editorial look
        // Paper shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    phaseHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    phaseSup: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 6,
        textTransform: "uppercase",
    },
    phaseTitle: {
        fontSize: 18,
        fontWeight: "500",
        fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    },
    phaseDetail: {
        marginTop: 20,
    },
    phaseObjective: {
        fontSize: 15,
        lineHeight: 24,
        fontStyle: "italic",
    },
    phaseDivider: {
        height: 1,
        marginVertical: 16,
        opacity: 0.5,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    actionNum: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
    },
    actionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
    },
});
