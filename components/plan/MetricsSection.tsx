import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";
import Tick from "./Tick";

interface MetricsSectionProps {
    plan: Plan;
    onToggleMetric: (planId: string, metricIndex: number, metric: string) => void;
}

export default function MetricsSection({ plan, onToggleMetric }: MetricsSectionProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.sectionBody}>
            {plan.content.successMetrics.map((metric, mi) => {
                const checked = plan.progress.successMetrics[mi] || false;
                return (
                    <View key={mi} style={styles.itemRow}>
                        <Tick
                            on={checked}
                            onPress={() => onToggleMetric(plan.id, mi, metric)}
                        />
                        <Text
                            style={[
                                styles.itemText,
                                { color: colors.ink },
                                checked && { color: colors.inkFaint, textDecorationLine: "line-through" },
                            ]}
                        >
                            {metric}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionBody: { marginTop: 12, gap: 12 },
    itemRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
});
