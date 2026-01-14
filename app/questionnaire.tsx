import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { questions } from "@/constants/questions";
import { QuestionnaireAnswer } from "@/types/plan";

type PartialAnswers = Partial<QuestionnaireAnswer>;

export default function QuestionnaireScreen() {
  const { goal } = useLocalSearchParams<{ goal: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({
    obstacles: [],
  });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentStep];
  const progress = (currentStep + 1) / questions.length;

  const animateTransition = (direction: "next" | "prev") => {
    const toValue = direction === "next" ? -1 : 1;
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: toValue * 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleMultiSelect = (value: string) => {
    const currentValues = (answers.obstacles as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setAnswers((prev) => ({
      ...prev,
      obstacles: newValues,
    }));
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      animateTransition("next");
      setCurrentStep((prev) => prev + 1);
    } else {
      const finalAnswers: QuestionnaireAnswer = {
        timeframe: (answers.timeframe as QuestionnaireAnswer["timeframe"]) || "3_months",
        commitment: (answers.commitment as QuestionnaireAnswer["commitment"]) || "moderate",
        experience: (answers.experience as QuestionnaireAnswer["experience"]) || "beginner",
        obstacles: answers.obstacles || [],
        motivation: (answers.motivation as string) || "",
      };
      router.replace({
        pathname: "/generating",
        params: { goal, answers: JSON.stringify(finalAnswers) },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition("prev");
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canContinue = () => {
    const answer = answers[currentQuestion.id as keyof PartialAnswers];
    if (currentQuestion.type === "multi") {
      return true;
    }
    if (currentQuestion.type === "text") {
      return true;
    }
    return !!answer;
  };

  const isSelected = (value: string) => {
    if (currentQuestion.type === "multi") {
      return (answers.obstacles || []).includes(value);
    }
    return answers[currentQuestion.id as keyof PartialAnswers] === value;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background] as const}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <X color={Colors.dark.textSecondary} size={24} />
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {questions.length}
            </Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.questionContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <Text style={styles.goalLabel}>Your goal</Text>
              <Text style={styles.goalText} numberOfLines={2}>
                {goal}
              </Text>

              <Text style={styles.question}>{currentQuestion.question}</Text>

              {currentQuestion.type === "text" ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Share your motivation..."
                    placeholderTextColor={Colors.dark.textMuted}
                    value={(answers.motivation as string) || ""}
                    onChangeText={handleTextChange}
                    multiline
                    maxLength={300}
                  />
                  <Text style={styles.charCount}>
                    {((answers.motivation as string) || "").length}/300
                  </Text>
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.optionButton,
                        isSelected(option.value) && styles.optionButtonSelected,
                      ]}
                      onPress={() =>
                        currentQuestion.type === "multi"
                          ? handleMultiSelect(option.value)
                          : handleSingleSelect(option.value)
                      }
                    >
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected(option.value) && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {isSelected(option.value) && (
                        <View style={styles.checkIcon}>
                          <Check color={Colors.dark.accent} size={18} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {currentQuestion.type === "multi" && (
                <Text style={styles.multiHint}>
                  Select all that apply (optional)
                </Text>
              )}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            {currentStep > 0 && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <ArrowLeft color={Colors.dark.textSecondary} size={20} />
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.nextButton,
                !canContinue() && styles.nextButtonDisabled,
                currentStep === 0 && styles.nextButtonFull,
              ]}
              onPress={handleNext}
              disabled={!canContinue()}
            >
              <LinearGradient
                colors={
                  canContinue()
                    ? (Colors.gradients.primary as [string, string])
                    : ([Colors.dark.border, Colors.dark.border] as [string, string])
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !canContinue() && styles.nextButtonTextDisabled,
                  ]}
                >
                  {currentStep === questions.length - 1
                    ? "Generate My Plan"
                    : "Continue"}
                </Text>
                <ArrowRight
                  color={canContinue() ? "#fff" : Colors.dark.textMuted}
                  size={20}
                />
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  questionContainer: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    color: Colors.dark.accent,
    fontWeight: "600" as const,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  question: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 24,
    lineHeight: 34,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  optionButtonSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.accentMuted,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
  },
  optionLabelSelected: {
    color: Colors.dark.text,
  },
  checkIcon: {
    marginLeft: 8,
  },
  multiHint: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  textInputContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 140,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
  },
  nextButton: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  nextButtonTextDisabled: {
    color: Colors.dark.textMuted,
  },
});
