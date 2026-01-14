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
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";

export default function PlansScreen() {
  const { plans } = usePlans();
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
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <Text style={styles.title}>Plans</Text>
          </View>

          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FolderOpen color={Colors.light.inkFaint} size={36} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptyBody}>
              Your roadmaps will appear here once you create one
            </Text>
            <Pressable
              style={styles.emptyBtn}
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Plans</Text>
          <Text style={styles.count}>{plans.length} total</Text>
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
                  pressed && styles.cardPressed,
                ]}
                onPress={() => router.push(`/plan/${plan.id}` as any)}
              >
                {/* Left accent */}
                <View style={[styles.cardAccent, { backgroundColor: Colors.light.rust }]} />

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {plan.content.title}
                  </Text>
                  <Text style={styles.cardGoal} numberOfLines={1}>
                    {plan.goal}
                  </Text>

                  <View style={styles.cardMeta}>
                    <Text style={styles.cardDate}>{timeAgo(plan.createdAt)}</Text>
                    <View style={styles.cardProgress}>
                      <View style={styles.cardProgressTrack}>
                        <View style={[styles.cardProgressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.cardProgressText}>{progress}%</Text>
                    </View>
                  </View>
                </View>

                <ChevronRight color={Colors.light.inkFaint} size={20} />
              </Pressable>
            );
          })}

          {/* Add new */}
          <Pressable
            style={({ pressed }) => [styles.addCard, pressed && styles.addCardPressed]}
            onPress={() => router.push("/(tabs)")}
          >
            <Plus color={Colors.light.rust} size={20} />
            <Text style={styles.addText}>Create new plan</Text>
          </Pressable>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: Colors.light.ink,
    letterSpacing: -0.6,
  },
  count: {
    fontSize: 15,
    color: Colors.light.inkMuted,
    marginTop: 4,
  },
  scrollContent: { paddingHorizontal: 24 },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    ...Colors.shadows?.md,
  },
  cardPressed: { backgroundColor: Colors.light.surfacePressed },
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
    color: Colors.light.ink,
    lineHeight: 23,
    marginBottom: 4,
  },
  cardGoal: {
    fontSize: 14,
    color: Colors.light.inkMuted,
    marginBottom: 14,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardDate: {
    fontSize: 13,
    color: Colors.light.inkFaint,
  },
  cardProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardProgressTrack: {
    width: 60,
    height: 4,
    backgroundColor: Colors.light.divider,
    borderRadius: 2,
    overflow: "hidden",
  },
  cardProgressFill: {
    height: "100%",
    backgroundColor: Colors.light.sage,
    borderRadius: 2,
  },
  cardProgressText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.sage,
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
    borderColor: Colors.light.divider,
    gap: 10,
  },
  addCardPressed: { backgroundColor: Colors.light.surfacePressed },
  addText: {
    fontSize: 15,
    color: Colors.light.rust,
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
    backgroundColor: Colors.light.backgroundDeep,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.ink,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 16,
    color: Colors.light.inkMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.rust,
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
