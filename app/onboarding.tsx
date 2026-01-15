import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import Typography from "@/constants/typography";
import { ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "has_completed_onboarding_v1";

const slides = [
    {
        id: 1,
        // "Manifesto" style copy
        line1: "Ambition",
        line2: "is merely",
        line3: "a suggestion.",
        body: "Until you write it down. Until you break it. Until you turn the impossible into a Tuesday morning routine.",
        action: "Begin",
    },
    {
        id: 2,
        line1: "Chaos",
        line2: "is the",
        line3: "enemy.",
        body: "We structure your vision into a relentless roadmap. Days, weeks, months. Every step calculated. Every win inevitable.",
        action: "Structure",
    },
    {
        id: 3,
        line1: "Become",
        line2: "who you",
        line3: "must be.",
        body: "This isn't a to-do list. It's an architectural blueprint for your future self. The time to build is now.",
        action: "Execute",
    },
];

export default function OnboardingScreen() {
    const [current, setCurrent] = useState(0);
    const router = useRouter();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const line1Anim = useRef(new Animated.Value(0)).current;
    const line2Anim = useRef(new Animated.Value(0)).current;
    const line3Anim = useRef(new Animated.Value(0)).current;
    const bodyAnim = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        playEntrance();
    }, [current]);

    const playEntrance = () => {
        // Reset values
        line1Anim.setValue(0);
        line2Anim.setValue(0);
        line3Anim.setValue(0);
        bodyAnim.setValue(0);

        // Staggered reveal
        Animated.stagger(150, [
            Animated.timing(line1Anim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(line2Anim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(line3Anim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(bodyAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }),
        ]).start();
    };

    const nextStep = async () => {
        if (current < slides.length - 1) {
            // Exit animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCurrent(current + 1);
                fadeAnim.setValue(1);
            });
        } else {
            await AsyncStorage.setItem(ONBOARDING_KEY, "true");
            router.replace("/(tabs)");
        }
    };

    const slide = slides[current];

    // Interpolated styles for text slide-up effect
    const translateY = (anim: Animated.Value) => anim.interpolate({
        inputRange: [0, 1],
        outputRange: [40, 0],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>

                {/* Progress Line (Top) - Very minimal */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressWrapper}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                { width: `${((current + 1) / slides.length) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.stepIndicator}>0{current + 1}</Text>
                </View>

                {/* Cinematic Content Area */}
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

                    {/* Main Headline - Massive, Staggered */}
                    <View style={styles.headlineContainer}>
                        <View style={styles.lineWrapper}>
                            <Animated.Text style={[styles.heroText, {
                                opacity: line1Anim,
                                transform: [{ translateY: translateY(line1Anim) }]
                            }]}>
                                {slide.line1}
                            </Animated.Text>
                        </View>

                        <View style={styles.lineWrapper}>
                            <Animated.Text style={[styles.heroText, styles.italicText, {
                                opacity: line2Anim,
                                transform: [{ translateY: translateY(line2Anim) }]
                            }]}>
                                {slide.line2}
                            </Animated.Text>
                        </View>

                        <View style={styles.lineWrapper}>
                            <Animated.Text style={[styles.heroText, {
                                opacity: line3Anim,
                                transform: [{ translateY: translateY(line3Anim) }]
                            }]}>
                                {slide.line3}
                            </Animated.Text>
                        </View>
                    </View>

                    {/* Body Text - Architectural, Bottom aligned */}
                    <Animated.View style={[styles.bodyContainer, { opacity: bodyAnim }]}>
                        <View style={styles.divider} />
                        <Text style={styles.bodyText}>{slide.body}</Text>
                    </Animated.View>

                    {/* Magnetic Button */}
                    <Pressable
                        onPress={nextStep}
                        onPressIn={() => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start()}
                        onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
                        style={styles.buttonWrapper}
                    >
                        <Animated.View style={[styles.mainButton, { transform: [{ scale: btnScale }] }]}>
                            <Text style={styles.buttonText}>{slide.action}</Text>
                            <ArrowRight color={Colors.light.background} size={20} />
                        </Animated.View>
                    </Pressable>

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
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
    },
    progressWrapper: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.light.divider,
        marginRight: 16,
    },
    progressBar: {
        height: 1,
        backgroundColor: Colors.light.ink,
    },
    stepIndicator: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.light.ink,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60, // Push content down for drama
    },
    headlineContainer: {
        marginBottom: 40,
    },
    lineWrapper: {
        overflow: "hidden", // Masks the text sliding up
        marginBottom: -8, // Tight leading for impact
    },
    heroText: {
        ...Typography.display.hero,
        fontSize: 56, // Massive
        lineHeight: 62,
        color: Colors.light.ink,
    },
    italicText: {
        ...Typography.display.italic,
        color: Colors.light.accent, // Vermilion for emphasis
    },
    bodyContainer: {
        marginTop: "auto", // Pushes to bottom
        marginBottom: 40,
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: Colors.light.accent,
        marginBottom: 24,
    },
    bodyText: {
        ...Typography.sans.body,
        fontSize: 20,
        lineHeight: 30,
        color: Colors.light.inkMedium,
    },
    buttonWrapper: {
        marginBottom: 24,
    },
    mainButton: {
        height: 64, // Taller, more substantial
        backgroundColor: Colors.light.ink,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        shadowColor: Colors.light.accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    buttonText: {
        ...Typography.sans.label,
        color: Colors.light.background,
        fontSize: 16,
    },
});
