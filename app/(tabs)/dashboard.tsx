import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { ActivityLogEntry } from "@/types/plan";

export default function DashboardScreen() {
    const { plans } = usePlans();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.progress.overallProgress < 100).length;
    const completedPlans = plans.filter(p => p.progress.overallProgress === 100).length;

    let totalDone = 0;
    let totalItems = 0;
    plans.forEach(plan => {
        plan.content.phases.forEach((phase, pi) => {
            phase.keyActions.forEach((_, ai) => {
                totalItems++;
                if (plan.progress.phaseActions[pi]?.[ai]) totalDone++;
            });
        });
        plan.content.weeklyPlans.forEach((week, wi) => {
            week.tasks.forEach((_, ti) => {
                totalItems++;
                if (plan.progress.weeklyTasks[wi]?.[ti]) totalDone++;
            });
        });
    });
    const overall = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

    // Recent activity
    const allActivity: (ActivityLogEntry & { planId: string; planTitle: string })[] = [];
    plans.forEach(plan => {
        plan.progress.activityLog.forEach(entry => {
            allActivity.push({ ...entry, planId: plan.id, planTitle: plan.content.title });
        });
    });
    allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = allActivity.slice(0, 6);

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return t("common.today");
        if (mins < 60) return `${mins}m`;
        if (hrs < 24) return `${hrs}h`;
        return `${days}d`;
    };

    if (totalPlans === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.ink }]}>{t("dashboard.title")}</Text>
                    </View>
                    <View style={styles.empty}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundDeep }]}>
                            <TrendingUp color={colors.inkFaint} size={32} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.ink }]}>{t("dashboard.noActivity")}</Text>
                        <Text style={[styles.emptyBody, { color: colors.inkMedium }]}>
                            {t("plans.noPlanSubtitle")}
                        </Text>
                        <Pressable style={[styles.emptyBtn, { backgroundColor: colors.rust }]} onPress={() => router.push("/(tabs)")}>
                            <Text style={styles.emptyBtnText}>{t("plans.createNew")}</Text>
                            <ArrowUpRight color="#FFFFFF" size={18} />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.ink }]}>{t("dashboard.title")}</Text>
                    </View>

                    {/* Big stat */}
                    <View style={[styles.heroCard, { backgroundColor: colors.surface }, shadows.md]}>
                        <Text style={[styles.heroNumber, { color: colors.rust }]}>{overall}</Text>
                        <Text style={[styles.heroPercent, { color: colors.rust }]}>%</Text>
                        <Text style={[styles.heroLabel, { color: colors.inkMuted }]}>{t("dashboard.overallProgress")}</Text>
                    </View>

                    {/* Stats row */}
                    <View style={[styles.statsRow, { backgroundColor: colors.surface }, shadows.sm]}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.ink }]}>{totalDone}</Text>
                            <Text style={[styles.statLabel, { color: colors.inkMuted }]}>{t("dashboard.completedTasks")}</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.ink }]}>{activePlans}</Text>
                            <Text style={[styles.statLabel, { color: colors.inkMuted }]}>{t("dashboard.activePlans")}</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.ink }]}>{completedPlans}</Text>
                            <Text style={[styles.statLabel, { color: colors.inkMuted }]}>{t("common.done")}</Text>
                        </View>
                    </View>

                    {/* Plans */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>{t("plans.title")}</Text>
                        {plans.map(plan => (
                            <Pressable
                                key={plan.id}
                                style={({ pressed }) => [styles.planRow, { borderBottomColor: colors.divider }, pressed && { backgroundColor: colors.surfacePressed }]}
                                onPress={() => router.push(`/plan/${plan.id}` as any)}
                            >
                                <View style={styles.planInfo}>
                                    <Text style={[styles.planTitle, { color: colors.ink }]} numberOfLines={1}>{plan.content.title}</Text>
                                    <View style={[styles.planProgressBar, { backgroundColor: colors.divider }]}>
                                        <View style={[styles.planProgressFill, { backgroundColor: colors.sage, width: `${plan.progress.overallProgress}%` }]} />
                                    </View>
                                </View>
                                <Text style={[styles.planPercent, { color: colors.sage }]}>{plan.progress.overallProgress}%</Text>
                                <ChevronRight color={colors.inkFaint} size={18} />
                            </Pressable>
                        ))}
                    </View>

                    {/* Activity */}
                    {recentActivity.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>{t("dashboard.recentActivity")}</Text>
                            {recentActivity.map((a, i) => (
                                <View key={a.id} style={[styles.activityRow, { borderBottomColor: colors.divider }, i === recentActivity.length - 1 && styles.activityRowLast]}>
                                    <View style={[styles.activityDot, { backgroundColor: colors.rust }]} />
                                    <Text style={[styles.activityText, { color: colors.ink }]} numberOfLines={1}>{a.description}</Text>
                                    <Text style={[styles.activityTime, { color: colors.inkFaint }]}>{timeAgo(a.timestamp)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 32 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: { paddingHorizontal: 24 },
    header: { paddingTop: 24, paddingBottom: 16 },
    title: {
        fontSize: 34,
        fontWeight: "700",
        letterSpacing: -0.6,
    },
    heroCard: {
        borderRadius: 20,
        paddingVertical: 32,
        alignItems: "center",
        marginBottom: 24,
    },
    heroNumber: {
        fontSize: 72,
        fontWeight: "200",
        letterSpacing: -4,
        lineHeight: 76,
    },
    heroPercent: {
        fontSize: 24,
        fontWeight: "300",
        marginTop: -4,
    },
    heroLabel: {
        fontSize: 14,
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: "row",
        borderRadius: 16,
        paddingVertical: 20,
        marginBottom: 32,
    },
    stat: { flex: 1, alignItems: "center" },
    statValue: {
        fontSize: 26,
        fontWeight: "600",
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        marginVertical: 4,
    },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
    },
    planRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 0.5,
    },
    planInfo: { flex: 1, marginRight: 16 },
    planTitle: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
    planProgressBar: {
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
    },
    planProgressFill: {
        height: "100%",
        borderRadius: 2,
    },
    planPercent: {
        fontSize: 14,
        fontWeight: "600",
        marginRight: 8,
        minWidth: 36,
        textAlign: "right",
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    activityRowLast: { borderBottomWidth: 0 },
    activityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 14,
    },
    activityText: {
        flex: 1,
        fontSize: 15,
    },
    activityTime: {
        fontSize: 13,
        marginLeft: 12,
    },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyTitle: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
    emptyBody: { fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 28 },
    emptyBtn: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        paddingHorizontal: 24,
        borderRadius: 14,
        gap: 10,
    },
    emptyBtnText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
