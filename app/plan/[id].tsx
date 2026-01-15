import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Target,
  Calendar,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Award,
  BarChart3,
  CalendarPlus,
  FileDown,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";
import { exportPlanToCalendar } from "@/utils/calendarExport";
import { exportPlanToPDF } from "@/utils/pdfExport";

// Components
import SectionHeader from "@/components/plan/SectionHeader";
import DiagnosisSection from "@/components/plan/DiagnosisSection";
import PhaseSection from "@/components/plan/PhaseSection";
import WeeklySection from "@/components/plan/WeeklySection";
import RoutineSection from "@/components/plan/RoutineSection";
import ObstacleSection from "@/components/plan/ObstacleSection";
import CheckpointSection from "@/components/plan/CheckpointSection";
import MetricsSection from "@/components/plan/MetricsSection";

type SectionKey = "diagnosis" | "phases" | "weekly" | "routines" | "obstacles" | "checkpoints" | "metrics";

const icons: Record<SectionKey, any> = {
  diagnosis: Target,
  phases: TrendingUp,
  weekly: Calendar,
  routines: RefreshCw,
  obstacles: AlertTriangle,
  checkpoints: Award,
  metrics: BarChart3,
};

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    plans,
    togglePhaseAction,
    toggleWeeklyTask,
    toggleWeeklyMilestone,
    toggleCheckpoint,
    toggleSuccessMetric,
    logRoutine,
  } = usePlans();

  const [expanded, setExpanded] = useState<Set<SectionKey>>(new Set(["phases", "weekly"]));

  const plan = plans.find(p => p.id === id);

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={[styles.notFoundTitle, { color: colors.ink }]}>Plan not found</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.notFoundLink, { color: colors.rust }]}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const toggle = (s: SectionKey) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Nav */}
        <View style={[styles.nav, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.ink} size={22} />
          </Pressable>
          <Text style={[styles.navProgress, { color: colors.ink }]}>{plan.progress.overallProgress}%</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={[styles.planTitle, { color: colors.ink }]}>{plan.content.title}</Text>
            <Text style={[styles.planSummary, { color: colors.inkMedium }]}>{plan.content.summary}</Text>
            <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.rust, width: `${plan.progress.overallProgress}%` }]} />
            </View>
            <Pressable
              style={[styles.exportBtn, { backgroundColor: colors.rustSoft }]}
              onPress={() => exportPlanToCalendar(plan)}
            >
              <CalendarPlus color={colors.rust} size={18} strokeWidth={1.8} />
              <Text style={[styles.exportBtnText, { color: colors.rust }]}>Export to Calendar</Text>
            </Pressable>
            <Pressable
              style={[styles.exportBtn, { backgroundColor: colors.sageSoft }]}
              onPress={() => exportPlanToPDF(plan)}
            >
              <FileDown color={colors.sage} size={18} strokeWidth={1.8} />
              <Text style={[styles.exportBtnText, { color: colors.sage }]}>Download PDF</Text>
            </Pressable>
            <Pressable
              style={[styles.exportBtn, { backgroundColor: colors.rust }]}
              onPress={() => router.push({ pathname: "/coach" as any, params: { planId: plan.id } })}
            >
              <MessageCircle color="#FFF" size={18} strokeWidth={1.8} />
              <Text style={[styles.exportBtnText, { color: "#FFF" }]}>Ask AI Coach</Text>
            </Pressable>
          </View>

          {/* Quote */}
          <View style={styles.quote}>
            <View style={[styles.quoteLine, { backgroundColor: colors.rust }]} />
            <Text style={[styles.quoteText, { color: colors.inkMedium }]}>{plan.content.motivationalQuote}</Text>
          </View>

          {/* Sections */}

          {/* Diagnosis */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Diagnosis"
              icon={icons.diagnosis}
              isOpen={expanded.has("diagnosis")}
              onToggle={() => toggle("diagnosis")}
            />
            {expanded.has("diagnosis") && <DiagnosisSection plan={plan} />}
          </View>

          {/* Phases */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Roadmap"
              icon={icons.phases}
              isOpen={expanded.has("phases")}
              onToggle={() => toggle("phases")}
            />
            {expanded.has("phases") && (
              <PhaseSection
                plan={plan}
                onToggleAction={togglePhaseAction}
              />
            )}
          </View>

          {/* Weekly */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Weekly Plans"
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

          {/* Routines */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Routines"
              icon={icons.routines}
              isOpen={expanded.has("routines")}
              onToggle={() => toggle("routines")}
            />
            {expanded.has("routines") && (
              <RoutineSection
                plan={plan}
                onLogRoutine={logRoutine}
              />
            )}
          </View>

          {/* Obstacles */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Obstacles"
              icon={icons.obstacles}
              isOpen={expanded.has("obstacles")}
              onToggle={() => toggle("obstacles")}
            />
            {expanded.has("obstacles") && <ObstacleSection plan={plan} />}
          </View>

          {/* Checkpoints */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Checkpoints"
              icon={icons.checkpoints}
              isOpen={expanded.has("checkpoints")}
              onToggle={() => toggle("checkpoints")}
            />
            {expanded.has("checkpoints") && (
              <CheckpointSection
                plan={plan}
                onToggleCheckpoint={toggleCheckpoint}
              />
            )}
          </View>

          {/* Metrics */}
          <View style={[styles.section, { borderBottomColor: colors.divider }]}>
            <SectionHeader
              label="Success Metrics"
              icon={icons.metrics}
              isOpen={expanded.has("metrics")}
              onToggle={() => toggle("metrics")}
            />
            {expanded.has("metrics") && (
              <MetricsSection
                plan={plan}
                onToggleMetric={toggleSuccessMetric}
              />
            )}
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
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navProgress: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: { paddingHorizontal: 24, paddingTop: 24 },
  // Hero
  hero: { marginBottom: 24 },
  planTitle: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  planSummary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Quote
  quote: {
    flexDirection: "row",
    marginBottom: 32,
  },
  quoteLine: {
    width: 3,
    borderRadius: 2,
    marginRight: 16,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  // Section
  section: {
    marginBottom: 16,
    borderBottomWidth: 0.5,
    paddingBottom: 16,
  },
  // Not found
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundTitle: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
  notFoundLink: { fontSize: 16, fontWeight: "500" },
});
