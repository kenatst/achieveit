import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText, ChevronRight, Clock, Trash2, FolderOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";
import { Plan } from "@/types/plan";

export default function PlansScreen() {
  const { plans, isLoading, deletePlan } = usePlans();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePlanPress = (plan: Plan) => {
    router.push(`/plan/${plan.id}` as any);
  };

  const handleDeletePlan = (planId: string) => {
    deletePlan(planId);
  };

  const renderPlanItem = ({ item }: { item: Plan }) => (
    <Pressable
      style={({ pressed }) => [
        styles.planCard,
        pressed && styles.planCardPressed,
      ]}
      onPress={() => handlePlanPress(item)}
    >
      <View style={styles.planIconContainer}>
        <FileText color={Colors.dark.accent} size={24} />
      </View>
      <View style={styles.planContent}>
        <Text style={styles.planTitle} numberOfLines={2}>
          {item.content.title}
        </Text>
        <Text style={styles.planGoal} numberOfLines={1}>
          {item.goal}
        </Text>
        <View style={styles.planMeta}>
          <Clock color={Colors.dark.textMuted} size={12} />
          <Text style={styles.planDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.planActions}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeletePlan(item.id)}
          hitSlop={10}
        >
          <Trash2 color={Colors.dark.textMuted} size={18} />
        </Pressable>
        <ChevronRight color={Colors.dark.textMuted} size={20} />
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <FolderOpen color={Colors.dark.textMuted} size={48} />
      </View>
      <Text style={styles.emptyTitle}>No plans yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first plan by describing a goal you want to achieve
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)")}
      >
        <LinearGradient
          colors={Colors.gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Create Your First Plan</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as [string, string, string]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Plans</Text>
          <Text style={styles.headerSubtitle}>
            {plans.length} {plans.length === 1 ? "plan" : "plans"} created
          </Text>
        </View>

        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          contentContainerStyle={[
            styles.listContent,
            plans.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flex: 1,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  planCardPressed: {
    backgroundColor: Colors.dark.surfaceLight,
    borderColor: Colors.dark.borderLight,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  planContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  planGoal: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  planMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planDate: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  planActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
