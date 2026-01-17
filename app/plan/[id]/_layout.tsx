import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Map, BarChart2, X, Settings } from "lucide-react-native";
import { BlurView } from "expo-blur";

export default function PlanLayout() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 88,
                    paddingTop: 8,
                    paddingBottom: 28,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={80}
                        tint={isDark ? "dark" : "light"}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarActiveTintColor: colors.rust,
                tabBarInactiveTintColor: colors.inkMuted,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: 4,
                },
                tabBarShowLabel: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "FOCUS",
                    tabBarIcon: ({ color }) => <Target color={color} size={22} strokeWidth={2} />,
                    // Custom Header for the "OS" feel
                    headerShown: true,
                    header: () => (
                        <PlanHeader title="Focus" />
                    )
                }}
            />

            <Tabs.Screen
                name="roadmap"
                options={{
                    title: "ROADMAP",
                    tabBarIcon: ({ color }) => <Map color={color} size={22} strokeWidth={2} />,
                    headerShown: true,
                    header: () => (
                        <PlanHeader title="Roadmap" />
                    )
                }}
            />

            <Tabs.Screen
                name="insight"
                options={{
                    title: "INSIGHT",
                    tabBarIcon: ({ color }) => <BarChart2 color={color} size={22} strokeWidth={2} />,
                    headerShown: true,
                    header: () => (
                        <PlanHeader title="Insight" />
                    )
                }}
            />

        </Tabs>
    );
}

// Custom Header Component for the "Plan OS"
function PlanHeader({ title }: { title: string }) {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    return (
        <View style={{ height: 110, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
            <BlurView
                intensity={isDark ? 50 : 80}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.headerContent}>
                <View style={{ width: 40 }} />
                <Text style={[styles.headerTitle, { color: colors.ink }]}>{title}</Text>

                <Pressable
                    style={[styles.closeBtn, { backgroundColor: colors.background + '80' }]}
                    onPress={() => router.replace("/(tabs)/plans" as any)} // Exit the "OS"
                >
                    <X color={colors.ink} size={20} />
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.5,
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
