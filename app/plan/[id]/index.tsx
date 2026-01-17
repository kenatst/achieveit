import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import RoadmapView from "@/components/plan/RoadmapView";

export default function PlanRoadmapScreen() {
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
                <Text style={[styles.subtitle, { color: colors.inkMedium }]}>
                    Your continuous path to success.
                </Text>
            </View>

            <RoadmapView plan={plan} />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 120, // Space for Header
        paddingBottom: 120, // Space for Floating Nav
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    subtitle: {
        ...Typography.sans.body,
        fontSize: 16,
        fontStyle: "italic",
    }
});
