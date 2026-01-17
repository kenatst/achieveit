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

            {/* Header Removed to reduce whitespace, title is in Sticky Header now */}

            <View style={styles.topSpacer} />

            <View style={styles.headerCompact}>
                <Text style={[styles.dateLabel, { color: colors.rust }]}>TODAY'S PRIORITY</Text>
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

            {/* Coach Invitation Footer */}
            <View style={[styles.coachCard, { backgroundColor: colors.backgroundDeep }]}>
                <Text style={[styles.coachLabel, { color: colors.inkMuted }]}>NEED GUIDANCE?</Text>
                <Text style={[styles.coachTitle, { color: colors.ink }]}>
                    Ask your AI Coach for feedback on your progress.
                </Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    topSpacer: {
        height: 12, // Reduced top spacing significantly
    },
    headerCompact: {
        marginBottom: 16,
    },
    dateLabel: {
        ...Typography.sans.label,
        marginBottom: 8,
    },
    list: {
        gap: 16,
        marginBottom: 48,
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
        borderRadius: 9,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    coachCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 10,
    },
    coachLabel: {
        ...Typography.sans.label,
        fontSize: 11,
        marginBottom: 8,
    },
    coachTitle: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
    }
});
