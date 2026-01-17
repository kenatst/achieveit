import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    Target,
    Calendar,
    RefreshCw,
    Award,
    MessageCircle,
    FileDown,
    ChevronRight,
} from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, mediumTap } from "@/utils/haptics";

interface HubCardProps {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    color: string;
    bgColor: string;
    onPress: () => void;
    delay?: number;
}

function HubCard({ icon, label, sublabel, color, bgColor, onPress, delay = 0 }: HubCardProps) {
    const { colors, shadows } = useTheme();

    const handlePress = () => {
        lightTap();
        onPress();
    };

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay }}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.hubCard,
                    { backgroundColor: colors.surface },
                    shadows.card,
                    pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
                onPress={handlePress}
            >
                <View style={[styles.hubCardIcon, { backgroundColor: bgColor }]}>
                    {icon}
                </View>
                <Text style={[styles.hubCardLabel, { color: colors.ink }]}>{label}</Text>
                {sublabel && (
                    <Text style={[styles.hubCardSublabel, { color: colors.inkMuted }]}>{sublabel}</Text>
                )}
                <ChevronRight color={colors.inkFaint} size={16} style={styles.hubCardArrow} />
            </Pressable>
        </MotiView>
    );
}

export default function PlanHubScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans } = usePlans();

    const plan = plans.find(p => p.id === id);

    if (!plan) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.notFound}>
                        <Text style={[styles.notFoundTitle, { color: colors.ink }]}>
                            {t("planDetail.planNotFound")}
                        </Text>
                        <Pressable onPress={() => router.back()}>
                            <Text style={[styles.notFoundLink, { color: colors.rust }]}>
                                {t("planDetail.goBack")}
                            </Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // Calculate stats
    const todayStr = new Date().toISOString().split("T")[0];
    const routinesLogged = plan.content.routines.filter((_, ri) =>
        plan.progress.routineHistory[ri]?.includes(todayStr)
    ).length;
    const totalRoutines = plan.content.routines.length;

    const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
        const tasksDone = week.tasks.filter((_, ti) =>
            plan.progress.weeklyTasks[wi]?.[ti]
        ).length;
        return tasksDone < week.tasks.length;
    });
    const currentWeek = currentWeekIndex !== -1 ? currentWeekIndex + 1 : plan.content.weeklyPlans.length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={[styles.header, { borderBottomColor: colors.divider }]}
                >
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerProgress, { color: colors.rust }]}>
                        {plan.progress.overallProgress}%
                    </Text>
                </MotiView>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Hero */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 100 }}
                        style={styles.hero}
                    >
                        {/* Progress Ring */}
                        <View style={[styles.progressRing, { borderColor: colors.rust }]}>
                            <View style={[styles.progressRingInner, { backgroundColor: colors.background }]}>
                                <Text style={[styles.progressPercent, { color: colors.rust }]}>
                                    {plan.progress.overallProgress}%
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.planTitle, { color: colors.ink }]} numberOfLines={2}>
                            {plan.content.title}
                        </Text>
                        <Text style={[styles.planStats, { color: colors.inkMedium }]}>
                            {t("common.week")} {currentWeek} • {routinesLogged}/{totalRoutines} {t("focus.dailyRoutines").toLowerCase()}
                        </Text>
                    </MotiView>

                    {/* Navigation Grid */}
                    <View style={styles.grid}>
                        <HubCard
                            icon={<Target color={colors.rust} size={22} />}
                            label={t("planDetail.diagnosis")}
                            sublabel={t("planDetail.roadmap")}
                            color={colors.rust}
                            bgColor={colors.rustSoft}
                            onPress={() => router.push(`/plan/${id}/overview` as any)}
                            delay={150}
                        />
                        <HubCard
                            icon={<Calendar color={colors.sage} size={22} />}
                            label={t("planDetail.weeklyPlans")}
                            sublabel={`${plan.content.weeklyPlans.length} ${t("common.week").toLowerCase()}s`}
                            color={colors.sage}
                            bgColor={colors.sageSoft}
                            onPress={() => router.push(`/plan/${id}/weekly` as any)}
                            delay={200}
                        />
                        <HubCard
                            icon={<RefreshCw color="#6366F1" size={22} />}
                            label={t("planDetail.routines")}
                            sublabel={`${routinesLogged}/${totalRoutines} ${t("common.today").toLowerCase()}`}
                            color="#6366F1"
                            bgColor="#EEF2FF"
                            onPress={() => router.push(`/plan/${id}/routines` as any)}
                            delay={250}
                        />
                        <HubCard
                            icon={<Award color="#F59E0B" size={22} />}
                            label={t("planDetail.checkpoints")}
                            sublabel={t("planDetail.successMetrics")}
                            color="#F59E0B"
                            bgColor="#FEF3C7"
                            onPress={() => router.push(`/plan/${id}/goals` as any)}
                            delay={300}
                        />
                        <HubCard
                            icon={<MessageCircle color={colors.rust} size={22} />}
                            label={t("coach.title")}
                            sublabel={t("planDetail.askCoach")}
                            color={colors.rust}
                            bgColor={colors.rustSoft}
                            onPress={() => router.push({ pathname: "/coach" as any, params: { planId: id } })}
                            delay={350}
                        />
                        <HubCard
                            icon={<FileDown color={colors.sage} size={22} />}
                            label="Export"
                            sublabel="PDF & Calendar"
                            color={colors.sage}
                            bgColor={colors.sageSoft}
                            onPress={() => router.push(`/plan/${id}/export` as any)}
                            delay={400}
                        />
                    </View>

                    {/* Quote */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 500 }}
                        style={styles.quoteContainer}
                    >
                        <View style={[styles.quoteLine, { backgroundColor: colors.rust }]} />
                        <Text style={[styles.quoteText, { color: colors.inkMedium }]}>
                            "{plan.content.motivationalQuote}"
                        </Text>
                    </MotiView>
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
    headerProgress: {
        fontSize: 18,
        fontWeight: "700",
    },
    scroll: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    hero: {
        alignItems: "center",
        marginBottom: 32,
    },
    progressRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    progressRingInner: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    progressPercent: {
        fontSize: 32,
        fontWeight: "700",
    },
    planTitle: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    planStats: {
        fontSize: 14,
        textAlign: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 32,
    },
    hubCard: {
        width: "48%",
        padding: 18,
        borderRadius: 16,
        minHeight: 110,
    },
    hubCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    hubCardLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    hubCardSublabel: {
        fontSize: 12,
    },
    hubCardArrow: {
        position: "absolute",
        top: 18,
        right: 18,
    },
    quoteContainer: {
        flexDirection: "row",
        gap: 16,
        paddingVertical: 16,
    },
    quoteLine: {
        width: 3,
        borderRadius: 2,
    },
    quoteText: {
        flex: 1,
        fontSize: 15,
        fontStyle: "italic",
        lineHeight: 24,
    },
    notFound: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    notFoundTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    notFoundLink: {
        fontSize: 16,
        fontWeight: "500",
    },
});
