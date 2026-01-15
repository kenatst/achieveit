import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Flame, Check } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";

interface RoutineSectionProps {
    plan: Plan;
    onLogRoutine: (planId: string, routineIndex: number, routineName: string) => void;
}

export default function RoutineSection({ plan, onLogRoutine }: RoutineSectionProps) {
    const { colors, shadows } = useTheme();

    const routineToday = (i: number) => {
        const today = new Date().toISOString().split("T")[0];
        return plan.progress.routineHistory[i]?.includes(today) || false;
    };

    return (
        <View style={styles.sectionBody}>
            {plan.content.routines.map((routine, ri) => {
                const logged = routineToday(ri);
                const streak = plan.progress.routineHistory[ri]?.length || 0;
                return (
                    <View
                        key={ri}
                        style={[
                            styles.card,
                            { backgroundColor: colors.surface },
                            shadows.sm,
                        ]}
                    >
                        <View style={styles.routineHeader}>
                            <Text style={[styles.routineName, { color: colors.ink }]}>{routine.name}</Text>
                            <View style={[styles.streakBadge, { backgroundColor: colors.rustSoft }]}>
                                <Flame color={colors.rust} size={12} />
                                <Text style={[styles.streakNum, { color: colors.rust }]}>{streak}</Text>
                            </View>
                        </View>
                        <Text style={[styles.routineMeta, { color: colors.inkFaint }]}>
                            {routine.frequency} · {routine.duration}
                        </Text>
                        <Text style={[styles.routineDesc, { color: colors.inkSoft }]}>
                            {routine.description}
                        </Text>
                        <Pressable
                            style={[
                                styles.logBtn,
                                { backgroundColor: colors.rust },
                                logged && { backgroundColor: colors.sageSoft },
                            ]}
                            onPress={() => onLogRoutine(plan.id, ri, routine.name)}
                        >
                            {logged ? (
                                <>
                                    <Check color={colors.sage} size={16} />
                                    <Text style={[styles.logBtnText, { color: colors.sage }]}>Done today</Text>
                                </>
                            ) : (
                                <Text style={[styles.logBtnText, { color: "#FFFFFF" }]}>Mark as done</Text>
                            )}
                        </Pressable>
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
    routineHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    routineName: { fontSize: 16, fontWeight: "500", flex: 1 },
    streakBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    streakNum: { fontSize: 12, fontWeight: "600" },
    routineMeta: { fontSize: 13, marginBottom: 10 },
    routineDesc: { fontSize: 14, lineHeight: 22, marginBottom: 14 },
    logBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        borderRadius: 12,
        gap: 8,
    },
    logBtnText: { fontSize: 15, fontWeight: "600" },
});
