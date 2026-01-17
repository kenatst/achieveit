import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Target, TrendingUp, Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, mediumTap } from "@/utils/haptics";

export default function OverviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, togglePhaseAction } = usePlans();

    const plan = plans.find(p => p.id === id);
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

    if (!plan) return null;

    const handleToggleAction = (phaseIndex: number, actionIndex: number, action: string) => {
        mediumTap();
        togglePhaseAction(plan.id, phaseIndex, actionIndex, action);
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
                        {t("planDetail.diagnosis")} & {t("planDetail.roadmap")}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Diagnosis Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIcon, { backgroundColor: colors.rustSoft }]}>
                                <Target color={colors.rust} size={18} />
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.ink }]}>
                                {t("planDetail.diagnosis")}
                            </Text>
                        </View>

                        <View style={styles.diagnosisItem}>
                            <Text style={[styles.diagnosisLabel, { color: colors.inkMuted }]}>
                                {t("planDetail.currentState")}
                            </Text>
                            <Text style={[styles.diagnosisText, { color: colors.ink }]}>
                                {plan.content.diagnosis.currentState}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                        <View style={styles.diagnosisItem}>
                            <Text style={[styles.diagnosisLabel, { color: colors.inkMuted }]}>
                                {t("planDetail.gap")}
                            </Text>
                            <Text style={[styles.diagnosisText, { color: colors.ink }]}>
                                {plan.content.diagnosis.gap}
                            </Text>
                        </View>

                        {plan.content.diagnosis.successFactors.length > 0 && (
                            <>
                                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                                <View style={styles.diagnosisItem}>
                                    <Text style={[styles.diagnosisLabel, { color: colors.inkMuted }]}>
                                        {t("planDetail.successFactors")}
                                    </Text>
                                    {plan.content.diagnosis.successFactors.map((factor, i) => (
                                        <Text key={i} style={[styles.diagnosisText, { color: colors.ink }]}>
                                            • {factor}
                                        </Text>
                                    ))}
                                </View>
                            </>
                        )}
                    </MotiView>

                    {/* Roadmap Phases */}
                    <View style={styles.sectionHeader}>
                        <TrendingUp color={colors.sage} size={18} />
                        <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                            {t("planDetail.roadmap")}
                        </Text>
                    </View>

                    {plan.content.phases.map((phase, pi) => {
                        const isExpanded = expandedPhase === pi;
                        const actionsCompleted = phase.keyActions.filter((_, ai) =>
                            plan.progress.phaseActions[pi]?.[ai]
                        ).length;
                        const progress = phase.keyActions.length > 0
                            ? Math.round((actionsCompleted / phase.keyActions.length) * 100)
                            : 0;

                        return (
                            <MotiView
                                key={pi}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 100 + pi * 50 }}
                            >
                                <Pressable
                                    style={[styles.phaseCard, { backgroundColor: colors.surface }, shadows.card]}
                                    onPress={() => {
                                        lightTap();
                                        setExpandedPhase(isExpanded ? null : pi);
                                    }}
                                >
                                    <View style={styles.phaseHeader}>
                                        <View style={[styles.phaseNumber, { backgroundColor: colors.sageSoft }]}>
                                            <Text style={[styles.phaseNumberText, { color: colors.sage }]}>
                                                {pi + 1}
                                            </Text>
                                        </View>
                                        <View style={styles.phaseInfo}>
                                            <Text style={[styles.phaseName, { color: colors.ink }]}>
                                                {phase.name}
                                            </Text>
                                            <Text style={[styles.phaseDuration, { color: colors.inkMuted }]}>
                                                {phase.duration} • {progress}% {t("common.complete")}
                                            </Text>
                                        </View>
                                        {isExpanded ? (
                                            <ChevronUp color={colors.inkFaint} size={20} />
                                        ) : (
                                            <ChevronDown color={colors.inkFaint} size={20} />
                                        )}
                                    </View>

                                    {isExpanded && (
                                        <MotiView
                                            from={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            style={styles.phaseContent}
                                        >
                                            <Text style={[styles.phaseObjective, { color: colors.inkMedium }]}>
                                                {phase.objective}
                                            </Text>

                                            <View style={[styles.actionsDivider, { backgroundColor: colors.divider }]} />

                                            {phase.keyActions.map((action, ai) => {
                                                const isDone = plan.progress.phaseActions[pi]?.[ai];
                                                return (
                                                    <Pressable
                                                        key={ai}
                                                        style={styles.actionRow}
                                                        onPress={() => handleToggleAction(pi, ai, action)}
                                                    >
                                                        <View style={[
                                                            styles.actionCheck,
                                                            { borderColor: colors.dividerStrong },
                                                            isDone && { backgroundColor: colors.sage, borderColor: colors.sage },
                                                        ]}>
                                                            {isDone && <Check color="#FFF" size={12} strokeWidth={3} />}
                                                        </View>
                                                        <Text style={[
                                                            styles.actionText,
                                                            { color: colors.ink },
                                                            isDone && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                                        ]}>
                                                            {action}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
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
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    cardIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    diagnosisItem: {
        gap: 6,
    },
    diagnosisLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    diagnosisText: {
        fontSize: 15,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    phaseCard: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
    },
    phaseHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    phaseNumber: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    phaseNumberText: {
        fontSize: 14,
        fontWeight: "700",
    },
    phaseInfo: {
        flex: 1,
    },
    phaseName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    phaseDuration: {
        fontSize: 13,
    },
    phaseContent: {
        marginTop: 16,
    },
    phaseObjective: {
        fontSize: 14,
        lineHeight: 21,
    },
    actionsDivider: {
        height: 1,
        marginVertical: 14,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    actionCheck: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    actionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
    },
});
