import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lightTap } from "@/utils/haptics";
import HelpTip from "@/components/HelpTip";
import { TIPS } from "@/constants/tips";

// Smart suggestions based on common goals
const SUGGESTIONS = {
  en: [
    { text: "Learn a new language", icon: "🗣️" },
    { text: "Run a marathon", icon: "🏃" },
    { text: "Launch a business", icon: "🚀" },
    { text: "Master an instrument", icon: "🎹" },
    { text: "Write a book", icon: "📖" },
    { text: "Get in shape", icon: "💪" },
  ],
  fr: [
    { text: "Apprendre une langue", icon: "🗣️" },
    { text: "Courir un marathon", icon: "🏃" },
    { text: "Lancer un business", icon: "🚀" },
    { text: "Maîtriser un instrument", icon: "🎹" },
    { text: "Écrire un livre", icon: "📖" },
    { text: "Se remettre en forme", icon: "💪" },
  ],
  es: [
    { text: "Aprender un idioma", icon: "🗣️" },
    { text: "Correr un maratón", icon: "🏃" },
    { text: "Lanzar un negocio", icon: "🚀" },
    { text: "Dominar un instrumento", icon: "🎹" },
    { text: "Escribir un libro", icon: "📖" },
    { text: "Ponerse en forma", icon: "💪" },
  ],
  de: [
    { text: "Eine Sprache lernen", icon: "🗣️" },
    { text: "Einen Marathon laufen", icon: "🏃" },
    { text: "Ein Unternehmen gründen", icon: "🚀" },
    { text: "Ein Instrument meistern", icon: "🎹" },
    { text: "Ein Buch schreiben", icon: "📖" },
    { text: "In Form kommen", icon: "💪" },
  ],
  it: [
    { text: "Imparare una lingua", icon: "🗣️" },
    { text: "Correre una maratona", icon: "🏃" },
    { text: "Avviare un business", icon: "🚀" },
    { text: "Padroneggiare uno strumento", icon: "🎹" },
    { text: "Scrivere un libro", icon: "📖" },
    { text: "Rimettersi in forma", icon: "💪" },
  ],
};

export default function HomeScreen() {
  const { colors, shadows } = useTheme();
  const { t, locale } = useLanguage();
  const [goal, setGoal] = useState("");
  const [active, setActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const focusAnim = useRef(new Animated.Value(0)).current;

  const suggestions = useMemo(() => {
    return SUGGESTIONS[locale as keyof typeof SUGGESTIONS] || SUGGESTIONS.en;
  }, [locale]);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!goal.trim()) return suggestions.slice(0, 4);
    const query = goal.toLowerCase();
    return suggestions.filter(s =>
      s.text.toLowerCase().includes(query)
    ).slice(0, 3);
  }, [goal, suggestions]);

  const handleFocus = () => {
    setActive(true);
    setShowSuggestions(true);
    lightTap();
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
    if (!goal) {
      setActive(false);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSuggestionPress = (text: string) => {
    lightTap();
    setGoal(text);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!goal.trim()) return;
    lightTap();
    router.push({ pathname: "/questionnaire", params: { goal: goal.trim() } });
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
            {/* Header */}
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

            {/* Prompt */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 800, delay: 200 }}
              style={styles.promptContainer}
            >
              <Text style={[styles.promptText, { color: colors.ink }]}>
                {t("home.prompt")}
              </Text>
              <Text style={[styles.promptHighlight, { color: colors.rust }]}>
                {t("home.promptHighlight")}
              </Text>
            </MotiView>

            {/* Input */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 400 }}
              style={styles.inputSection}
            >
              <View style={[styles.inputCard, { backgroundColor: colors.surface }, shadows.card]}>
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  placeholder={t("home.placeholder")}
                  placeholderTextColor={colors.inkFaint}
                  value={goal}
                  onChangeText={setGoal}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  multiline
                  maxLength={200}
                />
              </View>

              {/* Smart Suggestions */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                    transition={{ type: 'timing', duration: 200 }}
                    style={styles.suggestionsContainer}
                  >
                    <View style={styles.suggestionsHeader}>
                      <Sparkles color={colors.rust} size={14} />
                      <Text style={[styles.suggestionsLabel, { color: colors.inkMuted }]}>
                        {t("home.observations") || "Suggestions"}
                      </Text>
                    </View>
                    <View style={styles.suggestionsPills}>
                      {filteredSuggestions.map((suggestion, index) => (
                        <MotiView
                          key={suggestion.text}
                          from={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 50 }}
                        >
                          <Pressable
                            style={[
                              styles.suggestionPill,
                              { backgroundColor: colors.background, borderColor: colors.divider }
                            ]}
                            onPress={() => handleSuggestionPress(suggestion.text)}
                          >
                            <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                            <Text style={[styles.suggestionText, { color: colors.ink }]}>
                              {suggestion.text}
                            </Text>
                          </Pressable>
                        </MotiView>
                      ))}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: goal.trim() ? 1 : 0.4 }}
                transition={{ type: 'timing', duration: 200 }}
              >
                <Pressable
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.rust },
                    !goal.trim() && { backgroundColor: colors.divider }
                  ]}
                  onPress={handleSubmit}
                  disabled={!goal.trim()}
                >
                  <Text style={styles.submitBtnText}>{t("home.createBlueprint")}</Text>
                  <ArrowRight color="#FFFFFF" size={20} />
                </Pressable>
              </MotiView>
            </MotiView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 40,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
  },
  promptContainer: {
    marginBottom: 40,
  },
  promptText: {
    fontSize: 36,
    fontWeight: "300",
    letterSpacing: -1,
    lineHeight: 44,
  },
  promptHighlight: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 44,
  },
  inputSection: {
    gap: 20,
  },
  inputCard: {
    borderRadius: 20,
    padding: 20,
  },
  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 80,
    textAlignVertical: "top",
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  suggestionIcon: {
    fontSize: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
