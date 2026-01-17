import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, RefreshCw, Check, Clock, Calendar } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, mediumTap, successNotification } from "@/utils/haptics";

export default function RoutinesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, logRoutine } = usePlans();

    const plan = plans.find(p => p.id === id);

    if (!plan) return null;

    const todayStr = new Date().toISOString().split("T")[0];

    const handleLogRoutine = (routineIndex: number, routineName: string) => {
        const alreadyLogged = plan.progress.routineHistory[routineIndex]?.includes(todayStr);
        if (!alreadyLogged) {
            successNotification();
        } else {
            mediumTap();
        }
        logRoutine(plan.id, routineIndex, routineName);
    };

    // Calculate streak for each routine
    const getStreak = (routineIndex: number): number => {
        const history = plan.progress.routineHistory[routineIndex] || [];
        if (history.length === 0) return 0;

        const sorted = [...history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const checkStr = checkDate.toISOString().split("T")[0];

            if (sorted.includes(checkStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>
                        {t("planDetail.routines")}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Today's Status */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={[styles.statusCard, { backgroundColor: colors.surface }, shadows.card]}
                    >
                        <Calendar color={colors.rust} size={20} />
                        <View style={styles.statusInfo}>
                            <Text style={[styles.statusLabel, { color: colors.inkMuted }]}>
                                {t("common.today")}
                            </Text>
                            <Text style={[styles.statusValue, { color: colors.ink }]}>
                                {plan.content.routines.filter((_, ri) =>
                                    plan.progress.routineHistory[ri]?.includes(todayStr)
                                ).length} / {plan.content.routines.length} {t("common.complete")}
                            </Text>
                        </View>
                    </MotiView>

                    {/* Routines List */}
                    {plan.content.routines.map((routine, ri) => {
                        const isLoggedToday = plan.progress.routineHistory[ri]?.includes(todayStr);
                        const streak = getStreak(ri);
                        const totalLogs = plan.progress.routineHistory[ri]?.length || 0;

                        return (
                            <MotiView
                                key={ri}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 100 + ri * 50 }}
                            >
                                <View style={[
                                    styles.routineCard,
                                    { backgroundColor: colors.surface },
                                    shadows.card,
                                    isLoggedToday && { borderWidth: 2, borderColor: colors.sage },
                                ]}>
                                    <View style={styles.routineHeader}>
                                        <View style={[
                                            styles.routineIcon,
                                            { backgroundColor: isLoggedToday ? colors.sageSoft : "#EEF2FF" },
                                        ]}>
                                            <RefreshCw
                                                color={isLoggedToday ? colors.sage : "#6366F1"}
                                                size={20}
                                            />
                                        </View>
                                        <View style={styles.routineInfo}>
                                            <Text style={[styles.routineName, { color: colors.ink }]}>
                                                {routine.name}
                                            </Text>
                                            <View style={styles.routineMeta}>
                                                <Clock color={colors.inkFaint} size={12} />
                                                <Text style={[styles.routineMetaText, { color: colors.inkMuted }]}>
                                                    {routine.duration} • {routine.frequency}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.routineStats}>
                                        <View style={styles.routineStat}>
                                            <Text style={[styles.routineStatValue, { color: colors.rust }]}>
                                                {streak}
                                            </Text>
                                            <Text style={[styles.routineStatLabel, { color: colors.inkMuted }]}>
                                                🔥 Streak
                                            </Text>
                                        </View>
                                        <View style={[styles.routineStatDivider, { backgroundColor: colors.divider }]} />
                                        <View style={styles.routineStat}>
                                            <Text style={[styles.routineStatValue, { color: colors.sage }]}>
                                                {totalLogs}
                                            </Text>
                                            <Text style={[styles.routineStatLabel, { color: colors.inkMuted }]}>
                                                Total
                                            </Text>
                                        </View>
                                    </View>

                                    <Pressable
                                        style={[
                                            styles.logBtn,
                                            { backgroundColor: isLoggedToday ? colors.sage : colors.rust },
                                        ]}
                                        onPress={() => handleLogRoutine(ri, routine.name)}
                                    >
                                        {isLoggedToday ? (
                                            <>
                                                <Check color="#FFF" size={18} strokeWidth={3} />
                                                <Text style={styles.logBtnText}>{t("planDetail.logged")}</Text>
                                            </>
                                        ) : (
                                            <Text style={styles.logBtnText}>{t("planDetail.logToday")}</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </MotiView>
                        );
                    })}

                    <View style={{ height: 32 }} />
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
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "600",
        textAlign: "center",
    },
    scroll: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    statusCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 18,
        borderRadius: 16,
        marginBottom: 24,
    },
    statusInfo: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    routineCard: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
    },
    routineHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginBottom: 16,
    },
    routineIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    routineInfo: {
        flex: 1,
    },
    routineName: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 4,
    },
    routineMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    routineMetaText: {
        fontSize: 13,
    },
    routineStats: {
        flexDirection: "row",
        marginBottom: 16,
    },
    routineStat: {
        flex: 1,
        alignItems: "center",
    },
    routineStatValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    routineStatLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    routineStatDivider: {
        width: 1,
        marginVertical: 4,
    },
    logBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        borderRadius: 12,
        gap: 8,
    },
    logBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
