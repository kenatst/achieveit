import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MessageCircle, MoreHorizontal } from "lucide-react-native";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import Typography from "@/constants/typography";
import { triggerSelection } from "@/utils/haptics";

// Components
import TabControl from "@/components/plan/TabControl";
import FocusView from "@/components/plan/FocusView";
import RoadmapView from "@/components/plan/RoadmapView";
import InsightView from "@/components/plan/InsightView";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 380; // Large, immersive header

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { plans } = usePlans();

  const [activeTab, setActiveTab] = useState<"FOCUS" | "ROADMAP" | "INSIGHT">("FOCUS");
  const scrollY = useRef(new Animated.Value(0)).current;

  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const progress = plan.progress.overallProgress;

  // Parallax Interpolations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  // Sticky Tab Bar Opacity (Glass effect kicks in when scrolled up)
  const tabOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* 1. Immersive Parallax Header (Behind Content) */}
      <Animated.View
        style={[
          styles.hero,
          {
            height: HEADER_HEIGHT,
            transform: [{ translateY: headerTranslateY }, { scale: headerScale }],
            opacity: headerOpacity,
          },
        ]}
      >
        {/* Grainy Texture / Abstract Background */}
        <View style={[styles.heroBackground, { backgroundColor: colors.surface }]} />
        <View style={[styles.heroOverlay, { backgroundColor: colors.backgroundDeep + "80" }]} />

        <SafeAreaView style={styles.heroContent}>
          {/* Ring */}
          <View style={[styles.ringContainer, { borderColor: colors.rust + "40" }]}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 1000 }}
              style={[
                styles.ring,
                {
                  borderColor: colors.rust,
                  // Simple visual hack for progress ring, ideally SVG
                  borderRightColor: progress < 25 ? "transparent" : colors.rust,
                  borderBottomColor: progress < 50 ? "transparent" : colors.rust,
                  borderLeftColor: progress < 75 ? "transparent" : colors.rust,
                }
              ]}
            >
              <Text style={[styles.heroPercent, { color: colors.rust }]}>{progress}%</Text>
            </MotiView>
          </View>

          {/* Title */}
          <Text style={[styles.heroTitle, { color: colors.ink }]}>{plan.content.title}</Text>
          <Text style={[styles.heroQuote, { color: colors.inkMedium }]}>
            "{plan.content.motivationalQuote}"
          </Text>
        </SafeAreaView>
      </Animated.View>

      {/* 2. Scrollable Content (Executive Brief) */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sticky Tab Container */}
        <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
          <TabControl
            tabs={["FOCUS", "ROADMAP", "INSIGHT"]}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t as any)}
          />
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          <MotiView
            key={activeTab}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
          >
            {activeTab === "FOCUS" && <FocusView plan={plan} />}
            {activeTab === "ROADMAP" && <RoadmapView plan={plan} />}
            {activeTab === "INSIGHT" && <InsightView plan={plan} />}
          </MotiView>
        </View>

      </Animated.ScrollView>

      {/* 3. Sticky Header (Appears on Scroll) */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { opacity: tabOpacity }
        ]}
      >
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <View style={[styles.stickyContent, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.stickyTitle, { color: colors.ink }]} numberOfLines={1}>
            {plan.content.title}
          </Text>
          {/* Small Tab Indicators could go here */}
        </View>
      </Animated.View>

      {/* 4. Navigation Icons (Fixed) */}
      <SafeAreaView style={styles.navOverlay} pointerEvents="box-none">
        <View style={styles.navRow}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.background + "80" }]}
            onPress={() => router.back()}
          >
            <ArrowLeft color={colors.ink} size={24} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.rust, marginRight: 12 }]}
            onPress={() => router.push({ pathname: "/coach" as any, params: { planId: plan.id } })}
          >
            <MessageCircle color="#FFF" size={24} strokeWidth={2} />
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.background + "80" }]}
            onPress={() => router.push(`/plan/${id}/actions` as any)}
          >
            <MoreHorizontal color={colors.ink} size={24} />
          </Pressable>
        </View>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },

  // Hero
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 40, // Push down a bit
  },
  heroTitle: {
    ...Typography.display.hero,
    fontSize: 36, // Slightly smaller than huge
    textAlign: "center",
    marginBottom: 16,
  },
  heroQuote: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 24,
  },

  // Ring
  ringContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPercent: {
    fontSize: 28,
    fontWeight: "300",
  },

  // Content
  tabContainer: {
    paddingTop: 24,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // Overlap the hero slightly
    minHeight: SCREEN_HEIGHT, // Ensure it fills screen
  },
  contentArea: {
    paddingHorizontal: 0, // Full width for content views
  },

  // Nav
  navOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  navRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    // Glassy look
    backdropFilter: "blur(10px)",
  },

  // Sticky Header
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Roughly standard header + status bar
    zIndex: 10,
  },
  stickyContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 16,
    paddingHorizontal: 60, // Space for back button
    justifyContent: "center",
    borderBottomWidth: 0.5,
  },
  stickyTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
});
