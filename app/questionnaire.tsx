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
import Colors from "@/constants/colors";
import { questions } from "@/constants/questions";
import { QuestionnaireAnswer } from "@/types/plan";

type PartialAnswers = Partial<QuestionnaireAnswer>;

export default function QuestionnaireScreen() {
  const { goal } = useLocalSearchParams<{ goal: string }>();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({ obstacles: [] });
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const animate = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const selectSingle = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const selectMulti = (value: string) => {
    const current = (answers.obstacles as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers(prev => ({ ...prev, obstacles: updated }));
  };

  const handleText = (text: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: text }));
  };

  const next = () => {
    if (step < questions.length - 1) {
      animate();
      setStep(step + 1);
    } else {
      const final: QuestionnaireAnswer = {
        timeframe: (answers.timeframe as QuestionnaireAnswer["timeframe"]) || "3_months",
        commitment: (answers.commitment as QuestionnaireAnswer["commitment"]) || "moderate",
        experience: (answers.experience as QuestionnaireAnswer["experience"]) || "beginner",
        obstacles: answers.obstacles || [],
        motivation: (answers.motivation as string) || "",
      };
      router.replace({
        pathname: "/generating",
        params: { goal, answers: JSON.stringify(final) },
      });
    }
  };

  const back = () => {
    if (step > 0) {
      animate();
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (question.type === "multi" || question.type === "text") return true;
    return !!answers[question.id as keyof PartialAnswers];
  };

  const isSelected = (value: string) => {
    if (question.type === "multi") return (answers.obstacles || []).includes(value);
    return answers[question.id as keyof PartialAnswers] === value;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <X color={Colors.light.inkMuted} size={22} />
          </Pressable>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.stepCount}>{step + 1}/{questions.length}</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.body}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.questionBlock, { opacity: fadeAnim }]}>
              {/* Goal reminder */}
              <View style={styles.goalReminder}>
                <Text style={styles.goalLabel}>Your goal</Text>
                <Text style={styles.goalText} numberOfLines={2}>{goal}</Text>
              </View>

              {/* Question */}
              <Text style={styles.question}>{question.question}</Text>

              {question.type === "text" ? (
                <View style={styles.textBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Write your answer..."
                    placeholderTextColor={Colors.light.inkFaint}
                    value={(answers.motivation as string) || ""}
                    onChangeText={handleText}
                    multiline
                    maxLength={300}
                  />
                  <Text style={styles.textCount}>
                    {((answers.motivation as string) || "").length}/300
                  </Text>
                </View>
              ) : (
                <View style={styles.options}>
                  {question.options?.map((opt, i) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.option,
                        isSelected(opt.value) && styles.optionSelected,
                      ]}
                      onPress={() => question.type === "multi" ? selectMulti(opt.value) : selectSingle(opt.value)}
                    >
                      <Text style={styles.optionEmoji}>{opt.icon}</Text>
                      <Text style={[
                        styles.optionLabel,
                        isSelected(opt.value) && styles.optionLabelSelected,
                      ]}>
                        {opt.label}
                      </Text>
                      <View style={[
                        styles.optionCheck,
                        isSelected(opt.value) && styles.optionCheckSelected,
                      ]}>
                        {isSelected(opt.value) && (
                          <Check color="#FFFFFF" size={14} strokeWidth={3} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {question.type === "multi" && (
                <Text style={styles.hint}>Select all that apply</Text>
              )}
            </Animated.View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 0 ? (
              <Pressable style={styles.backBtn} onPress={back}>
                <ArrowLeft color={Colors.light.ink} size={20} />
              </Pressable>
            ) : <View style={styles.backBtnPlaceholder} />}

            <Pressable
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={next}
              disabled={!canProceed()}
            >
              <Text style={[
                styles.nextBtnText,
                !canProceed() && styles.nextBtnTextDisabled,
              ]}>
                {step === questions.length - 1 ? "Generate" : "Next"}
              </Text>
              <ArrowRight
                color={canProceed() ? "#FFFFFF" : Colors.light.inkFaint}
                size={18}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.light.divider,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.rust,
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 13,
    color: Colors.light.inkMuted,
    fontWeight: "500",
    minWidth: 32,
    textAlign: "right",
  },
  body: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 },
  questionBlock: { flex: 1 },
  goalReminder: {
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  goalLabel: {
    fontSize: 12,
    color: Colors.light.inkFaint,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 16,
    color: Colors.light.ink,
    fontWeight: "500",
    lineHeight: 22,
  },
  question: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.ink,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 28,
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  optionSelected: {
    borderColor: Colors.light.rust,
    backgroundColor: Colors.light.rustSoft,
  },
  optionEmoji: { fontSize: 18, marginRight: 14 },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.ink,
    fontWeight: "400",
  },
  optionLabelSelected: { fontWeight: "500" },
  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCheckSelected: {
    backgroundColor: Colors.light.rust,
    borderColor: Colors.light.rust,
  },
  hint: {
    fontSize: 14,
    color: Colors.light.inkMuted,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  textBox: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  textInput: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    fontSize: 17,
    color: Colors.light.ink,
    minHeight: 150,
    lineHeight: 26,
    textAlignVertical: "top",
  },
  textCount: {
    position: "absolute",
    bottom: 12,
    right: 18,
    fontSize: 12,
    color: Colors.light.inkFaint,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.light.divider,
    gap: 12,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPlaceholder: { width: 52 },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: Colors.light.rust,
    borderRadius: 14,
    gap: 8,
  },
  nextBtnDisabled: { backgroundColor: Colors.light.divider },
  nextBtnText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  nextBtnTextDisabled: { color: Colors.light.inkFaint },
});
