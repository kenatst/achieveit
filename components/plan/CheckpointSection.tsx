import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";
import Tick from "./Tick";

interface CheckpointSectionProps {
    plan: Plan;
    onToggleCheckpoint: (planId: string, day: "day30" | "day60" | "day90", itemIndex: number, item: string) => void;
}

export default function CheckpointSection({ plan, onToggleCheckpoint }: CheckpointSectionProps) {
    const { colors, shadows } = useTheme();

    return (
        <View style={styles.sectionBody}>
            {(["day30", "day60", "day90"] as const).map(day => {
                const items = plan.content.checkpoints[day];
                const num = day.replace("day", "");
                return (
                    <View
                        key={day}
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface },
                            shadows.sm,
                        ]}
                    >
                        <Text style={[styles.checkpointDay, { color: colors.rust }]}>Day {num}</Text>
                        {items.map((item, ii) => {
                            const checked = plan.progress.checkpoints[day][ii] || false;
                            return (
                                <View key={ii} style={styles.itemRow}>
                                    <Tick
                                        on={checked}
                                        onPress={() => onToggleCheckpoint(plan.id, day, ii, item)}
                                    />
                                    <Text
                                        style={[
                                            styles.itemText,
                                            { color: colors.ink },
                                            checked && { color: colors.inkFaint, textDecorationLine: "line-through" },
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionBody: { marginTop: 12, gap: 12 },
    card: {
        borderRadius: 14,
        padding: 18,
    },
    checkpointDay: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 14,
    },
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
