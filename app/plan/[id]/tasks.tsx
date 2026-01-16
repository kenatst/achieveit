import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, RefreshCw, Calendar } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { triggerMedium, triggerSuccess } from "@/utils/haptics";

export default function TasksScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, logRoutine, toggleWeeklyTask } = usePlans();

    const plan = plans.find((p) => p.id === id);
    const todayStr = new Date().toISOString().split("T")[0];

    if (!plan) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.notFound}>
                        <Text style={[styles.notFoundText, { color: colors.ink }]}>Plan not found</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // Today's routines
    const routines = plan.content.routines.map((routine, ri) => ({
        ...routine,
        index: ri,
        completed: plan.progress.routineHistory[ri]?.includes(todayStr) || false,
    }));

    // Current week tasks
    const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
        const tasksDone = week.tasks.filter((_, ti) =>
            plan.progress.weeklyTasks[wi]?.[ti]
        ).length;
        return tasksDone < week.tasks.length;
    });

    const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;
    const weekTasks = currentWeek
        ? currentWeek.tasks.map((task, ti) => ({
            task,
            index: ti,
            completed: plan.progress.weeklyTasks[currentWeekIndex]?.[ti] || false,
        }))
        : [];

    const handleLogRoutine = (ri: number, name: string) => {
        triggerSuccess();
        logRoutine(plan.id, ri, name);
    };

    const handleToggleTask = (ti: number, task: string) => {
        triggerMedium();
        toggleWeeklyTask(plan.id, currentWeekIndex, ti, task);
    };

    const completedRoutines = routines.filter((r) => r.completed).length;
    const completedTasks = weekTasks.filter((t) => t.completed).length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>{t("focus.title")}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Daily Routines */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.sectionBlock}
                    >
                        <View style={styles.sectionHeader}>
                            <RefreshCw color={colors.sage} size={18} />
                            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                {t("focus.dailyRoutines")}
                            </Text>
                            <Text style={[styles.sectionCount, { color: colors.inkMuted }]}>
                                {completedRoutines}/{routines.length}
                            </Text>
                        </View>

                        {routines.map((routine, i) => (
                            <Pressable
                                key={routine.index}
                                style={[styles.itemCard, { backgroundColor: colors.surface }, shadows.card]}
                                onPress={() => handleLogRoutine(routine.index, routine.name)}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        { borderColor: colors.dividerStrong },
                                        routine.completed && { backgroundColor: colors.sage, borderColor: colors.sage },
                                    ]}
                                >
                                    {routine.completed && <Check color="#FFF" size={14} strokeWidth={3} />}
                                </View>
                                <View style={styles.itemContent}>
                                    <Text
                                        style={[
                                            styles.itemTitle,
                                            { color: colors.ink },
                                            routine.completed && { textDecorationLine: "line-through", color: colors.inkMuted },
                                        ]}
                                    >
                                        {routine.name}
                                    </Text>
                                    <Text style={[styles.itemMeta, { color: colors.inkMuted }]}>
                                        {routine.frequency} • {routine.duration}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </MotiView>

                    {/* This Week's Tasks */}
                    {currentWeek && (
                        <MotiView
                            from={{ opacity: 0, translateY: -10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 100 }}
                            style={styles.sectionBlock}
                        >
                            <View style={styles.sectionHeader}>
                                <Calendar color={colors.rust} size={18} />
                                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                                    Week {currentWeek.week}: {currentWeek.focus}
                                </Text>
                                <Text style={[styles.sectionCount, { color: colors.inkMuted }]}>
                                    {completedTasks}/{weekTasks.length}
                                </Text>
                            </View>

                            {weekTasks.map((item) => (
                                <Pressable
                                    key={item.index}
                                    style={[styles.itemCard, { backgroundColor: colors.surface }, shadows.card]}
                                    onPress={() => handleToggleTask(item.index, item.task)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            { borderColor: colors.dividerStrong },
                                            item.completed && { backgroundColor: colors.rust, borderColor: colors.rust },
                                        ]}
                                    >
                                        {item.completed && <Check color="#FFF" size={14} strokeWidth={3} />}
                                    </View>
                                    <Text
                                        style={[
                                            styles.taskText,
                                            { color: colors.ink },
                                            item.completed && { textDecorationLine: "line-through", color: colors.inkMuted },
                                        ]}
                                    >
                                        {item.task}
                                    </Text>
                                </Pressable>
                            ))}
                        </MotiView>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
    scroll: { paddingHorizontal: 24, paddingTop: 24 },
    sectionBlock: { marginBottom: 28 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
    },
    sectionTitle: { flex: 1, fontSize: 16, fontWeight: "600" },
    sectionCount: { fontSize: 14 },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        gap: 14,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 15, fontWeight: "500" },
    itemMeta: { fontSize: 12, marginTop: 2 },
    taskText: { flex: 1, fontSize: 15, fontWeight: "500", lineHeight: 22 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16 },
});
