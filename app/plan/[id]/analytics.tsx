import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, Award, BarChart3, Target } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { triggerMedium } from "@/utils/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AnalyticsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, toggleCheckpoint, toggleSuccessMetric } = usePlans();

    const plan = plans.find((p) => p.id === id);

    if (!plan) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.notFound}>
                        <Text style={[styles.notFoundText, { color: colors.ink }]}>Plan not found</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // Progress data for mini chart
    const progress = plan.progress.overallProgress;
    const phaseProgress = plan.content.phases.map((phase, pi) => {
        const total = phase.keyActions.length;
        const done = phase.keyActions.filter((_, ai) => plan.progress.phaseActions[pi]?.[ai]).length;
        return total > 0 ? Math.round((done / total) * 100) : 0;
    });

    const checkpointDays = ["day30", "day60", "day90"] as const;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>Analytics</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Progress Overview */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={[styles.overviewCard, { backgroundColor: colors.surface }, shadows.card]}
                    >
                        <View style={styles.overviewHeader}>
                            <BarChart3 color={colors.rust} size={20} />
                            <Text style={[styles.overviewTitle, { color: colors.ink }]}>
                                {t("common.progress")}
                            </Text>
                        </View>

                        {/* Phase Progress Bars */}
                        <View style={styles.phaseChart}>
                            {plan.content.phases.map((phase, i) => (
                                <View key={i} style={styles.phaseRow}>
                                    <Text style={[styles.phaseName, { color: colors.inkMedium }]} numberOfLines={1}>
                                        {phase.name}
                                    </Text>
                                    <View style={[styles.phaseBar, { backgroundColor: colors.divider }]}>
                                        <MotiView
                                            from={{ width: 0 }}
                                            animate={{ width: `${phaseProgress[i]}%` }}
                                            transition={{ type: "timing", duration: 800, delay: i * 100 }}
                                            style={[styles.phaseBarFill, { backgroundColor: colors.rust }]}
                                        />
                                    </View>
                                    <Text style={[styles.phasePercent, { color: colors.inkMuted }]}>
                                        {phaseProgress[i]}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </MotiView>

                    {/* Checkpoints */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 100 }}
                        style={styles.sectionBlock}
                    >
                        <View style={styles.sectionHeader}>
                            <Award color={colors.sage} size={18} />
                            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                {t("planDetail.checkpoints")}
                            </Text>
                        </View>

                        {checkpointDays.map((day, di) => {
                            const items = plan.content.checkpoints[day];
                            const label = day === "day30" ? "Day 30" : day === "day60" ? "Day 60" : "Day 90";

                            return (
                                <View key={day} style={[styles.checkpointCard, { backgroundColor: colors.surface }, shadows.card]}>
                                    <Text style={[styles.checkpointLabel, { color: colors.rust }]}>{label}</Text>
                                    {items.map((item, ii) => {
                                        const isChecked = plan.progress.checkpoints[day]?.[ii] || false;

                                        return (
                                            <Pressable
                                                key={ii}
                                                style={styles.checkpointItem}
                                                onPress={() => {
                                                    triggerMedium();
                                                    toggleCheckpoint(plan.id, day, ii, item);
                                                }}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        { borderColor: colors.dividerStrong },
                                                        isChecked && { backgroundColor: colors.sage, borderColor: colors.sage },
                                                    ]}
                                                >
                                                    {isChecked && <Check color="#FFF" size={12} strokeWidth={3} />}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.checkpointText,
                                                        { color: colors.ink },
                                                        isChecked && { textDecorationLine: "line-through", color: colors.inkMuted },
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </MotiView>

                    {/* Success Metrics */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200 }}
                        style={styles.sectionBlock}
                    >
                        <View style={styles.sectionHeader}>
                            <Target color={colors.ink} size={18} />
                            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                {t("planDetail.successMetrics")}
                            </Text>
                        </View>

                        <View style={[styles.metricsCard, { backgroundColor: colors.surface }, shadows.card]}>
                            {plan.content.successMetrics.map((metric, mi) => {
                                const isChecked = plan.progress.successMetrics[mi] || false;

                                return (
                                    <Pressable
                                        key={mi}
                                        style={[styles.metricItem, mi < plan.content.successMetrics.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 0.5 }]}
                                        onPress={() => {
                                            triggerMedium();
                                            toggleSuccessMetric(plan.id, mi, metric);
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                { borderColor: colors.dividerStrong },
                                                isChecked && { backgroundColor: colors.rust, borderColor: colors.rust },
                                            ]}
                                        >
                                            {isChecked && <Check color="#FFF" size={12} strokeWidth={3} />}
                                        </View>
                                        <Text
                                            style={[
                                                styles.metricText,
                                                { color: colors.ink },
                                                isChecked && { textDecorationLine: "line-through", color: colors.inkMuted },
                                            ]}
                                        >
                                            {metric}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </MotiView>

                    <View style={{ height: 40 }} />
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
    headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
    scroll: { paddingHorizontal: 24, paddingTop: 24 },
    // Overview
    overviewCard: { padding: 20, borderRadius: 16, marginBottom: 28 },
    overviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
    overviewTitle: { fontSize: 16, fontWeight: "600" },
    phaseChart: { gap: 14 },
    phaseRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    phaseName: { width: 80, fontSize: 12 },
    phaseBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
    phaseBarFill: { height: "100%", borderRadius: 3 },
    phasePercent: { width: 36, fontSize: 12, textAlign: "right" },
    // Section
    sectionBlock: { marginBottom: 28 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "600" },
    // Checkpoint
    checkpointCard: { padding: 16, borderRadius: 14, marginBottom: 12 },
    checkpointLabel: { fontSize: 13, fontWeight: "600", marginBottom: 12 },
    checkpointItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
    checkpointText: { flex: 1, fontSize: 14, lineHeight: 20 },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    // Metrics
    metricsCard: { borderRadius: 14, overflow: "hidden" },
    metricItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    metricText: { flex: 1, fontSize: 14, lineHeight: 20 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16 },
});
