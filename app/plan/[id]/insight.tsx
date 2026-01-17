import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import InsightView from "@/components/plan/InsightView";

export default function PlanInsightScreen() {
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
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.ink }]}>Performance</Text>
            </View>

            <InsightView plan={plan} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 120,
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        ...Typography.display.h1,
        fontSize: 32,
    }
});
