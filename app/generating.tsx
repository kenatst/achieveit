import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, AlertCircle } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { colors } = useTheme();
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <View style={[styles.errorIcon, { backgroundColor: colors.rustSoft }]}>
              <AlertCircle color={colors.negative} size={36} />
            </View>
            <Text style={[styles.errorTitle, { color: colors.ink }]}>Something went wrong</Text>
            <Text style={[styles.errorBody, { color: colors.inkMedium }]}>{error || generationError?.message}</Text>
            <Text style={[styles.errorLink, { color: colors.rust }]} onPress={() => router.back()}>Go back</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (done) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <View style={[styles.successIcon, { backgroundColor: colors.sage }]}>
              <Check color="#FFFFFF" size={32} strokeWidth={3} />
            </View>
            <Text style={[styles.successTitle, { color: colors.ink }]}>Your roadmap is ready</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {/* Spinner */}
          <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]}>
            <View style={[styles.spinnerArc, { borderColor: colors.divider, borderTopColor: colors.rust }]} />
          </Animated.View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.ink }]}>Building your roadmap</Text>
          <Text style={[styles.goalQuote, { color: colors.inkMedium }]}>"{goal}"</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
              <Animated.View style={[styles.progressFill, { backgroundColor: colors.rust, width: progressWidth }]} />
            </View>

            <View style={styles.stages}>
              {stages.map((s, i) => (
                <View key={i} style={[styles.stageRow, i === stage && styles.stageRowActive]}>
                  <View style={[
                    styles.stageDot,
                    { backgroundColor: colors.divider },
                    i < stage && { backgroundColor: colors.sage },
                    i === stage && { backgroundColor: colors.rust },
                  ]}>
                    {i < stage && <Check color="#FFFFFF" size={10} strokeWidth={3} />}
                  </View>
                  <Text style={[
                    styles.stageText,
                    { color: colors.inkMedium },
                    i === stage && { color: colors.ink, fontWeight: "500" },
                    i < stage && { textDecorationLine: "line-through", color: colors.inkFaint },
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  // Spinner
  spinner: { width: 56, height: 56, marginBottom: 32 },
  spinnerArc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  // Content
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  goalQuote: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 40,
    lineHeight: 24,
  },
  // Progress
  progressSection: { width: "100%" },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
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
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stageText: {
    fontSize: 15,
    fontWeight: "400",
  },
  // Success
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "600",
  },
  // Error
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  errorLink: {
    fontSize: 16,
    fontWeight: "500",
  },
});
