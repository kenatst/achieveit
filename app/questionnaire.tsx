import React, { useState, useRef, useMemo } from "react";
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
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getQuestions } from "@/constants/questions";
import { QuestionnaireAnswer } from "@/types/plan";

type PartialAnswers = Partial<QuestionnaireAnswer>;

export default function QuestionnaireScreen() {
  const { goal } = useLocalSearchParams<{ goal: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({ obstacles: [] });
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Get translated questions
  const questions = useMemo(() => getQuestions(t), [t]);

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

  // Translated labels
  const goalLabel = t("questionnaire.goalLabel") || "Your goal";
  const selectAllHint = t("questionnaire.selectAll") || "Select all that apply";
  const writePlaceholder = t("questionnaire.q5_placeholder");
  const nextLabel = t("common.next");
  const generateLabel = t("generating.title") || "Generate";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <X color={colors.inkMedium} size={22} />
          </Pressable>

          <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.rust, width: `${progress}%` }]} />
          </View>

          <Text style={[styles.stepCount, { color: colors.inkMedium }]}>{step + 1}/{questions.length}</Text>
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
              <View style={[styles.goalReminder, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.goalLabel, { color: colors.inkFaint }]}>{goalLabel}</Text>
                <Text style={[styles.goalText, { color: colors.ink }]} numberOfLines={2}>{goal}</Text>
              </View>

              {/* Question */}
              <Text style={[styles.question, { color: colors.ink }]}>{question.question}</Text>

              {question.type === "text" ? (
                <View style={[styles.textBox, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                  <TextInput
                    style={[styles.textInput, { color: colors.ink }]}
                    placeholder={writePlaceholder}
                    placeholderTextColor={colors.inkFaint}
                    value={(answers.motivation as string) || ""}
                    onChangeText={handleText}
                    multiline
                    maxLength={300}
                  />
                  <Text style={[styles.textCount, { color: colors.inkFaint }]}>
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
                        { backgroundColor: colors.surface, borderColor: colors.divider },
                        isSelected(opt.value) && { borderColor: colors.rust, backgroundColor: colors.rustSoft },
                      ]}
                      onPress={() => question.type === "multi" ? selectMulti(opt.value) : selectSingle(opt.value)}
                    >
                      <Text style={styles.optionEmoji}>{opt.icon}</Text>
                      <Text style={[
                        styles.optionLabel,
                        { color: colors.ink },
                        isSelected(opt.value) && { fontWeight: "500" },
                      ]}>
                        {opt.label}
                      </Text>
                      <View style={[
                        styles.optionCheck,
                        { borderColor: colors.divider },
                        isSelected(opt.value) && { backgroundColor: colors.rust, borderColor: colors.rust },
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
                <Text style={[styles.hint, { color: colors.inkMedium }]}>{selectAllHint}</Text>
              )}
            </Animated.View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            {step > 0 ? (
              <Pressable style={[styles.backBtn, { borderColor: colors.divider }]} onPress={back}>
                <ArrowLeft color={colors.ink} size={20} />
              </Pressable>
            ) : <View style={styles.backBtnPlaceholder} />}

            <Pressable
              style={[
                styles.nextBtn,
                { backgroundColor: colors.rust },
                !canProceed() && { backgroundColor: colors.divider }
              ]}
              onPress={next}
              disabled={!canProceed()}
            >
              <Text style={[
                styles.nextBtnText,
                !canProceed() && { color: colors.inkFaint },
              ]}>
                {step === questions.length - 1 ? generateLabel : nextLabel}
              </Text>
              <ArrowRight
                color={canProceed() ? "#FFFFFF" : colors.inkFaint}
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
  container: { flex: 1 },
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
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 13,
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
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  question: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 28,
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionEmoji: { fontSize: 18, marginRight: 14 },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
  },
  optionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  textBox: {
    borderRadius: 14,
    borderWidth: 1,
  },
  textInput: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    fontSize: 17,
    minHeight: 150,
    lineHeight: 26,
    textAlignVertical: "top",
  },
  textCount: {
    position: "absolute",
    bottom: 12,
    right: 18,
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    gap: 12,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
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
    borderRadius: 14,
    gap: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
