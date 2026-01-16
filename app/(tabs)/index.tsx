import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Typography from "@/constants/typography";
import HelpTip from "@/components/HelpTip";
import { TIPS } from "@/constants/tips";
import { triggerLight, triggerSelection } from "@/utils/haptics";

// Smart suggestions based on input
const SUGGESTIONS = [
  { prefix: "learn", suggestions: ["Learn Japanese", "Learn to code", "Learn photography", "Learn public speaking"] },
  { prefix: "build", suggestions: ["Build a startup", "Build muscle", "Build an app", "Build passive income"] },
  { prefix: "run", suggestions: ["Run a marathon", "Run a business", "Run 5K", "Run every day"] },
  { prefix: "become", suggestions: ["Become a developer", "Become more confident", "Become financially free", "Become an expert"] },
  { prefix: "start", suggestions: ["Start a podcast", "Start writing", "Start meditating", "Start investing"] },
  { prefix: "master", suggestions: ["Master guitar", "Master cooking", "Master a new language", "Master negotiation"] },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const [goal, setGoal] = useState("");
  const [active, setActive] = useState(false);
  const router = useRouter();

  const focusAnim = useRef(new Animated.Value(0)).current;

  // Get matching suggestions
  const matchingSuggestions = useMemo(() => {
    if (goal.length < 2) return [];
    const lower = goal.toLowerCase();

    for (const group of SUGGESTIONS) {
      if (lower.startsWith(group.prefix)) {
        return group.suggestions.filter(s =>
          s.toLowerCase().startsWith(lower) && s.toLowerCase() !== lower
        ).slice(0, 3);
      }
    }

    // Partial match on any prefix
    for (const group of SUGGESTIONS) {
      if (group.prefix.startsWith(lower)) {
        return group.suggestions.slice(0, 3);
      }
    }

    return [];
  }, [goal]);

  const handleFocus = () => {
    setActive(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!goal) {
      setActive(false);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    triggerSelection();
    setGoal(suggestion);
  };

  const bgStyle = {
    backgroundColor: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.background, colors.surface],
    }),
  };

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <SafeAreaView style={styles.safeArea}>
        <HelpTip
          id={TIPS.createScreen.id}
          message={TIPS.createScreen.message}
          position="top"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* The Statement Header */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 700 }}
              style={[styles.header, { borderBottomColor: colors.divider }]}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.date, { color: colors.inkMedium }]}>
                {new Date().toLocaleDateString(locale, { month: 'long', day: 'numeric' })}
              </Text>
            </MotiView>

            {/* The Question as Art */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 800, delay: 200 }}
              style={styles.promptContainer}
            >
              <Text style={[styles.promptText, { color: colors.ink }]}>
                {t("home.prompt")}
                <Text style={[styles.italicText, { color: colors.accent }]}>{t("home.promptHighlight")}</Text>
              </Text>
            </MotiView>

            {/* Minimally Invasive Input */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 600, delay: 500 }}
              style={styles.inputWrapper}
            >
              <TextInput
                style={[styles.input, { color: colors.ink }]}
                placeholder={t("home.placeholder")}
                placeholderTextColor={colors.inkLight}
                value={goal}
                onChangeText={setGoal}
                onFocus={handleFocus}
                onBlur={handleBlur}
                multiline
                scrollEnabled={false}
              />
              <View style={[styles.inputLine, { backgroundColor: colors.ink }]} />
            </MotiView>

            {/* Smart Suggestions */}
            {matchingSuggestions.length > 0 && active && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.suggestionsContainer}
              >
                <View style={styles.suggestionsHeader}>
                  <Sparkles color={colors.rust} size={14} />
                  <Text style={[styles.suggestionsLabel, { color: colors.inkMuted }]}>Suggestions</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsList}>
                  {matchingSuggestions.map((suggestion, i) => (
                    <Pressable
                      key={suggestion}
                      style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.divider }]}
                      onPress={() => handleSelectSuggestion(suggestion)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.ink }]}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </MotiView>
            )}

            {/* Floating Action Button (Shows only when typing) */}
            {goal.length > 0 && (
              <MotiView
                from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                style={styles.fabContainer}
              >
                <Pressable
                  style={[styles.fab, { backgroundColor: colors.ink, shadowColor: colors.accent }]}
                  onPress={() => {
                    triggerLight();
                    Keyboard.dismiss();
                    router.push({ pathname: "/questionnaire", params: { goal: goal.trim() } });
                  }}
                >
                  <Text style={[styles.fabText, { color: colors.background }]}>{t("home.createBlueprint")}</Text>
                  <ArrowRight color={colors.background} size={20} />
                </Pressable>
              </MotiView>
            )}

            {/* Inspiration as footnote, not chips */}
            {!active && goal.length === 0 && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1000, duration: 800 }}
                style={styles.inspirationFooter}
              >
                <Text style={[styles.inspirationLabel, { color: colors.inkLight }]}>{t("home.observations")}</Text>
                <View style={styles.inspirationList}>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>{t("home.inspiration1")}</Text>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>{t("home.inspiration2")}</Text>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>{t("home.inspiration3")}</Text>
                </View>
              </MotiView>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 60,
  },
  logo: { width: 60, height: 30 },
  date: { ...Typography.sans.caption, fontSize: 13 },
  promptContainer: { marginBottom: 40 },
  promptText: {
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  italicText: { fontStyle: "italic", fontWeight: "400" },
  inputWrapper: { marginBottom: 24 },
  input: {
    fontSize: 20,
    lineHeight: 32,
    paddingVertical: 12,
    minHeight: 60,
    fontWeight: "400",
  },
  inputLine: { height: 1.5, marginTop: 4 },
  // Suggestions
  suggestionsContainer: { marginBottom: 20 },
  suggestionsHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  suggestionsLabel: { fontSize: 12, fontWeight: "500" },
  suggestionsList: { gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestionText: { fontSize: 14, fontWeight: "500" },
  // FAB
  fabContainer: { marginTop: 20 },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { fontSize: 16, fontWeight: "600" },
  // Inspiration
  inspirationFooter: { marginTop: "auto", paddingTop: 40 },
  inspirationLabel: { fontSize: 11, marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase" },
  inspirationList: { gap: 4 },
  inspirationItem: { fontSize: 14, lineHeight: 22 },
});
