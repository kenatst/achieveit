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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, Sparkles, CheckCircle2, MessageCircle } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { sendCoachMessage, ChatMessage } from "@/utils/aiCoach";

export default function CoachScreen() {
    const router = useRouter();
    const { planId } = useLocalSearchParams<{ planId?: string }>();
    const { colors, shadows, isDark } = useTheme();
    const { t, locale, languageName } = useLanguage();
    const { plans } = usePlans();
    const scrollRef = useRef<ScrollView>(null);

    const plan = planId ? plans.find((p) => p.id === planId) : null;

    const getWelcomeMessage = (): string => {
        if (plan) {
            const currentWeekIndex = plan.content.weeklyPlans.findIndex((week, wi) => {
                const tasksDone = week.tasks.filter((_, ti) =>
                    plan.progress.weeklyTasks[wi]?.[ti]
                ).length;
                return tasksDone < week.tasks.length;
            });
            const currentWeek = currentWeekIndex !== -1 ? plan.content.weeklyPlans[currentWeekIndex] : null;

            let msg = t("coach.welcomeWithPlan", { planTitle: plan.content.title });
            if (currentWeek) {
                msg += "\n\n" + t("coach.welcomeCurrentWeek", { week: currentWeek.week, focus: currentWeek.focus });
            } else {
                msg += "\n\n" + t("coach.welcomeGreatProgress");
            }
            return msg;
        }
        return t("coach.welcomeNoPlan");
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
PLAN CONTEXT:
- Goal: ${plan.content.title}
- Summary: ${plan.content.summary}
- Progress: ${plan.progress.overallProgress}%
${currentWeek ? `
- Current Week: Week ${currentWeek.week} - ${currentWeek.focus}
- Tasks: ${currentWeek.tasks.join(", ")}
` : ""}
- Routines: ${plan.content.routines.map((r) => r.name).join(", ")}
- Obstacles: ${plan.content.obstacles.map((o) => o.challenge).join(", ")}

IMPORTANT: Respond ONLY in ${languageName}. Base advice on this specific plan.
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
            const contextualPrompt = plan
                ? `${buildPlanContext()}\n\nUser: ${input.trim()}`
                : input.trim();
            const coachResponse = await sendCoachMessage(contextualPrompt, messages);
            setMessages((prev) => [...prev, coachResponse]);
        } catch (error) {
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "coach",
                content: t("coach.errorMessage"),
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStarters = (): { text: string; icon: string }[] => {
        if (plan) {
            return [
                { text: t("coach.starter1"), icon: "📅" },
                { text: t("coach.starter2"), icon: "🧩" },
                { text: t("coach.starter3"), icon: "💪" },
                { text: t("coach.starter4"), icon: "📊" },
            ];
        }
        return [];
    };

    const starters = getStarters();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Premium Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={[styles.header, { borderBottomColor: colors.divider }]}
                >
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <View style={[styles.coachAvatar, { backgroundColor: colors.rust }]}>
                            <View style={[styles.avatarRing, { borderColor: colors.rustSoft }]}>
                                <Sparkles color="#FFFFFF" size={18} />
                            </View>
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.ink }]}>
                                {t("coach.title")}
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.inkMuted }]} numberOfLines={1}>
                                {plan ? plan.content.title : t("coach.noPlanSelected")}
                            </Text>
                        </View>
                    </View>
                    <View style={{ width: 44 }} />
                </MotiView>

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
                        {messages.map((msg, index) => (
                            <MotiView
                                key={msg.id}
                                from={{ opacity: 0, translateY: 10, scale: 0.95 }}
                                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                                transition={{ type: "timing", duration: 300, delay: index * 50 }}
                                style={[
                                    styles.messageBubble,
                                    msg.role === "user"
                                        ? [styles.userBubble, { backgroundColor: colors.ink }]
                                        : [styles.coachBubble, {
                                            backgroundColor: isDark ? colors.surface : "rgba(255,255,255,0.9)",
                                            borderColor: colors.divider,
                                            borderWidth: 1,
                                        }],
                                    shadows.card,
                                ]}
                            >
                                {msg.role === "coach" && (
                                    <View style={[styles.coachIcon, { backgroundColor: colors.rustSoft }]}>
                                        <Sparkles color={colors.rust} size={12} />
                                    </View>
                                )}
                                <Text
                                    style={[
                                        styles.messageText,
                                        msg.role === "user"
                                            ? { color: colors.background }
                                            : { color: colors.ink },
                                    ]}
                                >
                                    {msg.content}
                                </Text>

                                {msg.actionItems && msg.actionItems.length > 0 && (
                                    <View style={[styles.actionItems, { borderTopColor: colors.divider }]}>
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
                            </MotiView>
                        ))}

                        {isLoading && (
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={[
                                    styles.messageBubble,
                                    styles.coachBubble,
                                    { backgroundColor: isDark ? colors.surface : "rgba(255,255,255,0.9)", borderColor: colors.divider, borderWidth: 1 },
                                    shadows.card,
                                ]}
                            >
                                <View style={styles.typingIndicator}>
                                    {[0, 1, 2].map((i) => (
                                        <MotiView
                                            key={i}
                                            from={{ opacity: 0.3, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                type: "timing",
                                                duration: 500,
                                                delay: i * 150,
                                                loop: true,
                                            }}
                                            style={[styles.typingDot, { backgroundColor: colors.rust }]}
                                        />
                                    ))}
                                </View>
                            </MotiView>
                        )}
                    </ScrollView>

                    {/* Quick Starters */}
                    {messages.length <= 1 && starters.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.startersContainer}
                        >
                            {starters.map((starter) => (
                                <Pressable
                                    key={starter.text}
                                    style={[
                                        styles.starterChip,
                                        { backgroundColor: colors.surface, borderColor: colors.divider },
                                    ]}
                                    onPress={() => setInput(starter.text)}
                                >
                                    <Text style={styles.starterIcon}>{starter.icon}</Text>
                                    <Text style={[styles.starterText, { color: colors.ink }]}>
                                        {starter.text}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}

                    {/* Premium Input */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={[
                            styles.inputContainer,
                            { backgroundColor: colors.surface },
                            shadows.card,
                        ]}
                    >
                        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.divider }]}>
                            <MessageCircle color={colors.inkMuted} size={18} style={{ marginRight: 10 }} />
                            <TextInput
                                style={[styles.input, { color: colors.ink }]}
                                placeholder={plan ? t("coach.placeholder") : t("coach.selectPlanFirst")}
                                placeholderTextColor={colors.inkMuted}
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                                multiline
                                maxLength={500}
                                editable={!!plan}
                            />
                        </View>
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
                    </MotiView>
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
        paddingVertical: 16,
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
        gap: 14,
    },
    coachAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarRing: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    headerSubtitle: { fontSize: 13, marginTop: 2, maxWidth: 180 },
    chatContainer: { flex: 1 },
    messagesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 14,
    },
    messageBubble: {
        maxWidth: "88%",
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 20,
    },
    userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 6 },
    coachBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 6 },
    coachIcon: {
        position: "absolute",
        top: -8,
        left: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    messageText: { fontSize: 15, lineHeight: 23 },
    actionItems: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 0.5,
        gap: 10,
    },
    actionItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    actionItemText: { flex: 1, fontSize: 14, lineHeight: 21 },
    encouragement: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 0.5,
        fontSize: 14,
        fontStyle: "italic",
    },
    typingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    startersContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    starterChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        marginRight: 10,
        gap: 8,
    },
    starterIcon: { fontSize: 16 },
    starterText: { fontSize: 14, fontWeight: "500" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 28,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
});
