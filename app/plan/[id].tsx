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
  ChevronDown,
  ChevronUp,
  Award,
  BarChart3,
  Flame,
  Check,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";

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
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundTitle}>Plan not found</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.notFoundLink}>Go back</Text>
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

  const phaseProgress = (i: number) => {
    const actions = plan.content.phases[i].keyActions;
    const done = actions.filter((_, ai) => plan.progress.phaseActions[i]?.[ai]).length;
    return { done, total: actions.length };
  };

  const weekProgress = (i: number) => {
    const tasks = plan.content.weeklyPlans[i].tasks;
    const done = tasks.filter((_, ti) => plan.progress.weeklyTasks[i]?.[ti]).length;
    return { done, total: tasks.length };
  };

  const routineToday = (i: number) => {
    const today = new Date().toISOString().split("T")[0];
    return plan.progress.routineHistory[i]?.includes(today) || false;
  };

  const Header = ({ section, label }: { section: SectionKey; label: string }) => {
    const Icon = icons[section];
    const open = expanded.has(section);
    return (
      <Pressable style={styles.sectionHeader} onPress={() => toggle(section)}>
        <Icon color={Colors.light.ink} size={18} strokeWidth={1.8} />
        <Text style={styles.sectionTitle}>{label}</Text>
        {open ? <ChevronUp color={Colors.light.inkFaint} size={18} /> : <ChevronDown color={Colors.light.inkFaint} size={18} />}
      </Pressable>
    );
  };

  const Tick = ({ on, onPress }: { on: boolean; onPress: () => void }) => (
    <Pressable style={[styles.tick, on && styles.tickOn]} onPress={onPress} hitSlop={8}>
      {on && <Check color="#FFFFFF" size={12} strokeWidth={3} />}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.light.ink} size={22} />
          </Pressable>
          <Text style={styles.navProgress}>{plan.progress.overallProgress}%</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.planTitle}>{plan.content.title}</Text>
            <Text style={styles.planSummary}>{plan.content.summary}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${plan.progress.overallProgress}%` }]} />
            </View>
          </View>

          {/* Quote */}
          <View style={styles.quote}>
            <View style={styles.quoteLine} />
            <Text style={styles.quoteText}>{plan.content.motivationalQuote}</Text>
          </View>

          {/* Diagnosis */}
          <View style={styles.section}>
            <Header section="diagnosis" label="Diagnosis" />
            {expanded.has("diagnosis") && (
              <View style={styles.sectionBody}>
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Current state</Text>
                  <Text style={styles.blockText}>{plan.content.diagnosis.currentState}</Text>
                </View>
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Gap</Text>
                  <Text style={styles.blockText}>{plan.content.diagnosis.gap}</Text>
                </View>
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Success factors</Text>
                  {plan.content.diagnosis.successFactors.map((f, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Phases */}
          <View style={styles.section}>
            <Header section="phases" label="Roadmap" />
            {expanded.has("phases") && (
              <View style={styles.sectionBody}>
                {plan.content.phases.map((phase, pi) => {
                  const { done, total } = phaseProgress(pi);
                  return (
                    <View key={pi} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.phaseNum}>
                          <Text style={styles.phaseNumText}>{pi + 1}</Text>
                        </View>
                        <View style={styles.phaseInfo}>
                          <Text style={styles.phaseName}>{phase.name}</Text>
                          <Text style={styles.phaseDuration}>{phase.duration}</Text>
                        </View>
                        <Text style={styles.phaseCount}>{done}/{total}</Text>
                      </View>
                      <Text style={styles.phaseObj}>{phase.objective}</Text>
                      {phase.keyActions.map((action, ai) => {
                        const checked = plan.progress.phaseActions[pi]?.[ai] || false;
                        return (
                          <View key={ai} style={styles.itemRow}>
                            <Tick on={checked} onPress={() => togglePhaseAction(plan.id, pi, ai, action)} />
                            <Text style={[styles.itemText, checked && styles.itemTextDone]}>{action}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Weekly */}
          <View style={styles.section}>
            <Header section="weekly" label="Weekly Plans" />
            {expanded.has("weekly") && (
              <View style={styles.sectionBody}>
                {plan.content.weeklyPlans.map((week, wi) => {
                  const { done, total } = weekProgress(wi);
                  const mileDone = plan.progress.weeklyMilestones[wi] || false;
                  return (
                    <View key={wi} style={styles.card}>
                      <View style={styles.weekHeader}>
                        <Text style={styles.weekNum}>Week {week.week}</Text>
                        <Text style={styles.weekCount}>{done}/{total}</Text>
                      </View>
                      <Text style={styles.weekFocus}>{week.focus}</Text>
                      {week.tasks.map((task, ti) => {
                        const checked = plan.progress.weeklyTasks[wi]?.[ti] || false;
                        return (
                          <View key={ti} style={styles.itemRow}>
                            <Tick on={checked} onPress={() => toggleWeeklyTask(plan.id, wi, ti, task)} />
                            <Text style={[styles.itemText, checked && styles.itemTextDone]}>{task}</Text>
                          </View>
                        );
                      })}
                      <Pressable
                        style={[styles.milestone, mileDone && styles.milestoneDone]}
                        onPress={() => toggleWeeklyMilestone(plan.id, wi, week.milestone)}
                      >
                        <Award color={mileDone ? Colors.light.sage : Colors.light.inkFaint} size={16} />
                        <View style={styles.milestoneBody}>
                          <Text style={styles.milestoneLabel}>Milestone</Text>
                          <Text style={[styles.milestoneText, mileDone && styles.milestoneTextDone]}>{week.milestone}</Text>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Routines */}
          <View style={styles.section}>
            <Header section="routines" label="Routines" />
            {expanded.has("routines") && (
              <View style={styles.sectionBody}>
                {plan.content.routines.map((routine, ri) => {
                  const logged = routineToday(ri);
                  const streak = plan.progress.routineHistory[ri]?.length || 0;
                  return (
                    <View key={ri} style={styles.card}>
                      <View style={styles.routineHeader}>
                        <Text style={styles.routineName}>{routine.name}</Text>
                        <View style={styles.streakBadge}>
                          <Flame color={Colors.light.rust} size={12} />
                          <Text style={styles.streakNum}>{streak}</Text>
                        </View>
                      </View>
                      <Text style={styles.routineMeta}>{routine.frequency} · {routine.duration}</Text>
                      <Text style={styles.routineDesc}>{routine.description}</Text>
                      <Pressable
                        style={[styles.logBtn, logged && styles.logBtnDone]}
                        onPress={() => logRoutine(plan.id, ri, routine.name)}
                      >
                        {logged ? (
                          <>
                            <Check color={Colors.light.sage} size={16} />
                            <Text style={styles.logBtnTextDone}>Done today</Text>
                          </>
                        ) : (
                          <Text style={styles.logBtnText}>Mark as done</Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Obstacles */}
          <View style={styles.section}>
            <Header section="obstacles" label="Obstacles" />
            {expanded.has("obstacles") && (
              <View style={styles.sectionBody}>
                {plan.content.obstacles.map((ob, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.obstacleChallenge}>{ob.challenge}</Text>
                    <View style={styles.block}>
                      <Text style={styles.blockLabel}>Solution</Text>
                      <Text style={styles.blockText}>{ob.solution}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Checkpoints */}
          <View style={styles.section}>
            <Header section="checkpoints" label="Checkpoints" />
            {expanded.has("checkpoints") && (
              <View style={styles.sectionBody}>
                {(["day30", "day60", "day90"] as const).map(day => {
                  const items = plan.content.checkpoints[day];
                  const num = day.replace("day", "");
                  return (
                    <View key={day} style={styles.card}>
                      <Text style={styles.checkpointDay}>Day {num}</Text>
                      {items.map((item, ii) => {
                        const checked = plan.progress.checkpoints[day][ii] || false;
                        return (
                          <View key={ii} style={styles.itemRow}>
                            <Tick on={checked} onPress={() => toggleCheckpoint(plan.id, day, ii, item)} />
                            <Text style={[styles.itemText, checked && styles.itemTextDone]}>{item}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Metrics */}
          <View style={styles.section}>
            <Header section="metrics" label="Success Metrics" />
            {expanded.has("metrics") && (
              <View style={styles.sectionBody}>
                {plan.content.successMetrics.map((metric, mi) => {
                  const checked = plan.progress.successMetrics[mi] || false;
                  return (
                    <View key={mi} style={styles.itemRow}>
                      <Tick on={checked} onPress={() => toggleSuccessMetric(plan.id, mi, metric)} />
                      <Text style={[styles.itemText, checked && styles.itemTextDone]}>{metric}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  safeArea: { flex: 1 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
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
    color: Colors.light.ink,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 24 },
  // Hero
  hero: { marginBottom: 24 },
  planTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.ink,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  planSummary: {
    fontSize: 16,
    color: Colors.light.inkSoft,
    lineHeight: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.light.divider,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.rust,
    borderRadius: 3,
  },
  // Quote
  quote: {
    flexDirection: "row",
    marginBottom: 32,
  },
  quoteLine: {
    width: 3,
    backgroundColor: Colors.light.rust,
    borderRadius: 2,
    marginRight: 16,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.inkMuted,
    fontStyle: "italic",
    lineHeight: 24,
  },
  // Section
  section: {
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.ink,
  },
  sectionBody: { marginTop: 12, gap: 12 },
  // Card
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 18,
    ...Colors.shadows?.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.light.rust,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  phaseNumText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  phaseInfo: { flex: 1 },
  phaseName: { fontSize: 16, fontWeight: "600", color: Colors.light.ink },
  phaseDuration: { fontSize: 13, color: Colors.light.inkFaint, marginTop: 2 },
  phaseCount: { fontSize: 13, color: Colors.light.inkMuted, fontWeight: "500" },
  phaseObj: {
    fontSize: 14,
    color: Colors.light.inkSoft,
    lineHeight: 22,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  // Week
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekNum: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.rust,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  weekCount: { fontSize: 13, color: Colors.light.inkMuted, fontWeight: "500" },
  weekFocus: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.ink,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.divider,
  },
  // Tick
  tick: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.dividerStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  tickOn: {
    backgroundColor: Colors.light.sage,
    borderColor: Colors.light.sage,
  },
  // Item row
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.ink,
    lineHeight: 22,
  },
  itemTextDone: {
    color: Colors.light.inkFaint,
    textDecorationLine: "line-through",
  },
  // Milestone
  milestone: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: Colors.light.divider,
    gap: 12,
  },
  milestoneDone: {},
  milestoneBody: { flex: 1 },
  milestoneLabel: {
    fontSize: 11,
    color: Colors.light.inkFaint,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  milestoneText: { fontSize: 15, color: Colors.light.ink, lineHeight: 22 },
  milestoneTextDone: { color: Colors.light.sage },
  // Routine
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  routineName: { fontSize: 16, fontWeight: "500", color: Colors.light.ink, flex: 1 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.rustSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  streakNum: { fontSize: 12, fontWeight: "600", color: Colors.light.rust },
  routineMeta: { fontSize: 13, color: Colors.light.inkFaint, marginBottom: 10 },
  routineDesc: { fontSize: 14, color: Colors.light.inkSoft, lineHeight: 22, marginBottom: 14 },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: Colors.light.rust,
    borderRadius: 12,
    gap: 8,
  },
  logBtnDone: { backgroundColor: Colors.light.sageSoft },
  logBtnText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  logBtnTextDone: { fontSize: 15, fontWeight: "600", color: Colors.light.sage },
  // Block
  block: { marginBottom: 14 },
  blockLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.light.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  blockText: { fontSize: 15, color: Colors.light.ink, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 6 },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.rust,
    marginRight: 12,
    marginTop: 9,
  },
  bulletText: { flex: 1, fontSize: 15, color: Colors.light.ink, lineHeight: 22 },
  // Obstacle
  obstacleChallenge: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.ink,
    lineHeight: 22,
    marginBottom: 14,
  },
  // Checkpoint
  checkpointDay: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.rust,
    marginBottom: 14,
  },
  // Not found
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundTitle: { fontSize: 18, fontWeight: "500", color: Colors.light.ink, marginBottom: 12 },
  notFoundLink: { fontSize: 16, color: Colors.light.rust, fontWeight: "500" },
});
