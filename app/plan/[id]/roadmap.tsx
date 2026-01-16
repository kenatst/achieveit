import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Target, TrendingUp, Calendar, AlertTriangle } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";

// Components
import SectionHeader from "@/components/plan/SectionHeader";
import DiagnosisSection from "@/components/plan/DiagnosisSection";
import PhaseSection from "@/components/plan/PhaseSection";
import WeeklySection from "@/components/plan/WeeklySection";
import ObstacleSection from "@/components/plan/ObstacleSection";

type SectionKey = "diagnosis" | "phases" | "weekly" | "obstacles";

const icons: Record<SectionKey, any> = {
    diagnosis: Target,
    phases: TrendingUp,
    weekly: Calendar,
    obstacles: AlertTriangle,
};

export default function RoadmapScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { plans, togglePhaseAction, toggleWeeklyTask, toggleWeeklyMilestone } = usePlans();

    const [expanded, setExpanded] = useState<Set<SectionKey>>(new Set(["phases", "weekly"]));

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

    const toggle = (s: SectionKey) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>{t("planDetail.roadmap")}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Summary */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.summaryCard}
                    >
                        <Text style={[styles.planTitle, { color: colors.ink }]}>{plan.content.title}</Text>
                        <Text style={[styles.planSummary, { color: colors.inkMedium }]}>{plan.content.summary}</Text>
                    </MotiView>

                    {/* Diagnosis */}
                    <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                        <SectionHeader
                            label={t("planDetail.diagnosis")}
                            icon={icons.diagnosis}
                            isOpen={expanded.has("diagnosis")}
                            onToggle={() => toggle("diagnosis")}
                        />
                        {expanded.has("diagnosis") && <DiagnosisSection plan={plan} />}
                    </View>

                    {/* Phases */}
                    <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                        <SectionHeader
                            label={t("planDetail.roadmap")}
                            icon={icons.phases}
                            isOpen={expanded.has("phases")}
                            onToggle={() => toggle("phases")}
                        />
                        {expanded.has("phases") && (
                            <PhaseSection plan={plan} onToggleAction={togglePhaseAction} />
                        )}
                    </View>

                    {/* Weekly */}
                    <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                        <SectionHeader
                            label={t("planDetail.weeklyPlans")}
                            icon={icons.weekly}
                            isOpen={expanded.has("weekly")}
                            onToggle={() => toggle("weekly")}
                        />
                        {expanded.has("weekly") && (
                            <WeeklySection
                                plan={plan}
                                onToggleTask={toggleWeeklyTask}
                                onToggleMilestone={toggleWeeklyMilestone}
                            />
                        )}
                    </View>

                    {/* Obstacles */}
                    <View style={[styles.section, { borderBottomColor: colors.divider }]}>
                        <SectionHeader
                            label={t("planDetail.obstacles")}
                            icon={icons.obstacles}
                            isOpen={expanded.has("obstacles")}
                            onToggle={() => toggle("obstacles")}
                        />
                        {expanded.has("obstacles") && <ObstacleSection plan={plan} />}
                    </View>

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
    summaryCard: { marginBottom: 24 },
    planTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
    planSummary: { fontSize: 15, lineHeight: 23 },
    section: { marginBottom: 16, borderBottomWidth: 0.5, paddingBottom: 16 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16 },
});
