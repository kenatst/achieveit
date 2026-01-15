import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";

const REVIEW_STORAGE_KEY = "achieveit_weekly_reviews";

interface WeeklyReview {
    id: string;
    weekStart: string;
    completedAt: string;
    wins: string[];
    challenges: string[];
    learnings: string;
    nextWeekFocus: string;
    rating: number; // 1-5
}

const PROMPTS = [
    { key: "wins", label: "🏆 What were your wins this week?", placeholder: "List your achievements, no matter how small..." },
    { key: "challenges", label: "⚠️ What challenges did you face?", placeholder: "What obstacles slowed you down?" },
    { key: "learnings", label: "💡 What did you learn?", placeholder: "Key insights or realizations..." },
    { key: "nextWeekFocus", label: "🎯 What's your focus for next week?", placeholder: "Your #1 priority..." },
];

export default function ReviewScreen() {
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { plans } = usePlans();

    const [wins, setWins] = useState<string[]>([""]);
    const [challenges, setChallenges] = useState<string[]>([""]);
    const [learnings, setLearnings] = useState("");
    const [nextWeekFocus, setNextWeekFocus] = useState("");
    const [rating, setRating] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get week stats
    const getWeekStats = () => {
        let tasksCompleted = 0;
        let totalTasks = 0;
        let routinesCompleted = 0;

        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        plans.forEach((plan) => {
            // Count tasks from current week
            plan.content.weeklyPlans.forEach((week, wi) => {
                week.tasks.forEach((_, ti) => {
                    totalTasks++;
                    if (plan.progress.weeklyTasks[wi]?.[ti]) {
                        tasksCompleted++;
                    }
                });
            });

            // Count routine completions this week
            Object.values(plan.progress.routineHistory).forEach((dates) => {
                dates.forEach((dateStr) => {
                    const date = new Date(dateStr);
                    if (date >= weekAgo && date <= today) {
                        routinesCompleted++;
                    }
                });
            });
        });

        return { tasksCompleted, totalTasks, routinesCompleted };
    };

    const stats = getWeekStats();

    const handleAddWin = () => setWins([...wins, ""]);
    const handleAddChallenge = () => setChallenges([...challenges, ""]);

    const handleSave = async () => {
        setIsSaving(true);

        const review: WeeklyReview = {
            id: Date.now().toString(),
            weekStart: getWeekStart(),
            completedAt: new Date().toISOString(),
            wins: wins.filter((w) => w.trim()),
            challenges: challenges.filter((c) => c.trim()),
            learnings,
            nextWeekFocus,
            rating,
        };

        try {
            const existing = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
            const reviews: WeeklyReview[] = existing ? JSON.parse(existing) : [];
            reviews.push(review);
            await AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));

            setShowSuccess(true);
            setTimeout(() => router.back(), 1500);
        } catch (e) {
            console.error("Failed to save review:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff)).toISOString().split("T")[0];
    };

    if (showSuccess) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.successContainer}>
                    <CheckCircle2 color={colors.sage} size={80} strokeWidth={1.5} />
                    <Text style={[styles.successTitle, { color: colors.ink }]}>
                        Review Saved!
                    </Text>
                    <Text style={[styles.successSubtitle, { color: colors.inkMedium }]}>
                        Great job reflecting on your week
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>
                        Weekly Review
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Week Stats */}
                    <View style={[styles.statsCard, { backgroundColor: colors.surface }, shadows.card]}>
                        <Text style={[styles.statsTitle, { color: colors.inkFaint }]}>
                            THIS WEEK
                        </Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Target color={colors.rust} size={20} />
                                <Text style={[styles.statValue, { color: colors.ink }]}>
                                    {stats.tasksCompleted}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.inkMedium }]}>
                                    tasks done
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <TrendingUp color={colors.sage} size={20} />
                                <Text style={[styles.statValue, { color: colors.ink }]}>
                                    {stats.routinesCompleted}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.inkMedium }]}>
                                    routines
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Rating */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
                            How was your week overall?
                        </Text>
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((val) => (
                                <Pressable
                                    key={val}
                                    style={[
                                        styles.ratingBtn,
                                        { backgroundColor: colors.surface },
                                        rating === val && { backgroundColor: colors.rust },
                                    ]}
                                    onPress={() => setRating(val)}
                                >
                                    <Text
                                        style={[
                                            styles.ratingText,
                                            { color: colors.inkMedium },
                                            rating === val && { color: "#FFF" },
                                        ]}
                                    >
                                        {val}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Wins */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
                            🏆 What were your wins?
                        </Text>
                        {wins.map((win, i) => (
                            <TextInput
                                key={i}
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.divider },
                                ]}
                                placeholder="A win from this week..."
                                placeholderTextColor={colors.inkFaint}
                                value={win}
                                onChangeText={(text) => {
                                    const newWins = [...wins];
                                    newWins[i] = text;
                                    setWins(newWins);
                                }}
                            />
                        ))}
                        <Pressable style={styles.addBtn} onPress={handleAddWin}>
                            <Text style={[styles.addBtnText, { color: colors.rust }]}>+ Add another</Text>
                        </Pressable>
                    </View>

                    {/* Challenges */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
                            ⚠️ What challenges did you face?
                        </Text>
                        {challenges.map((challenge, i) => (
                            <TextInput
                                key={i}
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.divider },
                                ]}
                                placeholder="A challenge..."
                                placeholderTextColor={colors.inkFaint}
                                value={challenge}
                                onChangeText={(text) => {
                                    const newChallenges = [...challenges];
                                    newChallenges[i] = text;
                                    setChallenges(newChallenges);
                                }}
                            />
                        ))}
                        <Pressable style={styles.addBtn} onPress={handleAddChallenge}>
                            <Text style={[styles.addBtnText, { color: colors.rust }]}>+ Add another</Text>
                        </Pressable>
                    </View>

                    {/* Learnings */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
                            💡 What did you learn?
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.multilineInput,
                                { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.divider },
                            ]}
                            placeholder="Key insights or realizations..."
                            placeholderTextColor={colors.inkFaint}
                            value={learnings}
                            onChangeText={setLearnings}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Next Week Focus */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.ink }]}>
                            🎯 What's your #1 focus next week?
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.divider },
                            ]}
                            placeholder="Your main priority..."
                            placeholderTextColor={colors.inkFaint}
                            value={nextWeekFocus}
                            onChangeText={setNextWeekFocus}
                        />
                    </View>

                    {/* Save Button */}
                    <Pressable
                        style={[styles.saveBtn, { backgroundColor: colors.rust }]}
                        onPress={handleSave}
                        disabled={isSaving || rating === 0}
                    >
                        <Text style={styles.saveBtnText}>
                            {isSaving ? "Saving..." : "Complete Review"}
                        </Text>
                    </Pressable>
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
        paddingTop: 20,
        paddingBottom: 40,
    },
    statsCard: {
        padding: 20,
        borderRadius: 14,
        marginBottom: 24,
    },
    statsTitle: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
        gap: 6,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "700",
    },
    statLabel: {
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: "row",
        gap: 10,
    },
    ratingBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    ratingText: {
        fontSize: 18,
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        marginBottom: 10,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    addBtn: {
        paddingVertical: 8,
    },
    addBtnText: {
        fontSize: 14,
        fontWeight: "500",
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },
    saveBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    successSubtitle: {
        fontSize: 15,
    },
});
