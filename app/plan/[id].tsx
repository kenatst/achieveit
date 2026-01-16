import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Map,
  CheckSquare,
  BarChart3,
  Settings2,
  MessageCircle,
  Sparkles,
} from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { triggerLight } from "@/utils/haptics";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  delay: number;
}

function QuickAction({ icon, label, sublabel, color, bgColor, onPress, delay }: QuickActionProps) {
  const { colors, shadows } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 400, delay }}
    >
      <Pressable
        style={[styles.actionCard, { backgroundColor: colors.surface }, shadows.card]}
        onPress={() => {
          triggerLight();
          onPress();
        }}
      >
        <View style={[styles.actionIcon, { backgroundColor: bgColor }]}>
          {icon}
        </View>
        <Text style={[styles.actionLabel, { color: colors.ink }]}>{label}</Text>
        <Text style={[styles.actionSublabel, { color: colors.inkMuted }]}>{sublabel}</Text>
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

  const plan = plans.find((p) => p.id === id);

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

  const progress = plan.progress.overallProgress;

  // Calculate stats
  const totalRoutines = plan.content.routines.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = plan.content.routines.filter((_, ri) =>
    plan.progress.routineHistory[ri]?.includes(todayStr)
  ).length;

  const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
    const tasksDone = week.tasks.filter((_, ti) =>
      plan.progress.weeklyTasks[wi]?.[ti]
    ).length;
    return tasksDone < week.tasks.length;
  });
  const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.ink} size={22} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.ink }]} numberOfLines={1}>
              {plan.content.title}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Progress Ring */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
            style={styles.progressSection}
          >
            <View style={[styles.progressRing, { borderColor: colors.rust }]}>
              <View style={[styles.progressRingInner, { backgroundColor: colors.background }]}>
                <Text style={[styles.progressPercent, { color: colors.rust }]}>{progress}</Text>
                <Text style={[styles.progressLabel, { color: colors.inkMuted }]}>%</Text>
              </View>
            </View>
            <Text style={[styles.progressTitle, { color: colors.ink }]}>
              {progress < 25 ? "Just Getting Started" :
                progress < 50 ? "Building Momentum" :
                  progress < 75 ? "Halfway There" :
                    progress < 100 ? "Almost Done" : "Complete!"}
            </Text>
            {currentWeek && (
              <Text style={[styles.currentWeek, { color: colors.inkMedium }]}>
                Week {currentWeek.week}: {currentWeek.focus}
              </Text>
            )}
          </MotiView>

          {/* Quote */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 200 }}
            style={[styles.quoteCard, { backgroundColor: colors.surface }, shadows.card]}
          >
            <Sparkles color={colors.rust} size={16} />
            <Text style={[styles.quoteText, { color: colors.inkMedium }]}>
              "{plan.content.motivationalQuote}"
            </Text>
          </MotiView>

          {/* Quick Actions Grid */}
          <View style={styles.actionsGrid}>
            <QuickAction
              icon={<Map color={colors.rust} size={22} />}
              label={t("planDetail.roadmap")}
              sublabel={`${plan.content.phases.length} phases`}
              color={colors.rust}
              bgColor={colors.rustSoft}
              onPress={() => router.push(`/plan/${id}/roadmap` as any)}
              delay={100}
            />
            <QuickAction
              icon={<CheckSquare color={colors.sage} size={22} />}
              label={t("planDetail.routines")}
              sublabel={`${completedToday}/${totalRoutines} today`}
              color={colors.sage}
              bgColor={colors.sageSoft}
              onPress={() => router.push(`/plan/${id}/tasks` as any)}
              delay={150}
            />
            <QuickAction
              icon={<BarChart3 color={colors.ink} size={22} />}
              label={t("planDetail.successMetrics")}
              sublabel={`${plan.content.successMetrics.length} metrics`}
              color={colors.ink}
              bgColor={colors.divider}
              onPress={() => router.push(`/plan/${id}/analytics` as any)}
              delay={200}
            />
            <QuickAction
              icon={<Settings2 color={colors.inkMedium} size={22} />}
              label="Actions"
              sublabel="Export & more"
              color={colors.inkMedium}
              bgColor={colors.backgroundDeep}
              onPress={() => router.push(`/plan/${id}/actions` as any)}
              delay={250}
            />
          </View>

          {/* AI Coach Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <Pressable
              style={[styles.coachButton, { backgroundColor: colors.rust }]}
              onPress={() => {
                triggerLight();
                router.push({ pathname: "/coach" as any, params: { planId: plan.id } });
              }}
            >
              <MessageCircle color="#FFF" size={20} />
              <Text style={styles.coachButtonText}>{t("planDetail.askCoach")}</Text>
            </Pressable>
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  scroll: { paddingHorizontal: 24, paddingTop: 32 },
  // Progress
  progressSection: { alignItems: "center", marginBottom: 32 },
  progressRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressRingInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: { fontSize: 42, fontWeight: "200", letterSpacing: -2 },
  progressLabel: { fontSize: 18, marginTop: -4 },
  progressTitle: { fontSize: 20, fontWeight: "600", marginBottom: 6 },
  currentWeek: { fontSize: 14, textAlign: "center" },
  // Quote
  quoteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 14,
    marginBottom: 28,
    gap: 12,
  },
  quoteText: { flex: 1, fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 24,
  },
  actionCard: {
    width: "47%",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  actionSublabel: { fontSize: 12 },
  // Coach Button
  coachButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  coachButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  // Not found
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundTitle: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
  notFoundLink: { fontSize: 16, fontWeight: "500" },
});
