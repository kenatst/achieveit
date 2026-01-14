import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";
import { ActivityLogEntry } from "@/types/plan";

export default function DashboardScreen() {
    const { plans } = usePlans();
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
        if (mins < 1) return "now";
        if (mins < 60) return `${mins}m`;
        if (hrs < 24) return `${hrs}h`;
        return `${days}d`;
    };

    if (totalPlans === 0) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Progress</Text>
                    </View>
                    <View style={styles.empty}>
                        <View style={styles.emptyIcon}>
                            <TrendingUp color={Colors.light.inkFaint} size={32} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.emptyTitle}>Nothing here yet</Text>
                        <Text style={styles.emptyBody}>
                            Create a plan and your progress will show up here
                        </Text>
                        <Pressable style={styles.emptyBtn} onPress={() => router.push("/(tabs)")}>
                            <Text style={styles.emptyBtnText}>Create a plan</Text>
                            <ArrowUpRight color="#FFFFFF" size={18} />
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Progress</Text>
                    </View>

                    {/* Big stat */}
                    <View style={styles.heroCard}>
                        <Text style={styles.heroNumber}>{overall}</Text>
                        <Text style={styles.heroPercent}>%</Text>
                        <Text style={styles.heroLabel}>overall completion</Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{totalDone}</Text>
                            <Text style={styles.statLabel}>Tasks done</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{activePlans}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{completedPlans}</Text>
                            <Text style={styles.statLabel}>Done</Text>
                        </View>
                    </View>

                    {/* Plans */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your plans</Text>
                        {plans.map(plan => (
                            <Pressable
                                key={plan.id}
                                style={({ pressed }) => [styles.planRow, pressed && styles.planRowPressed]}
                                onPress={() => router.push(`/plan/${plan.id}` as any)}
                            >
                                <View style={styles.planInfo}>
                                    <Text style={styles.planTitle} numberOfLines={1}>{plan.content.title}</Text>
                                    <View style={styles.planProgressBar}>
                                        <View style={[styles.planProgressFill, { width: `${plan.progress.overallProgress}%` }]} />
                                    </View>
                                </View>
                                <Text style={styles.planPercent}>{plan.progress.overallProgress}%</Text>
                                <ChevronRight color={Colors.light.inkFaint} size={18} />
                            </Pressable>
                        ))}
                    </View>

                    {/* Activity */}
                    {recentActivity.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent activity</Text>
                            {recentActivity.map((a, i) => (
                                <View key={a.id} style={[styles.activityRow, i === recentActivity.length - 1 && styles.activityRowLast]}>
                                    <View style={styles.activityDot} />
                                    <Text style={styles.activityText} numberOfLines={1}>{a.description}</Text>
                                    <Text style={styles.activityTime}>{timeAgo(a.timestamp)}</Text>
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
    container: { flex: 1, backgroundColor: Colors.light.background },
    safeArea: { flex: 1 },
    scroll: { paddingHorizontal: 24 },
    header: { paddingTop: 24, paddingBottom: 16 },
    title: {
        fontSize: 34,
        fontWeight: "700",
        color: Colors.light.ink,
        letterSpacing: -0.6,
    },
    // Hero
    heroCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        paddingVertical: 32,
        alignItems: "center",
        marginBottom: 24,
        ...Colors.shadows?.md,
    },
    heroNumber: {
        fontSize: 72,
        fontWeight: "200",
        color: Colors.light.rust,
        letterSpacing: -4,
        lineHeight: 76,
    },
    heroPercent: {
        fontSize: 24,
        fontWeight: "300",
        color: Colors.light.rust,
        marginTop: -4,
    },
    heroLabel: {
        fontSize: 14,
        color: Colors.light.inkMuted,
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    // Stats
    statsRow: {
        flexDirection: "row",
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        paddingVertical: 20,
        marginBottom: 32,
        ...Colors.shadows?.sm,
    },
    stat: { flex: 1, alignItems: "center" },
    statValue: {
        fontSize: 26,
        fontWeight: "600",
        color: Colors.light.ink,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.inkMuted,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.light.divider,
        marginVertical: 4,
    },
    // Section
    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.light.inkFaint,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
    },
    // Plans
    planRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.light.divider,
    },
    planRowPressed: { backgroundColor: Colors.light.surfacePressed, marginHorizontal: -24, paddingHorizontal: 24 },
    planInfo: { flex: 1, marginRight: 16 },
    planTitle: { fontSize: 16, fontWeight: "500", color: Colors.light.ink, marginBottom: 8 },
    planProgressBar: {
        height: 4,
        backgroundColor: Colors.light.divider,
        borderRadius: 2,
        overflow: "hidden",
    },
    planProgressFill: {
        height: "100%",
        backgroundColor: Colors.light.sage,
        borderRadius: 2,
    },
    planPercent: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.light.sage,
        marginRight: 8,
        minWidth: 36,
        textAlign: "right",
    },
    // Activity
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.light.divider,
    },
    activityRowLast: { borderBottomWidth: 0 },
    activityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.rust,
        marginRight: 14,
    },
    activityText: {
        flex: 1,
        fontSize: 15,
        color: Colors.light.ink,
    },
    activityTime: {
        fontSize: 13,
        color: Colors.light.inkFaint,
        marginLeft: 12,
    },
    // Empty
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: Colors.light.backgroundDeep,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyTitle: { fontSize: 22, fontWeight: "600", color: Colors.light.ink, marginBottom: 8 },
    emptyBody: { fontSize: 16, color: Colors.light.inkMuted, textAlign: "center", lineHeight: 24, marginBottom: 28 },
    emptyBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.rust,
        height: 52,
        paddingHorizontal: 24,
        borderRadius: 14,
        gap: 10,
    },
    emptyBtnText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
