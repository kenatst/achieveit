import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, AlertTriangle, Award, BarChart3, Check, Lightbulb } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, mediumTap, successNotification } from "@/utils/haptics";

export default function GoalsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, toggleCheckpoint, toggleSuccessMetric } = usePlans();

    const plan = plans.find(p => p.id === id);

    if (!plan) return null;

    const handleToggleCheckpoint = (day: "day30" | "day60" | "day90", index: number, item: string) => {
        mediumTap();
        toggleCheckpoint(plan.id, day, index, item);
    };

    const handleToggleMetric = (index: number, metric: string) => {
        const willBeComplete = !plan.progress.successMetrics[index];
        if (willBeComplete) {
            successNotification();
        } else {
            mediumTap();
        }
        toggleSuccessMetric(plan.id, index, metric);
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
                        {t("planDetail.checkpoints")} & {t("planDetail.successMetrics")}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Obstacles Section */}
                    <View style={styles.sectionHeader}>
                        <AlertTriangle color={colors.rust} size={18} />
                        <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                            {t("planDetail.obstacles")}
                        </Text>
                    </View>

                    {plan.content.obstacles.map((obstacle, oi) => (
                        <MotiView
                            key={oi}
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: oi * 50 }}
                            style={[styles.obstacleCard, { backgroundColor: colors.surface }, shadows.card]}
                        >
                            <View style={styles.obstacleChallenge}>
                                <AlertTriangle color={colors.rust} size={16} />
                                <Text style={[styles.obstacleChallengeText, { color: colors.ink }]}>
                                    {obstacle.challenge}
                                </Text>
                            </View>
                            <View style={styles.obstacleSolution}>
                                <Lightbulb color={colors.sage} size={16} />
                                <Text style={[styles.obstacleSolutionText, { color: colors.inkMedium }]}>
                                    {obstacle.solution}
                                </Text>
                            </View>
                        </MotiView>
                    ))}

                    {/* Checkpoints Section */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <Award color="#F59E0B" size={18} />
                        <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                            {t("planDetail.checkpoints")}
                        </Text>
                    </View>

                    {(["day30", "day60", "day90"] as const).map((dayKey) => {
                        const day = parseInt(dayKey.replace("day", "")) as 30 | 60 | 90;
                        return (
                            <MotiView
                                key={dayKey}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 150 + (day / 30) * 50 }}
                                style={[styles.checkpointCard, { backgroundColor: colors.surface }, shadows.card]}
                            >
                                <View style={[styles.checkpointHeader, { backgroundColor: "#FEF3C7" }]}>
                                    <Text style={[styles.checkpointDay, { color: "#92400E" }]}>
                                        {t("common.day")} {day}
                                    </Text>
                                </View>
                                <View style={styles.checkpointItems}>
                                    {plan.content.checkpoints[dayKey].map((item, i) => {
                                        const isDone = plan.progress.checkpoints[dayKey]?.[i];
                                        return (
                                            <Pressable
                                                key={i}
                                                style={styles.checkpointRow}
                                                onPress={() => handleToggleCheckpoint(dayKey, i, item)}
                                            >
                                                <View style={[
                                                    styles.checkpointCheck,
                                                    { borderColor: colors.dividerStrong },
                                                    isDone && { backgroundColor: colors.sage, borderColor: colors.sage },
                                                ]}>
                                                    {isDone && <Check color="#FFF" size={12} strokeWidth={3} />}
                                                </View>
                                                <Text style={[
                                                    styles.checkpointText,
                                                    { color: colors.ink },
                                                    isDone && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                                ]}>
                                                    {item}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </MotiView>
                        );
                    })}

                    {/* Success Metrics Section */}
                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                        <BarChart3 color={colors.sage} size={18} />
                        <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                            {t("planDetail.successMetrics")}
                        </Text>
                    </View>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={[styles.metricsCard, { backgroundColor: colors.surface }, shadows.card]}
                    >
                        {plan.content.successMetrics.map((metric, mi) => {
                            const isDone = plan.progress.successMetrics[mi];
                            return (
                                <Pressable
                                    key={mi}
                                    style={[
                                        styles.metricRow,
                                        mi < plan.content.successMetrics.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.divider,
                                        },
                                    ]}
                                    onPress={() => handleToggleMetric(mi, metric)}
                                >
                                    <View style={[
                                        styles.metricCheck,
                                        { borderColor: colors.dividerStrong },
                                        isDone && { backgroundColor: colors.sage, borderColor: colors.sage },
                                    ]}>
                                        {isDone && <Check color="#FFF" size={14} strokeWidth={3} />}
                                    </View>
                                    <Text style={[
                                        styles.metricText,
                                        { color: colors.ink },
                                        isDone && { color: colors.inkMuted, textDecorationLine: "line-through" },
                                    ]}>
                                        {metric}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </MotiView>

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
    obstacleCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 12,
    },
    obstacleChallenge: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    obstacleChallengeText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 22,
    },
    obstacleSolution: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingLeft: 26,
    },
    obstacleSolutionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
    },
    checkpointCard: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
    },
    checkpointHeader: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    checkpointDay: {
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    checkpointItems: {
        padding: 16,
        gap: 12,
    },
    checkpointRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    checkpointCheck: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    checkpointText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
    },
    metricsCard: {
        borderRadius: 16,
        overflow: "hidden",
    },
    metricRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
    },
    metricCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    metricText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
});
