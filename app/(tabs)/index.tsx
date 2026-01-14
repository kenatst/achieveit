import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Target, Sparkles, TrendingUp, Zap } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const exampleGoals = [
  { icon: "💼", text: "Launch my own business" },
  { icon: "🏋️", text: "Get in the best shape of my life" },
  { icon: "🎸", text: "Learn to play guitar" },
  { icon: "📚", text: "Read 50 books this year" },
  { icon: "🌍", text: "Learn a new language" },
  { icon: "💰", text: "Save $10,000" },
];

export default function HomeScreen() {
  const [goal, setGoal] = useState("");
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = () => {
    if (goal.trim()) {
      Keyboard.dismiss();
      router.push({ pathname: "/questionnaire", params: { goal: goal.trim() } });
    }
  };

  const handleExamplePress = (exampleGoal: string) => {
    setGoal(exampleGoal);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, Colors.dark.surface, Colors.dark.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Target color={Colors.dark.accent} size={28} />
                </View>
              </View>
              <Text style={styles.title}>How to achieve it</Text>
              <Text style={styles.subtitle}>
                Transform your goals into actionable plans with AI-powered roadmaps
              </Text>
            </View>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Sparkles color={Colors.dark.accent} size={16} />
                <Text style={styles.featureText}>AI-Powered</Text>
              </View>
              <View style={styles.featureDot} />
              <View style={styles.featureItem}>
                <TrendingUp color={Colors.dark.accent} size={16} />
                <Text style={styles.featureText}>Personalized</Text>
              </View>
              <View style={styles.featureDot} />
              <View style={styles.featureItem}>
                <Zap color={Colors.dark.accent} size={16} />
                <Text style={styles.featureText}>Actionable</Text>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>What do you want to achieve?</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Describe your goal..."
                  placeholderTextColor={Colors.dark.textMuted}
                  value={goal}
                  onChangeText={setGoal}
                  multiline
                  maxLength={200}
                  testID="goal-input"
                />
                <Text style={styles.charCount}>{goal.length}/200</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  style={[
                    styles.continueButton,
                    !goal.trim() && styles.continueButtonDisabled,
                  ]}
                  onPress={handleContinue}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={!goal.trim()}
                  testID="continue-button"
                >
                  <LinearGradient
                    colors={
                      goal.trim()
                        ? (Colors.gradients.primary as [string, string])
                        : ([Colors.dark.border, Colors.dark.border] as [string, string])
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text
                      style={[
                        styles.continueButtonText,
                        !goal.trim() && styles.continueButtonTextDisabled,
                      ]}
                    >
                      Create My Plan
                    </Text>
                    <ArrowRight
                      color={goal.trim() ? "#fff" : Colors.dark.textMuted}
                      size={20}
                    />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Need inspiration?</Text>
              <View style={styles.examplesGrid}>
                {exampleGoals.map((example, index) => (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.exampleChip,
                      pressed && styles.exampleChipPressed,
                    ]}
                    onPress={() => handleExamplePress(example.text)}
                  >
                    <Text style={styles.exampleIcon}>{example.icon}</Text>
                    <Text style={styles.exampleText} numberOfLines={1}>
                      {example.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.border,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  continueButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600" as const,
  },
  continueButtonTextDisabled: {
    color: Colors.dark.textMuted,
  },
  examplesSection: {
    flex: 1,
  },
  examplesTitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "500" as const,
  },
  examplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exampleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  exampleChipPressed: {
    backgroundColor: Colors.dark.surfaceLight,
    borderColor: Colors.dark.accent,
  },
  exampleIcon: {
    fontSize: 16,
  },
  exampleText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
  },
});
