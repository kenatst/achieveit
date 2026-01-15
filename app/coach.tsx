import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, Sparkles, CheckCircle2 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlans } from "@/contexts/PlansContext";
import { sendCoachMessage, ChatMessage } from "@/utils/aiCoach";

export default function CoachScreen() {
    const router = useRouter();
    const { planId } = useLocalSearchParams<{ planId?: string }>();
    const { colors, shadows } = useTheme();
    const { plans } = usePlans();
    const scrollRef = useRef<ScrollView>(null);

    // Get the plan if planId is provided
    const plan = planId ? plans.find((p) => p.id === planId) : null;

    // Generate context-aware welcome message
    const getWelcomeMessage = (): string => {
        if (plan) {
            const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
                const tasksDone = week.tasks.filter((_, ti) =>
                    plan.progress.weeklyTasks[wi]?.[ti]
                ).length;
                return tasksDone < week.tasks.length;
            });
            const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;

            return `Hey! 👋 I'm here to help you with **${plan.content.title}**.\n\n${currentWeek
                    ? `You're currently on **Week ${currentWeek.week}** - "${currentWeek.focus}". How can I help you make progress this week?`
                    : `Great job on your progress! What's on your mind?`
                }`;
        }
        return "Hey! 👋 Please open the coach from a specific plan to get personalized help. Go to Plans → Select a plan → Ask AI Coach.";
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "coach",
            content: getWelcomeMessage(),
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // Build plan context for the AI
    const buildPlanContext = (): string => {
        if (!plan) return "";

        const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
            const tasksDone = week.tasks.filter((_, ti) =>
                plan.progress.weeklyTasks[wi]?.[ti]
            ).length;
            return tasksDone < week.tasks.length;
        });
        const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;

        return `
PLAN CONTEXT (use this to give specific advice):
- Goal: ${plan.content.title}
- Summary: ${plan.content.summary}
- Current Progress: ${plan.progress.overallProgress}%
${currentWeek ? `
- Current Week: Week ${currentWeek.week} - ${currentWeek.focus}
- Week Tasks: ${currentWeek.tasks.join(", ")}
- Week Milestone: ${currentWeek.milestone}
` : ""}
- Key Phases: ${plan.content.phases.map((p) => p.name).join(", ")}
- Routines: ${plan.content.routines.map((r) => r.name).join(", ")}
- Known Obstacles: ${plan.content.obstacles.map((o) => o.challenge).join(", ")}

IMPORTANT: Base your advice specifically on this plan. Reference the current week, tasks, and routines. Do NOT give generic advice.
`;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Include plan context in the message
            const contextualPrompt = plan
                ? `${buildPlanContext()}\n\nUser question: ${input.trim()}`
                : input.trim();
            const coachResponse = await sendCoachMessage(contextualPrompt, messages);
            setMessages((prev) => [...prev, coachResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    // Quick starters based on plan context
    const getStarters = (): string[] => {
        if (plan) {
            const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
                const tasksDone = week.tasks.filter((_, ti) =>
                    plan.progress.weeklyTasks[wi]?.[ti]
                ).length;
                return tasksDone < week.tasks.length;
            });
            const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;

            return [
                currentWeek ? `Help with Week ${currentWeek.week}` : "What should I focus on?",
                "I'm feeling stuck",
                "How do I stay consistent?",
                "Review my progress",
            ];
        }
        return [];
    };

    const starters = getStarters();

    const handleStarter = (text: string) => {
        setInput(text);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <View style={[styles.coachAvatar, { backgroundColor: colors.rust }]}>
                            <Sparkles color="#FFFFFF" size={16} />
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.ink }]}>
                                AI Coach
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.inkMuted }]}>
                                {plan ? plan.content.title : "No plan selected"}
                            </Text>
                        </View>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.chatContainer}
                    keyboardVerticalOffset={90}
                >
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.messagesContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.messageBubble,
                                    msg.role === "user"
                                        ? [styles.userBubble, { backgroundColor: colors.rust }]
                                        : [styles.coachBubble, { backgroundColor: colors.surface }],
                                    shadows.card,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        msg.role === "user"
                                            ? { color: "#FFFFFF" }
                                            : { color: colors.ink },
                                    ]}
                                >
                                    {msg.content}
                                </Text>

                                {/* Action Items */}
                                {msg.actionItems && msg.actionItems.length > 0 && (
                                    <View style={styles.actionItems}>
                                        {msg.actionItems.map((item, i) => (
                                            <View key={i} style={styles.actionItem}>
                                                <CheckCircle2
                                                    color={colors.sage}
                                                    size={14}
                                                    strokeWidth={2}
                                                />
                                                <Text style={[styles.actionItemText, { color: colors.ink }]}>
                                                    {item}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Encouragement */}
                                {msg.encouragement && (
                                    <Text
                                        style={[
                                            styles.encouragement,
                                            { color: colors.sage, borderTopColor: colors.divider },
                                        ]}
                                    >
                                        💪 {msg.encouragement}
                                    </Text>
                                )}
                            </View>
                        ))}

                        {isLoading && (
                            <View
                                style={[
                                    styles.messageBubble,
                                    styles.coachBubble,
                                    { backgroundColor: colors.surface },
                                    shadows.card,
                                ]}
                            >
                                <ActivityIndicator color={colors.rust} size="small" />
                            </View>
                        )}
                    </ScrollView>

                    {/* Quick Starters - only show for plan context */}
                    {messages.length <= 1 && starters.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.startersContainer}
                        >
                            {starters.map((starter) => (
                                <Pressable
                                    key={starter}
                                    style={[
                                        styles.starterChip,
                                        { backgroundColor: colors.surface, borderColor: colors.divider },
                                    ]}
                                    onPress={() => handleStarter(starter)}
                                >
                                    <Text style={[styles.starterText, { color: colors.ink }]}>
                                        {starter}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}

                    {/* Input */}
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: colors.surface, borderTopColor: colors.divider },
                        ]}
                    >
                        <TextInput
                            style={[styles.input, { color: colors.ink, backgroundColor: colors.background }]}
                            placeholder={plan ? "Ask about your plan..." : "Select a plan first"}
                            placeholderTextColor={colors.inkMuted}
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            multiline
                            maxLength={500}
                            editable={!!plan}
                        />
                        <Pressable
                            style={[
                                styles.sendBtn,
                                { backgroundColor: input.trim() && plan ? colors.rust : colors.divider },
                            ]}
                            onPress={handleSend}
                            disabled={!input.trim() || isLoading || !plan}
                        >
                            <Send
                                color={input.trim() && plan ? "#FFFFFF" : colors.inkMuted}
                                size={18}
                            />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
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
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    coachAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "600" },
    headerSubtitle: { fontSize: 12, marginTop: 1 },
    chatContainer: { flex: 1 },
    messagesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: "85%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
    },
    userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
    coachBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    actionItems: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: "rgba(0,0,0,0.1)",
        gap: 8,
    },
    actionItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    actionItemText: { flex: 1, fontSize: 14, lineHeight: 20 },
    encouragement: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 0.5,
        fontSize: 14,
        fontStyle: "italic",
    },
    startersContainer: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    starterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    starterText: { fontSize: 14, fontWeight: "500" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
