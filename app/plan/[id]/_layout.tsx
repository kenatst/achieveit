import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, Pressable, Text, Platform } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Route, MessageSquare, Target, ArrowLeft } from "lucide-react-native";
import { BlurView } from "expo-blur";
import Typography from "@/constants/typography";

export default function PlanLayout() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // Masterclass Bottom Bar: Floating Pill Design
                tabBarStyle: {
                    position: "absolute",
                    bottom: 30, // Floating
                    left: 20,
                    right: 20,
                    backgroundColor: isDark ? "rgba(20,20,20,0.85)" : "rgba(255,255,255,0.85)",
                    borderRadius: 30,
                    height: 64, // Elegant height
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    elevation: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                },
                // We use a custom background to addBlur
                tabBarBackground: () => (
                    <BlurView
                        intensity={80}
                        tint={isDark ? "dark" : "light"}
                        style={[StyleSheet.absoluteFill, { borderRadius: 30, overflow: 'hidden' }]}
                    />
                ),
                tabBarActiveTintColor: colors.rust,
                tabBarInactiveTintColor: colors.inkMuted,
                tabBarShowLabel: false, // We hide labels for "Iconic" look, or custom render them
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <NavBarItem
                            icon={<Route size={24} color={color} strokeWidth={focused ? 2.5 : 2} />}
                            label="BLUEPRINT"
                            focused={focused}
                            color={color}
                        />
                    ),
                    headerShown: true,
                    header: () => <PlanHeader title="The Blueprint" />, // Roadmap is now Home
                }}
            />

            <Tabs.Screen
                name="coach"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <NavBarItem
                            icon={<MessageSquare size={24} color={color} strokeWidth={focused ? 2.5 : 2} />}
                            label="ADVISOR"
                            focused={focused}
                            color={color}
                        />
                    ),
                    headerShown: true,
                    header: () => <PlanHeader title="Advisor" />,
                }}
            />

            <Tabs.Screen
                name="focus"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <NavBarItem
                            icon={<Target size={24} color={color} strokeWidth={focused ? 2.5 : 2} />}
                            label="SPRINT"
                            focused={focused}
                            color={color}
                        />
                    ),
                    headerShown: true,
                    header: () => <PlanHeader title="Sprint" />,
                }}
            />

        </Tabs>
    );
}

// Custom Tab Item Component for "Masterclass" feel
function NavBarItem({ icon, label, focused, color }: any) {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4, top: Platform.OS === 'ios' ? 12 : 0 }}>
            {icon}
            {focused && (
                <Text style={{
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    color: color,
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' // Keep UI clean
                }}>
                    {label}
                </Text>
            )}
        </View>
    )
}

function PlanHeader({ title }: { title: string }) {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    return (
        <View style={{ height: 110, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
            <BlurView
                intensity={isDark ? 90 : 95}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.headerContent}>
                <Pressable
                    style={[styles.closeBtn, { backgroundColor: colors.background + '80' }]}
                    onPress={() => router.replace("/(tabs)/plans" as any)}
                    hitSlop={20}
                >
                    <ArrowLeft color={colors.ink} size={20} />
                </Pressable>

                <Text style={[styles.headerTitle, { color: colors.ink }]}>{title}</Text>

                <View style={{ width: 36 }} />
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
        ...Typography.display.h2,
        fontSize: 18,
        letterSpacing: -0.2, // Tighter for elegance
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    }
})
