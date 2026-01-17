import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, Target, Calendar, CheckCircle2, Flag, BarChart3, Clock, Zap } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { mediumTap, lightTap } from "@/utils/haptics";
import Typography from "@/constants/typography";

const { width } = Dimensions.get("window");

export default function PlanHubScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { plans } = usePlans();
    const { t } = useLanguage();

    const plan = plans.find(p => p.id === id);

    if (!plan) return null; // Should handle not found elegantly

    // Derived State
    const currentWeekIdx = useMemo(() => {
        return plan.content.weeklyPlans.findIndex(week => {
            const completed = week.tasks.filter((_, i) => plan.progress.weeklyTasks[week.week - 1]?.[i]).length;
            return completed < week.tasks.length;
        });
    }, [plan]);

    const currentWeek = currentWeekIdx !== -1 ? plan.content.weeklyPlans[currentWeekIdx] : plan.content.weeklyPlans[plan.content.weeklyPlans.length - 1];
    const currentPhase = plan.content.phases.find((_, i) => i === Math.floor(currentWeekIdx / 4)) || plan.content.phases[0];

    const stats = [
        { label: t("planDetail.week"), value: `${currentWeekIdx !== -1 ? currentWeekIdx + 1 : plan.content.weeklyPlans.length}`, icon: Calendar },
        { label: t("common.progress"), value: `${plan.progress.overallProgress}%`, icon: BarChart3 },
        { label: "Streak", value: "12", icon: Zap }, // Mock streak for now
    ];

    const menuItems = [
        {
            key: "overview",
            title: t("planDetail.diagnosis") + " & " + t("planDetail.roadmap"),
            subtitle: `${plan.content.phases.length} Phases • Strategic Vision`,
            icon: Target,
            path: `/plan/${id}/overview`
        },
        {
            key: "weekly",
            title: t("planDetail.weeklyPlans"),
            subtitle: `Week ${currentWeekIdx + 1}: ${currentWeek?.focus || "Focus"}`,
            icon: Calendar,
            path: `/plan/${id}/weekly`
        },
        {
            key: "routines",
            title: t("planDetail.routines"),
            subtitle: `${plan.content.routines.length} Daily Habits`,
            icon: Clock,
            path: `/plan/${id}/routines`
        },
        {
            key: "goals",
            title: "Goals & Metrics",
            subtitle: "KPIs, Obstacles & Checkpoints",
            icon: Flag,
            path: `/plan/${id}/goals`
        },
        {
            key: "coach",
            title: "AI Executive Coach",
            subtitle: "Strategy refinement & advice",
            icon: Zap, // Or a sparkle icon
            path: `/coach` // Assuming this is global for now, or could be plan specific
        },
        {
            key: "export",
            title: "Export & Share",
            subtitle: "PDF Report • Calendar Sync",
            icon: CheckCircle2, // Placeholder
            path: `/plan/${id}/export`
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Minimal Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable
                        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
                        onPress={() => { lightTap(); router.back(); }}
                    >
                        <ArrowLeft color={colors.ink} size={24} strokeWidth={2} />
                    </Pressable>
                    <View style={{ flex: 1 }} />
                    <Pressable style={styles.menuBtn}>
                        <View style={[styles.menuDot, { backgroundColor: colors.ink }]} />
                        <View style={[styles.menuDot, { backgroundColor: colors.ink }]} />
                    </Pressable>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 600 }}
                        style={styles.hero}
                    >
                        <Text style={[styles.superTitle, { color: colors.primary }]}>{currentPhase.name.toUpperCase()}</Text>
                        <Text style={[styles.title, { color: colors.ink }]}>{plan.content.title}</Text>

                        {/* Stats Strip */}
                        <View style={[styles.statsRow, { borderColor: colors.divider, backgroundColor: colors.surface }]}>
                            {stats.map((stat, i) => (
                                <View key={i} style={[
                                    styles.statItem,
                                    i !== stats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.divider }
                                ]}>
                                    <View style={styles.statIconContainer}>
                                        <stat.icon size={14} color={colors.inkMedium} />
                                        <Text style={[styles.statLabel, { color: colors.inkMedium }]}>{stat.label}</Text>
                                    </View>
                                    <Text style={[styles.statValue, { color: colors.ink }]}>{stat.value}</Text>
                                </View>
                            ))}
                        </View>
                    </MotiView>

                    {/* Today's Briefing Card - "Executive Summary" style */}
                    <Text style={[styles.sectionHeader, { color: colors.inkMedium }]}>TODAY'S BRIEFING</Text>
                    <Pressable
                        style={({ pressed }) => [
                            styles.briefingCard,
                            { backgroundColor: colors.surface, borderColor: colors.divider },
                            pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] }
                        ]}
                        onPress={() => { mediumTap(); router.push(`/plan/${id}/weekly`); }}
                    >
                        <View style={styles.briefingRow}>
                            <View style={[styles.briefingIndicator, { backgroundColor: colors.primary }]} />
                            <View style={styles.briefingContent}>
                                <Text style={[styles.briefingTitle, { color: colors.ink }]}>Priority Task</Text>
                                <Text style={[styles.briefingText, { color: colors.inkMedium }]} numberOfLines={1}>
                                    {currentWeek?.tasks[0] || "Review weekly progress"}
                                </Text>
                            </View>
                            <View style={[styles.checkCircle, { borderColor: colors.dividerStrong }]}>
                                <CheckCircle2 size={16} color="transparent" />
                            </View>
                        </View>
                    </Pressable>

                    {/* Menu List - Table of Contents Style */}
                    <View style={styles.menuContainer}>
                        <Text style={[styles.sectionHeader, { color: colors.inkMedium, marginTop: 32 }]}>PLAN NAVIGATION</Text>
                        {menuItems.map((item, i) => (
                            <Pressable
                                key={item.key}
                                style={({ pressed }) => [
                                    styles.menuItem,
                                    { backgroundColor: colors.surface },
                                    i === 0 && styles.menuItemFirst,
                                    i === menuItems.length - 1 && styles.menuItemLast,
                                    pressed && { backgroundColor: colors.surfaceHighlight }
                                ]}
                                onPress={() => { lightTap(); router.push(item.path as any); }}
                            >
                                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                                    <item.icon size={20} color={colors.ink} strokeWidth={1.5} />
                                </View>
                                <View style={[
                                    styles.menuContent,
                                    i !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }
                                ]}>
                                    <View>
                                        <Text style={[styles.menuTitle, { color: colors.ink }]}>{item.title}</Text>
                                        <Text style={[styles.menuSubtitle, { color: colors.inkFaint }]}>{item.subtitle}</Text>
                                    </View>
                                    <ChevronRight size={18} color={colors.inkFaint} />
                                </View>
                            </Pressable>
                        ))}
                    </View>

                    <View style={{ height: 50 }} />
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
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
    },
    menuBtn: {
        padding: 8,
        gap: 4,
        marginRight: -8,
    },
    menuDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    scroll: {
        paddingTop: 16,
    },
    hero: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    superTitle: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 8,
        fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    },
    title: {
        fontSize: 32,
        lineHeight: 38,
        fontWeight: "400",
        fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    statItem: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    statIconContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    briefingCard: {
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        // Quiet luxury shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    briefingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    briefingIndicator: {
        width: 4,
        height: 36,
        borderRadius: 2,
    },
    briefingContent: {
        flex: 1,
    },
    briefingTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    briefingText: {
        fontSize: 14,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    menuContainer: {
        paddingHorizontal: 24, // Keep consistent horizontal rhythm
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 16,
    },
    menuItemFirst: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    menuItemLast: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12, // slightly squarer
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingRight: 16,
    },
    menuTitle: {
        fontSize: 17,
        fontWeight: "500",
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
    },
});
