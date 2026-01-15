import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan"; // Assuming Plan type exists here or I need to find where it is
import Tick from "./Tick";

interface PhaseSectionProps {
    plan: Plan;
    onToggleAction: (planId: string, phaseIndex: number, actionIndex: number, action: string) => void;
}

export default function PhaseSection({ plan, onToggleAction }: PhaseSectionProps) {
    const { colors, shadows } = useTheme();

    const phaseProgress = (i: number) => {
        const actions = plan.content.phases[i].keyActions;
        const done = actions.filter((_, ai) => plan.progress.phaseActions[i]?.[ai]).length;
        return { done, total: actions.length };
    };

    return (
        <View style={styles.sectionBody}>
            {plan.content.phases.map((phase, pi) => {
                const { done, total } = phaseProgress(pi);
                return (
                    <View
                        key={pi}
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface },
                            shadows.sm,
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.phaseNum, { backgroundColor: colors.rust }]}>
                                <Text style={styles.phaseNumText}>{pi + 1}</Text>
                            </View>
                            <View style={styles.phaseInfo}>
                                <Text style={[styles.phaseName, { color: colors.ink }]}>{phase.name}</Text>
                                <Text style={[styles.phaseDuration, { color: colors.inkFaint }]}>{phase.duration}</Text>
                            </View>
                            <Text style={[styles.phaseCount, { color: colors.inkMuted }]}>
                                {done}/{total}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.phaseObj,
                                { color: colors.inkSoft, borderColor: colors.divider },
                            ]}
                        >
                            {phase.objective}
                        </Text>
                        {phase.keyActions.map((action, ai) => {
                            const checked = plan.progress.phaseActions[pi]?.[ai] || false;
                            return (
                                <View key={ai} style={styles.itemRow}>
                                    <Tick
                                        on={checked}
                                        onPress={() => onToggleAction(plan.id, pi, ai, action)}
                                    />
                                    <Text
                                        style={[
                                            styles.itemText,
                                            { color: colors.ink },
                                            checked && { color: colors.inkFaint, textDecorationLine: "line-through" },
                                        ]}
                                    >
                                        {action}
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
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    phaseNum: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    phaseNumText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
    phaseInfo: { flex: 1 },
    phaseName: { fontSize: 16, fontWeight: "600" },
    phaseDuration: { fontSize: 13, marginTop: 2 },
    phaseCount: { fontSize: 13, fontWeight: "500" },
    phaseObj: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: 0.5,
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
