import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    StatusBar,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowRight } from "lucide-react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Typography from "@/constants/typography";

const ONBOARDING_KEY = "has_completed_onboarding_v1";

export default function OnboardingScreen() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const [current, setCurrent] = useState(0);
    const router = useRouter();

    const slides = [
        {
            id: 1,
            line1: t("onboarding.slide1_line1"),
            line2: t("onboarding.slide1_line2"),
            line3: t("onboarding.slide1_line3"),
            body: t("onboarding.slide1_body"),
            action: t("onboarding.slide1_action"),
        },
        {
            id: 2,
            line1: t("onboarding.slide2_line1"),
            line2: t("onboarding.slide2_line2"),
            line3: t("onboarding.slide2_line3"),
            body: t("onboarding.slide2_body"),
            action: t("onboarding.slide2_action"),
        },
        {
            id: 3,
            line1: t("onboarding.slide3_line1"),
            line2: t("onboarding.slide3_line2"),
            line3: t("onboarding.slide3_line3"),
            body: t("onboarding.slide3_body"),
            action: t("onboarding.slide3_action"),
        },
    ];

    const nextStep = async () => {
        if (current < slides.length - 1) {
            setCurrent(current + 1);
        } else {
            await AsyncStorage.setItem(ONBOARDING_KEY, "true");
            router.replace("/(tabs)");
        }
    };

    const slide = slides[current];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView style={styles.safeArea}>

                {/* Progress Line (Top) */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressWrapper, { backgroundColor: colors.divider }]}>
                        <MotiView
                            animate={{ width: `${((current + 1) / slides.length) * 100}%` }}
                            transition={{ type: "timing", duration: 500 }}
                            style={[styles.progressBar, { backgroundColor: colors.ink }]}
                        />
                    </View>
                    <Image
                        source={require("@/assets/images/logo.png")}
                        style={styles.logoTop}
                        resizeMode="contain"
                    />
                    <Text style={[styles.stepIndicator, { color: colors.ink }]}>0{current + 1}</Text>
                </View>

                {/* Cinematic Content Area */}
                <AnimatePresence exitBeforeEnter>
                    <MotiView
                        key={`slide-${slide.id}`}
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "timing", duration: 300 }}
                        style={styles.content}
                    >

                        {/* Main Headline */}
                        <View style={styles.headlineContainer}>
                            <View style={styles.lineWrapper}>
                                <MotiText
                                    from={{ opacity: 0, translateY: 40 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ type: "timing", duration: 800, delay: 100 }}
                                    style={[styles.heroText, { color: colors.ink }]}
                                >
                                    {slide.line1}
                                </MotiText>
                            </View>

                            <View style={styles.lineWrapper}>
                                <MotiText
                                    from={{ opacity: 0, translateY: 40 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ type: "timing", duration: 800, delay: 250 }}
                                    style={[styles.heroText, styles.italicText, { color: colors.accent }]}
                                >
                                    {slide.line2}
                                </MotiText>
                            </View>

                            <View style={styles.lineWrapper}>
                                <MotiText
                                    from={{ opacity: 0, translateY: 40 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ type: "timing", duration: 800, delay: 400 }}
                                    style={[styles.heroText, { color: colors.ink }]}
                                >
                                    {slide.line3}
                                </MotiText>
                            </View>
                        </View>

                        {/* Body Text */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "timing", duration: 1000, delay: 600 }}
                            style={styles.bodyContainer}
                        >
                            <View style={[styles.divider, { backgroundColor: colors.accent }]} />
                            <Text style={[styles.bodyText, { color: colors.inkMedium }]}>{slide.body}</Text>
                        </MotiView>

                        {/* Magnetic Button */}
                        <Pressable onPress={nextStep} style={styles.buttonWrapper}>
                            <MotiView
                                from={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", delay: 800 }}
                                style={[styles.mainButton, { backgroundColor: colors.ink, shadowColor: colors.accent }]}
                            >
                                <Text style={[styles.buttonText, { color: colors.background }]}>{slide.action}</Text>
                                <ArrowRight color={colors.background} size={20} />
                            </MotiView>
                        </Pressable>

                    </MotiView>
                </AnimatePresence>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: "space-between",
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
    },
    progressWrapper: {
        flex: 1,
        height: 1,
        marginRight: 16,
    },
    progressBar: {
        height: 1,
    },
    stepIndicator: {
        fontSize: 15,
        fontWeight: "600",
    },
    logoTop: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    headlineContainer: {
        marginBottom: 40,
    },
    lineWrapper: {
        overflow: "hidden",
        marginBottom: -8,
    },
    heroText: {
        ...Typography.display.hero,
        fontSize: 56,
        lineHeight: 62,
    },
    italicText: {
        ...Typography.display.italic,
    },
    bodyContainer: {
        marginTop: "auto",
        marginBottom: 40,
    },
    divider: {
        width: 40,
        height: 2,
        marginBottom: 24,
    },
    bodyText: {
        ...Typography.sans.body,
        fontSize: 20,
        lineHeight: 30,
    },
    buttonWrapper: {
        marginBottom: 24,
    },
    mainButton: {
        height: 64,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    buttonText: {
        ...Typography.sans.label,
        fontSize: 16,
    },
});
