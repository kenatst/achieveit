import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Target,
  Calendar,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Quote,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";

type SectionKey = "diagnosis" | "phases" | "weekly" | "routines" | "obstacles" | "checkpoints" | "metrics";

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans } = usePlans();
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set(["diagnosis", "phases"])
  );

  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Plan not found</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.emptyButton}>Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    color = Colors.dark.accent,
  }: {
    title: string;
    icon: React.ComponentType<{ color: string; size: number }>;
    section: SectionKey;
    color?: string;
  }) => (
    <Pressable
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
    >
      <View style={[styles.sectionIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {expandedSections.has(section) ? (
        <ChevronUp color={Colors.dark.textMuted} size={20} />
      ) : (
        <ChevronDown color={Colors.dark.textMuted} size={20} />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={Colors.dark.text} size={24} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>Your Plan</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleSection}>
            <Text style={styles.planTitle}>{plan.content.title}</Text>
            <Text style={styles.planSummary}>{plan.content.summary}</Text>
          </View>

          <View style={styles.quoteCard}>
            <Quote color={Colors.dark.gold} size={24} />
            <Text style={styles.quoteText}>
              {`"${plan.content.motivationalQuote}"`}
            </Text>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Diagnosis"
              icon={Target}
              section="diagnosis"
            />
            {expandedSections.has("diagnosis") && (
              <View style={styles.sectionContent}>
                <View style={styles.diagnosisItem}>
                  <Text style={styles.diagnosisLabel}>Current State</Text>
                  <Text style={styles.diagnosisText}>
                    {plan.content.diagnosis.currentState}
                  </Text>
                </View>
                <View style={styles.diagnosisItem}>
                  <Text style={styles.diagnosisLabel}>Gap to Bridge</Text>
                  <Text style={styles.diagnosisText}>
                    {plan.content.diagnosis.gap}
                  </Text>
                </View>
                <View style={styles.diagnosisItem}>
                  <Text style={styles.diagnosisLabel}>Success Factors</Text>
                  {plan.content.diagnosis.successFactors.map((factor, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{factor}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Roadmap Phases"
              icon={TrendingUp}
              section="phases"
              color={Colors.dark.accentLight}
            />
            {expandedSections.has("phases") && (
              <View style={styles.sectionContent}>
                {plan.content.phases.map((phase, index) => (
                  <View key={index} style={styles.phaseCard}>
                    <View style={styles.phaseHeader}>
                      <View style={styles.phaseNumber}>
                        <Text style={styles.phaseNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.phaseInfo}>
                        <Text style={styles.phaseName}>{phase.name}</Text>
                        <Text style={styles.phaseDuration}>{phase.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.phaseObjective}>{phase.objective}</Text>
                    <Text style={styles.phaseSubtitle}>Key Actions</Text>
                    {phase.keyActions.map((action, i) => (
                      <View key={i} style={styles.actionItem}>
                        <CheckSquare color={Colors.dark.accent} size={14} />
                        <Text style={styles.actionText}>{action}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Weekly Plans"
              icon={Calendar}
              section="weekly"
              color={Colors.dark.gold}
            />
            {expandedSections.has("weekly") && (
              <View style={styles.sectionContent}>
                {plan.content.weeklyPlans.map((week, index) => (
                  <View key={index} style={styles.weekCard}>
                    <View style={styles.weekHeader}>
                      <Text style={styles.weekNumber}>Week {week.week}</Text>
                      <Text style={styles.weekFocus}>{week.focus}</Text>
                    </View>
                    {week.tasks.map((task, i) => (
                      <View key={i} style={styles.taskItem}>
                        <View style={styles.taskCheckbox} />
                        <Text style={styles.taskText}>{task}</Text>
                      </View>
                    ))}
                    <View style={styles.milestoneContainer}>
                      <Text style={styles.milestoneLabel}>Milestone:</Text>
                      <Text style={styles.milestoneText}>{week.milestone}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Daily Routines"
              icon={RefreshCw}
              section="routines"
            />
            {expandedSections.has("routines") && (
              <View style={styles.sectionContent}>
                {plan.content.routines.map((routine, index) => (
                  <View key={index} style={styles.routineCard}>
                    <View style={styles.routineHeader}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <View style={styles.routineMeta}>
                        <Text style={styles.routineFrequency}>
                          {routine.frequency}
                        </Text>
                        <Text style={styles.routineDuration}>
                          {routine.duration}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.routineDescription}>
                      {routine.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Obstacles & Solutions"
              icon={AlertTriangle}
              section="obstacles"
              color={Colors.dark.warning}
            />
            {expandedSections.has("obstacles") && (
              <View style={styles.sectionContent}>
                {plan.content.obstacles.map((obstacle, index) => (
                  <View key={index} style={styles.obstacleCard}>
                    <Text style={styles.obstacleChallenge}>
                      {obstacle.challenge}
                    </Text>
                    <View style={styles.obstacleSolution}>
                      <Text style={styles.obstacleLabel}>Solution:</Text>
                      <Text style={styles.obstacleText}>{obstacle.solution}</Text>
                    </View>
                    <View style={styles.obstaclePrevention}>
                      <Text style={styles.obstacleLabel}>Prevention:</Text>
                      <Text style={styles.obstacleText}>
                        {obstacle.prevention}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="30/60/90 Day Checkpoints"
              icon={CheckSquare}
              section="checkpoints"
            />
            {expandedSections.has("checkpoints") && (
              <View style={styles.sectionContent}>
                <View style={styles.checkpointCard}>
                  <View style={styles.checkpointHeader}>
                    <Text style={styles.checkpointDay}>Day 30</Text>
                  </View>
                  {plan.content.checkpoints.day30.map((item, i) => (
                    <View key={i} style={styles.checkpointItem}>
                      <View style={styles.checkpointDot} />
                      <Text style={styles.checkpointText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.checkpointCard}>
                  <View style={styles.checkpointHeader}>
                    <Text style={styles.checkpointDay}>Day 60</Text>
                  </View>
                  {plan.content.checkpoints.day60.map((item, i) => (
                    <View key={i} style={styles.checkpointItem}>
                      <View style={styles.checkpointDot} />
                      <Text style={styles.checkpointText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.checkpointCard}>
                  <View style={styles.checkpointHeader}>
                    <Text style={styles.checkpointDay}>Day 90</Text>
                  </View>
                  {plan.content.checkpoints.day90.map((item, i) => (
                    <View key={i} style={styles.checkpointItem}>
                      <View style={styles.checkpointDot} />
                      <Text style={styles.checkpointText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Success Metrics"
              icon={TrendingUp}
              section="metrics"
            />
            {expandedSections.has("metrics") && (
              <View style={styles.sectionContent}>
                {plan.content.successMetrics.map((metric, index) => (
                  <View key={index} style={styles.metricItem}>
                    <View style={styles.metricNumber}>
                      <Text style={styles.metricNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.metricText}>{metric}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 36,
  },
  planSummary: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    lineHeight: 24,
  },
  quoteCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.gold,
  },
  quoteText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontStyle: "italic",
    lineHeight: 26,
    marginTop: 12,
  },
  section: {
    marginBottom: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  diagnosisItem: {
    marginBottom: 16,
  },
  diagnosisLabel: {
    fontSize: 13,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  diagnosisText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.accent,
    marginRight: 10,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  phaseCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  phaseNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.dark.accent,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  phaseDuration: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  phaseObjective: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  phaseSubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  weekCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  weekHeader: {
    marginBottom: 12,
  },
  weekNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.dark.gold,
    marginBottom: 4,
  },
  weekFocus: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    marginRight: 10,
    marginTop: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  milestoneContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  milestoneLabel: {
    fontSize: 12,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  milestoneText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: "500" as const,
  },
  routineCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routineHeader: {
    marginBottom: 8,
  },
  routineName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    marginBottom: 6,
  },
  routineMeta: {
    flexDirection: "row",
    gap: 12,
  },
  routineFrequency: {
    fontSize: 13,
    color: Colors.dark.accent,
    fontWeight: "500" as const,
  },
  routineDuration: {
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  routineDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  obstacleCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  obstacleChallenge: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  obstacleSolution: {
    marginBottom: 8,
  },
  obstaclePrevention: {},
  obstacleLabel: {
    fontSize: 12,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  obstacleText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  checkpointCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  checkpointHeader: {
    marginBottom: 12,
  },
  checkpointDay: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.dark.accent,
  },
  checkpointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  checkpointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.accent,
    marginRight: 10,
    marginTop: 5,
  },
  checkpointText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  metricNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricNumberText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.dark.accent,
  },
  metricText: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    marginBottom: 16,
  },
  emptyButton: {
    fontSize: 16,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
  },
});
