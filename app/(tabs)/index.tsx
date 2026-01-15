import React, { useState, useRef } from "react";
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
import { ArrowRight } from "lucide-react-native";
import { MotiView, MotiText } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import HelpTip from "@/components/HelpTip";
import { TIPS } from "@/constants/tips";

export default function HomeScreen() {
  const { colors } = useTheme();
  const [goal, setGoal] = useState("");
  const [active, setActive] = useState(false);
  const router = useRouter();

  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setActive(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false, // Colors don't support native driver
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
              <Text style={[styles.date, { color: colors.inkMedium }]}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
            </MotiView>

            {/* The Question as Art */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 800, delay: 200 }}
              style={styles.promptContainer}
            >
              <Text style={[styles.promptText, { color: colors.ink }]}>
                What is your
                <Text style={[styles.italicText, { color: colors.accent }]}> great work?</Text>
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
                placeholder="Write your intention..."
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
                    Keyboard.dismiss();
                    router.push({ pathname: "/questionnaire", params: { goal: goal.trim() } });
                  }}
                >
                  <Text style={[styles.fabText, { color: colors.background }]}>Create Blueprint</Text>
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
                <Text style={[styles.inspirationLabel, { color: colors.inkLight }]}>Observations:</Text>
                <View style={styles.inspirationList}>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>• Build a media empire</Text>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>• Run the Tokyo Marathon</Text>
                  <Text style={[styles.inspirationItem, { color: colors.inkMedium }]}>• Learn Classical Piano</Text>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    justifyContent: "space-between", // Pushes footer down
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 60,
  },
  label: {
    ...Typography.sans.label,
  },
  date: {
    ...Typography.sans.caption,
    fontSize: 13,
  },
  promptContainer: {
    marginBottom: 40,
  },
  promptText: {
    ...Typography.display.hero,
    fontSize: 48,
    lineHeight: 56,
  },
  italicText: {
    ...Typography.display.italic,
  },
  inputWrapper: {
    marginBottom: 40,
    flex: 1,
  },
  input: {
    ...Typography.display.h2,
    minHeight: 60,
    paddingBottom: 16,
    textAlignVertical: "top",
  },
  inputLine: {
    height: 1,
    opacity: 0.2,
  },
  fabContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  fab: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  fabText: {
    ...Typography.sans.label,
  },
  inspirationFooter: {
    marginBottom: 20,
  },
  inspirationLabel: {
    ...Typography.sans.caption,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  inspirationList: {
    gap: 8,
  },
  inspirationItem: {
    ...Typography.sans.body,
    fontSize: 16,
    fontStyle: "italic", // Hand-written note feel
    fontFamily: Platform.select({ ios: "Georgia-Italic", android: "serif" }),
  },
  logo: {
    width: 60,
    height: 30,
  },
});
