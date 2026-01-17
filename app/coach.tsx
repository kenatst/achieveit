import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send, Sparkles, User, Zap } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lightTap, mediumTap } from "@/utils/haptics";
import * as Haptics from "expo-haptics";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

export default function CoachScreen() {
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Good morning. I've reviewed your latest progress on the 'Marketing God' blueprint.\n\nYou're trending 12% ahead of schedule on Phase 1, but we need to tighten up the daily content routine. Shall we look at optimization strategies?",
            sender: "ai",
            timestamp: new Date()
        }
    ]);
    const scrollViewRef = useRef<ScrollView>(null);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        mediumTap();
        const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user", timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Precisely. The key here isn't just volume, it's resonance. I recommend we audit your last 3 days of output against the 'Authority' metrics we defined in the diagnosis.\n\nWould you like me to generate a 3-point checklist for tomorrow's routine?",
                sender: "ai",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
    };

    const suggestions = [
        "Optimize my routine",
        "Review Phase 1 KPIs",
        "I'm feeling stuck"
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={24} strokeWidth={2} />
                    </Pressable>
                    <View style={styles.headerContent}>
                        <Text style={[styles.headerTitle, { color: colors.ink }]}>EXECUTIVE CONCIERGE</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.primary }]}>AI Strategy Partner</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <View style={styles.disclaimer}>
                        <Sparkles size={14} color={colors.primary} />
                        <Text style={[styles.disclaimerText, { color: colors.inkFaint }]}>
                            Confidential & Encrypted Session
                        </Text>
                    </View>

                    {messages.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        const showAvatar = !isUser && (index === 0 || messages[index - 1].sender === "user");

                        return (
                            <MotiView
                                key={msg.id}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: "timing", duration: 300 }}
                                style={[
                                    styles.messageRow,
                                    isUser ? styles.userRow : styles.aiRow
                                ]}
                            >
                                {!isUser && (
                                    <View style={[styles.avatar, { opacity: showAvatar ? 1 : 0 }]}>
                                        <Zap size={14} color={colors.primary} fill={colors.primary} />
                                    </View>
                                )}

                                <View style={[
                                    styles.bubble,
                                    isUser
                                        ? [styles.userBubble, { backgroundColor: colors.ink }]
                                        : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.dividerStrong }]
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isUser ? { color: "#FFF" } : { color: colors.ink }
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            </MotiView>
                        );
                    })}

                    {isTyping && (
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={styles.typingContainer}
                        >
                            <View style={[styles.typingDot, { backgroundColor: colors.inkFaint }]} />
                            <View style={[styles.typingDot, { backgroundColor: colors.inkFaint, marginHorizontal: 4 }]} />
                            <View style={[styles.typingDot, { backgroundColor: colors.inkFaint }]} />
                        </MotiView>
                    )}

                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Input Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                    style={[styles.inputContainer, { backgroundColor: colors.background }]}
                >
                    {/* Quick Suggestions */}
                    {messages.length < 3 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsRow}>
                            {suggestions.map((s, i) => (
                                <Pressable
                                    key={i}
                                    style={[styles.suggestionChip, { borderColor: colors.dividerStrong }]}
                                    onPress={() => { setInput(s); lightTap(); }}
                                >
                                    <Text style={[styles.suggestionText, { color: colors.inkMedium }]}>{s}</Text>
                                </Pressable>
                            ))}
                            <View style={{ width: 24 }} />
                        </ScrollView>
                    )}

                    <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                        <TextInput
                            style={[styles.input, { color: colors.ink }]}
                            placeholder="Ask for strategy advice..."
                            placeholderTextColor={colors.inkFaint}
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <Pressable
                            style={[
                                styles.sendBtn,
                                { backgroundColor: input.trim() ? colors.ink : colors.divider }
                            ]}
                            onPress={handleSend}
                            disabled={!input.trim()}
                        >
                            <ArrowLeft
                                size={20}
                                color={input.trim() ? "#FFF" : colors.inkFaint}
                                style={{ transform: [{ rotate: "90deg" }] }}
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
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 60,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
    },
    headerContent: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: "500",
        letterSpacing: 0.5,
        marginTop: 2,
        textTransform: "uppercase",
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    disclaimer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 32,
    },
    disclaimerText: {
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    messageRow: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    userRow: {
        justifyContent: "flex-end",
    },
    aiRow: {
        justifyContent: "flex-start",
    },
    avatar: {
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        marginBottom: 2,
    },
    bubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        maxWidth: "80%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    userBubble: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 4, // Sharp corner for user origin
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    aiBubble: {
        borderWidth: 1,
        borderTopLeftRadius: 4, // Sharp corner for AI origin
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    typingContainer: {
        flexDirection: "row",
        marginLeft: 48,
        marginBottom: 16,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.5,
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 12,
    },
    suggestionsRow: {
        marginBottom: 12,
        flexGrow: 0,
    },
    suggestionChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 20,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 12,
        fontWeight: "500",
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderWidth: 1,
        borderRadius: 26,
        paddingHorizontal: 6,
        paddingVertical: 6,
        minHeight: 52,
    },
    input: {
        flex: 1,
        marginLeft: 14,
        marginBottom: 10, // Centers text vertically in multiline
        fontSize: 16,
        maxHeight: 100,
        paddingTop: 0, // Reset default padding
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
