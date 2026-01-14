import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";
import { QuestionnaireAnswer } from "@/types/plan";

const stages = [
  "Understanding your goal",
  "Mapping the journey",
  "Building weekly plans",
  "Setting up routines",
  "Finishing touches",
];

export default function GeneratingScreen() {
  const { goal, answers } = useLocalSearchParams<{ goal: string; answers: string }>();
  const router = useRouter();
  const { generatePlan, generationError } = usePlans();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (stage + 1) / stages.length,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [stage]);

  useEffect(() => {
    const run = async () => {
      try {
        const parsed: QuestionnaireAnswer = JSON.parse(answers || "{}");
        const plan = await generatePlan({ goal: goal || "", answers: parsed });
        setDone(true);
        setTimeout(() => router.replace(`/plan/${plan.id}` as any), 1200);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    };
    run();
  }, [goal, answers, generatePlan, router]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (error || generationError) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <View style={styles.errorIcon}>
              <AlertCircle color={Colors.light.negative} size={36} />
            </View>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorBody}>{error || generationError?.message}</Text>
            <Text style={styles.errorLink} onPress={() => router.back()}>Go back</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <View style={styles.successIcon}>
              <Check color="#FFFFFF" size={32} strokeWidth={3} />
            </View>
            <Text style={styles.successTitle}>Your roadmap is ready</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {/* Spinner */}
          <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
            <View style={styles.spinnerArc} />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Building your roadmap</Text>
          <Text style={styles.goalQuote}>"{goal}"</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.stages}>
              {stages.map((s, i) => (
                <View key={i} style={[styles.stageRow, i === stage && styles.stageRowActive]}>
                  <View style={[
                    styles.stageDot,
                    i < stage && styles.stageDotDone,
                    i === stage && styles.stageDotActive,
                  ]}>
                    {i < stage && <Check color="#FFFFFF" size={10} strokeWidth={3} />}
                  </View>
                  <Text style={[
                    styles.stageText,
                    i === stage && styles.stageTextActive,
                    i < stage && styles.stageTextDone,
                  ]}>
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  // Spinner
  spinner: { width: 56, height: 56, marginBottom: 32 },
  spinnerArc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.light.divider,
    borderTopColor: Colors.light.rust,
  },
  // Content
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.ink,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  goalQuote: {
    fontSize: 16,
    color: Colors.light.inkMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 40,
    lineHeight: 24,
  },
  // Progress
  progressSection: { width: "100%" },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.light.divider,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.rust,
    borderRadius: 2,
  },
  stages: { gap: 14 },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.4,
  },
  stageRowActive: { opacity: 1 },
  stageDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.divider,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stageDotActive: { backgroundColor: Colors.light.rust },
  stageDotDone: { backgroundColor: Colors.light.sage },
  stageText: {
    fontSize: 15,
    color: Colors.light.inkMuted,
    fontWeight: "400",
  },
  stageTextActive: { color: Colors.light.ink, fontWeight: "500" },
  stageTextDone: { textDecorationLine: "line-through", color: Colors.light.inkFaint },
  // Success
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.ink,
  },
  // Error
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.rustSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.ink,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 15,
    color: Colors.light.inkMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  errorLink: {
    fontSize: 16,
    color: Colors.light.rust,
    fontWeight: "500",
  },
});
