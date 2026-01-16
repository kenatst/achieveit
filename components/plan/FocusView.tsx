import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Check, RefreshCw, Calendar, ArrowRight } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { triggerSuccess, triggerLight } from "@/utils/haptics";
import Typography from "@/constants/typography";

export default function FocusView({ plan }: { plan: any }) {
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { logRoutine } = usePlans();

    const todayStr = new Date().toISOString().split("T")[0];

    // Today's routines
    const routines = plan.content.routines.map((routine: any, ri: number) => ({
        ...routine,
        index: ri,
        completed: plan.progress.routineHistory[ri]?.includes(todayStr) || false,
    }));

    const sortedRoutines = [...routines].sort((a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1
    );

    const handleLog = (index: number, name: string) => {
        triggerSuccess();
        logRoutine(plan.id, index, name);
    };

    return (
        <View style={styles.container}>

            {/* Today's Agenda Header */}
            <View style={styles.header}>
                <Text style={[styles.dateLabel, { color: colors.rust }]}>TODAY</Text>
                <Text style={[styles.title, { color: colors.ink }]}>Priority Checklist</Text>
                <Text style={[styles.subtitle, { color: colors.inkMedium }]}>
                    Complete daily routines to build momentum.
                </Text>
            </View>

            {/* Routines List */}
            <View style={styles.list}>
                {sortedRoutines.map((routine) => (
                    <Pressable
                        key={routine.index}
                        style={[
                            styles.card,
                            {
                                backgroundColor: colors.surface,
                                borderColor: routine.completed ? colors.sage : "transparent",
                                borderWidth: 1,
                            },
                            shadows.card
                        ]}
                        onPress={() => handleLog(routine.index, routine.name)}
                    >
                        <View style={styles.cardLeft}>
                            <Text
                                style={[
                                    styles.routineName,
                                    {
                                        color: routine.completed ? colors.inkMuted : colors.ink,
                                        textDecorationLine: routine.completed ? "line-through" : "none"
                                    }
                                ]}
                            >
                                {routine.name}
                            </Text>
                            <View style={styles.metaRow}>
                                <RefreshCw size={12} color={colors.inkMuted} />
                                <Text style={[styles.routineMeta, { color: colors.inkMuted }]}>
                                    {routine.frequency} • {routine.duration}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: routine.completed ? colors.sage : colors.dividerStrong,
                                    backgroundColor: routine.completed ? colors.sage : "transparent"
                                }
                            ]}
                        >
                            {routine.completed && <Check color="#FFF" size={14} strokeWidth={3} />}
                        </View>
                    </Pressable>
                ))}
            </View>

            {/* Weekly Focus Widget */}
            <View style={[styles.focusWidget, { backgroundColor: colors.backgroundDeep }]}>
                <View style={styles.focusHeader}>
                    <Calendar size={18} color={colors.ink} />
                    <Text style={[styles.focusLabel, { color: colors.ink }]}>THIS WEEK'S OBJECTIVE</Text>
                </View>
                {plan.content.weeklyPlans[0] && (
                    <Text style={[styles.focusText, { color: colors.ink }]}>
                        {plan.content.weeklyPlans[0].focus}
                    </Text>
                )}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    dateLabel: {
        ...Typography.sans.label,
        marginBottom: 8,
    },
    title: {
        ...Typography.display.h2,
        marginBottom: 8,
    },
    subtitle: {
        ...Typography.sans.body,
        fontSize: 15,
        lineHeight: 22,
    },
    list: {
        gap: 16,
        marginBottom: 40,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
    },
    cardLeft: {
        flex: 1,
    },
    routineName: {
        fontSize: 17,
        fontWeight: "500",
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    routineMeta: {
        fontSize: 13,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    focusWidget: {
        padding: 24,
        borderRadius: 20,
    },
    focusHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    focusLabel: {
        ...Typography.sans.label,
        fontSize: 12,
    },
    focusText: {
        fontSize: 18,
        fontWeight: "500",
        lineHeight: 28,
        fontStyle: "italic",
    },
});
