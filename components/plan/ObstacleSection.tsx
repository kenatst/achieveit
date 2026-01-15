import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";

interface ObstacleSectionProps {
    plan: Plan;
}

export default function ObstacleSection({ plan }: ObstacleSectionProps) {
    const { colors, shadows } = useTheme();

    return (
        <View style={styles.sectionBody}>
            {plan.content.obstacles.map((ob, i) => (
                <View
                    key={i}
                    style={[
                        styles.card,
                        { backgroundColor: colors.surface },
                        shadows.sm,
                    ]}
                >
                    <Text style={[styles.obstacleChallenge, { color: colors.ink }]}>{ob.challenge}</Text>
                    <View style={styles.block}>
                        <Text style={[styles.blockLabel, { color: colors.inkFaint }]}>Solution</Text>
                        <Text style={[styles.blockText, { color: colors.ink }]}>{ob.solution}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionBody: { marginTop: 12, gap: 12 },
    card: {
        borderRadius: 14,
        padding: 18,
    },
    obstacleChallenge: {
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 22,
        marginBottom: 14,
    },
    block: { marginBottom: 0 },
    blockLabel: {
        fontSize: 11,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    blockText: { fontSize: 15, lineHeight: 22 },
});
