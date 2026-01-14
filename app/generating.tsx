import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Sparkles, FileText, CheckCircle, AlertCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { usePlans } from "@/contexts/PlansContext";
import { QuestionnaireAnswer } from "@/types/plan";

const loadingSteps = [
  { text: "Analyzing your goal...", icon: Sparkles },
  { text: "Creating personalized roadmap...", icon: FileText },
  { text: "Building weekly plans...", icon: FileText },
  { text: "Generating routines & checklists...", icon: CheckCircle },
  { text: "Finalizing your premium plan...", icon: Sparkles },
];

export default function GeneratingScreen() {
  const { goal, answers } = useLocalSearchParams<{
    goal: string;
    answers: string;
  }>();
  const router = useRouter();
  const { generatePlan, generationError } = usePlans();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlanId, setGeneratedPlanId] = useState<string | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, pulseAnim]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStepIndex + 1) / loadingSteps.length,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentStepIndex, progressAnim]);

  useEffect(() => {
    const generate = async () => {
      try {
        const parsedAnswers: QuestionnaireAnswer = JSON.parse(answers || "{}");
        console.log("Starting plan generation for goal:", goal);
        const plan = await generatePlan({
          goal: goal || "",
          answers: parsedAnswers,
        });
        console.log("Plan generated successfully:", plan.id);
        setGeneratedPlanId(plan.id);
        setTimeout(() => {
          router.replace(`/plan/${plan.id}` as any);
        }, 1000);
      } catch (err) {
        console.error("Error generating plan:", err);
        setError(err instanceof Error ? err.message : "Failed to generate plan");
      }
    };

    generate();
  }, [goal, answers, generatePlan, router]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const CurrentStepIcon = loadingSteps[currentStepIndex].icon;

  if (error || generationError) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.errorIconContainer}>
              <AlertCircle color={Colors.dark.error} size={48} />
            </View>
            <Text style={styles.errorTitle}>Generation Failed</Text>
            <Text style={styles.errorMessage}>
              {error || generationError?.message || "Something went wrong"}
            </Text>
            <View style={styles.errorActions}>
              <Text
                style={styles.errorButton}
                onPress={() => router.back()}
              >
                Go Back
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (generatedPlanId) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.successIconContainer}>
              <CheckCircle color={Colors.dark.accent} size={48} />
            </View>
            <Text style={styles.successTitle}>Plan Created!</Text>
            <Text style={styles.successMessage}>
              Your personalized roadmap is ready
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <View style={styles.iconRing} />
            </Animated.View>
            <View style={styles.iconInner}>
              <CurrentStepIcon color={Colors.dark.accent} size={32} />
            </View>
          </Animated.View>

          <Text style={styles.title}>Creating Your Plan</Text>
          <Text style={styles.goalText} numberOfLines={2}>
            {`"${goal}"`}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
          </View>

          <View style={styles.stepsContainer}>
            {loadingSteps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepItem,
                  index === currentStepIndex && styles.stepItemActive,
                  index < currentStepIndex && styles.stepItemCompleted,
                ]}
              >
                <View
                  style={[
                    styles.stepDot,
                    index === currentStepIndex && styles.stepDotActive,
                    index < currentStepIndex && styles.stepDotCompleted,
                  ]}
                />
                <Text
                  style={[
                    styles.stepText,
                    index === currentStepIndex && styles.stepTextActive,
                    index < currentStepIndex && styles.stepTextCompleted,
                  ]}
                >
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  iconRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: Colors.dark.accent,
    borderRightColor: Colors.dark.accentLight,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 12,
    textAlign: "center",
  },
  goalText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    fontStyle: "italic",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 40,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.dark.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.accent,
    borderRadius: 3,
  },
  stepsContainer: {
    width: "100%",
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.4,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepItemCompleted: {
    opacity: 0.6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
    marginRight: 12,
  },
  stepDotActive: {
    backgroundColor: Colors.dark.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepDotCompleted: {
    backgroundColor: Colors.dark.accentDark,
  },
  stepText: {
    fontSize: 15,
    color: Colors.dark.textMuted,
  },
  stepTextActive: {
    color: Colors.dark.text,
    fontWeight: "500" as const,
  },
  stepTextCompleted: {
    color: Colors.dark.textSecondary,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: "row",
  },
  errorButton: {
    fontSize: 16,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
  },
});
