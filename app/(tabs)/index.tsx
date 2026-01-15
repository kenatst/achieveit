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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import Typography from "@/constants/typography";
import HelpTip from "@/components/HelpTip";
import { TIPS } from "@/constants/tips";

export default function HomeScreen() {
  const [goal, setGoal] = useState("");
  const [active, setActive] = useState(false);
  const router = useRouter();

  const focusAnim = useRef(new Animated.Value(0)).current;

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

  const bgStyle = {
    backgroundColor: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.light.background, Colors.light.surface],
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
            <View style={styles.header}>
              <Text style={styles.label}>Manifesto</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
            </View>

            {/* The Question as Art */}
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>
                What is your
                <Text style={styles.italicText}> great work?</Text>
              </Text>
            </View>

            {/* Minimally Invasive Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Write your intention..."
                placeholderTextColor={Colors.light.inkLight}
                value={goal}
                onChangeText={setGoal}
                onFocus={handleFocus}
                onBlur={handleBlur}
                multiline
                scrollEnabled={false}
              />
              <View style={styles.inputLine} />
            </View>

            {/* Floating Action Button (Shows only when typing) */}
            {goal.length > 0 && (
              <Animated.View style={styles.fabContainer}>
                <Pressable
                  style={styles.fab}
                  onPress={() => {
                    Keyboard.dismiss();
                    router.push({ pathname: "/questionnaire", params: { goal: goal.trim() } });
                  }}
                >
                  <Text style={styles.fabText}>Create Blueprint</Text>
                  <ArrowRight color={Colors.light.background} size={20} />
                </Pressable>
              </Animated.View>
            )}

            {/* Inspiration as footnote, not chips */}
            {!active && goal.length === 0 && (
              <View style={styles.inspirationFooter}>
                <Text style={styles.inspirationLabel}>Observations:</Text>
                <View style={styles.inspirationList}>
                  <Text style={styles.inspirationItem}>• Build a media empire</Text>
                  <Text style={styles.inspirationItem}>• Run the Tokyo Marathon</Text>
                  <Text style={styles.inspirationItem}>• Learn Classical Piano</Text>
                </View>
              </View>
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
    borderBottomColor: Colors.light.divider,
    paddingBottom: 16,
    marginBottom: 60,
  },
  label: {
    ...Typography.sans.label,
    color: Colors.light.ink,
  },
  date: {
    ...Typography.sans.caption,
    fontSize: 13,
    color: Colors.light.inkMedium,
  },
  promptContainer: {
    marginBottom: 40,
  },
  promptText: {
    ...Typography.display.hero,
    fontSize: 48,
    lineHeight: 56,
    color: Colors.light.ink,
  },
  italicText: {
    ...Typography.display.italic,
    color: Colors.light.accent,
  },
  inputWrapper: {
    marginBottom: 40,
    flex: 1,
  },
  input: {
    ...Typography.display.h2,
    color: Colors.light.ink,
    minHeight: 60,
    paddingBottom: 16,
    textAlignVertical: "top",
  },
  inputLine: {
    height: 1,
    backgroundColor: Colors.light.ink,
    opacity: 0.2,
  },
  fabContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  fab: {
    backgroundColor: Colors.light.ink,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  fabText: {
    ...Typography.sans.label,
    color: Colors.light.background,
  },
  inspirationFooter: {
    marginBottom: 20,
  },
  inspirationLabel: {
    ...Typography.sans.caption,
    marginBottom: 12,
    color: Colors.light.inkLight,
    textTransform: "uppercase",
  },
  inspirationList: {
    gap: 8,
  },
  inspirationItem: {
    ...Typography.sans.body,
    fontSize: 16,
    color: Colors.light.inkMedium,
    fontStyle: "italic", // Hand-written note feel
    fontFamily: Platform.select({ ios: "Georgia-Italic", android: "serif" }),
  },
});
