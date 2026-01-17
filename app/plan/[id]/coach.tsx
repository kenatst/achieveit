import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlans } from "@/contexts/PlansContext";
import { useTheme } from "@/contexts/ThemeContext";
import Typography from "@/constants/typography";
import { Send, Sparkles } from "lucide-react-native";
import { MotiView } from "moti";

export default function PlanCoachScreen() {
    const { id } = useLocalSearchParams();
    const { plans } = usePlans();
    const { colors, shadows } = useTheme();
    const [message, setMessage] = useState("");

    const plan = plans.find((p) => p.id === id);
    if (!plan) return null;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction / Welcome */}
                <View style={styles.welcomeBlock}>
                    <View style={[styles.avatarRing, { borderColor: colors.rust }]}>
                        <Sparkles size={24} color={colors.rust} />
                    </View>
                    <Text style={[styles.welcomeTitle, { color: colors.ink }]}>
                        At your service.
                    </Text>
                    <Text style={[styles.welcomeBody, { color: colors.inkMedium }]}>
                        I'm here to analyze your progress on "{plan.content.title}" and help you overcome any obstacles in Phase 1.
                    </Text>
                </View>

                {/* Example Prompts */}
                <View style={styles.promptList}>
                    {[
                        "Critique my daily routine",
                        "How do I track success?",
                        "I'm stuck on Week 2",
                    ].map((prompt, i) => (
                        <Pressable
                            key={i}
                            style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.divider }]}
                        >
                            <Text style={[styles.promptText, { color: colors.ink }]}>{prompt}</Text>
                        </Pressable>
                    ))}
                </View>

            </ScrollView>

            {/* Premium Input Area */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.divider }, shadows.card]}>
                <TextInput
                    style={[styles.input, { color: colors.ink, backgroundColor: colors.background }]}
                    placeholder="Ask for guidance..."
                    placeholderTextColor={colors.inkMuted}
                    value={message}
                    onChangeText={setMessage}
                />
                <Pressable
                    style={[styles.sendBtn, { backgroundColor: colors.rust }]}
                    hitSlop={10}
                >
                    <Send size={18} color="#FFF" />
                </Pressable>
            </View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 140,
        paddingHorizontal: 24,
        paddingBottom: 140,
        alignItems: 'center',
    },
    welcomeBlock: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    welcomeTitle: {
        ...Typography.display.h1,
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeBody: {
        ...Typography.sans.body,
        textAlign: 'center',
        maxWidth: 280,
    },
    promptList: {
        gap: 12,
        width: '100%',
        marginTop: 20,
    },
    promptChip: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    promptText: {
        fontSize: 15,
        fontWeight: '500',
    },
    inputContainer: {
        position: 'absolute',
        bottom: 110, // Above tab bar
        left: 20,
        right: 20,
        padding: 12,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
