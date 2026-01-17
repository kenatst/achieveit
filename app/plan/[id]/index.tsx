import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import FocusView from "@/components/plan/FocusView"; // Reuse the component logic but wrapper is different

export default function PlanFocusScreen() {
    const { id } = useLocalSearchParams();
    const { plans } = usePlans();
    const { colors } = useTheme();

    const plan = plans.find((p) => p.id === id);

    if (!plan) return null;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Hero Section for Focus */}
            <View style={styles.hero}>
                <Text style={[styles.heroLabel, { color: colors.rust }]}>CURRENT OBJECTIVE</Text>
                <Text style={[styles.heroTitle, { color: colors.ink }]}>
                    {plan.content.weeklyPlans[0]?.focus || "Establish Routine"}
                </Text>
            </View>

            {/* The Main Content */}
            <FocusView plan={plan} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 120, // Space for Header
        paddingBottom: 100, // Space for Tabs
    },
    hero: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    heroLabel: {
        ...Typography.sans.label,
        marginBottom: 12,
    },
    heroTitle: {
        ...Typography.display.hero, // Huge Serif
        fontSize: 36,
        lineHeight: 42,
    }
});
