import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, ChevronRight, FolderOpen } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";

export default function PlansScreen() {
  const { plans } = usePlans();
  const { colors, shadows } = useTheme();
  const router = useRouter();

  const timeAgo = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (plans.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.ink }]}>Plans</Text>
          </View>

          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundDeep }]}>
              <FolderOpen color={colors.inkFaint} size={36} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>No plans yet</Text>
            <Text style={[styles.emptyBody, { color: colors.inkMedium }]}>
              Your roadmaps will appear here once you create one
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.rust }]}
              onPress={() => router.push("/(tabs)")}
            >
              <Plus color="#FFFFFF" size={18} strokeWidth={2.5} />
              <Text style={styles.emptyBtnText}>Create your first plan</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.ink }]}>Plans</Text>
          <Text style={[styles.count, { color: colors.inkMedium }]}>{plans.length} total</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {plans.map((plan, i) => {
            const progress = plan.progress.overallProgress;

            return (
              <Pressable
                key={plan.id}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.surface },
                  shadows.md,
                  pressed && { backgroundColor: colors.surfacePressed },
                ]}
                onPress={() => router.push(`/plan/${plan.id}` as any)}
              >
                {/* Left accent */}
                <View style={[styles.cardAccent, { backgroundColor: colors.rust }]} />

                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.ink }]} numberOfLines={2}>
                    {plan.content.title}
                  </Text>
                  <Text style={[styles.cardGoal, { color: colors.inkMedium }]} numberOfLines={1}>
                    {plan.goal}
                  </Text>

                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardDate, { color: colors.inkFaint }]}>{timeAgo(plan.createdAt)}</Text>
                    <View style={styles.cardProgress}>
                      <View style={[styles.cardProgressTrack, { backgroundColor: colors.divider }]}>
                        <View style={[styles.cardProgressFill, { backgroundColor: colors.sage, width: `${progress}%` }]} />
                      </View>
                      <Text style={[styles.cardProgressText, { color: colors.sage }]}>{progress}%</Text>
                    </View>
                  </View>
                </View>

                <ChevronRight color={colors.inkFaint} size={20} />
              </Pressable>
            );
          })}

          {/* Add new */}
          <Pressable
            style={({ pressed }) => [
              styles.addCard,
              { borderColor: colors.divider },
              pressed && { backgroundColor: colors.surfacePressed }
            ]}
            onPress={() => router.push("/(tabs)")}
          >
            <Plus color={colors.rust} size={20} />
            <Text style={[styles.addText, { color: colors.rust }]}>Create new plan</Text>
          </Pressable>

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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  count: {
    fontSize: 15,
    marginTop: 4,
  },
  scrollContent: { paddingHorizontal: 24 },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardContent: {
    flex: 1,
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 23,
    marginBottom: 4,
  },
  cardGoal: {
    fontSize: 14,
    marginBottom: 14,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardDate: {
    fontSize: 13,
  },
  cardProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardProgressTrack: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  cardProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  cardProgressText: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  // Add card
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 10,
  },
  addText: {
    fontSize: 15,
    fontWeight: "500",
  },
  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
