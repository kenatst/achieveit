import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

const coachResponseSchema = z.object({
    message: z.string(),
    actionItems: z.array(z.string()).optional(),
    encouragement: z.string().optional(),
});

export interface ChatMessage {
    id: string;
    role: "user" | "coach";
    content: string;
    actionItems?: string[];
    encouragement?: string;
    timestamp: string;
}

const SYSTEM_PROMPT = `You are an elite AI achievement coach, blending the strategic mindset of a McKinsey consultant with the motivational energy of Tony Robbins. You help users achieve their goals through:

1. **Strategic questioning** - Ask probing questions to understand root causes
2. **Actionable advice** - Give specific, implementable steps (not vague platitudes)
3. **Accountability** - Track progress and call out when users aren't following through
4. **Motivation** - Celebrate wins and reframe setbacks as learning opportunities

STYLE GUIDELINES:
- Be warm but direct - no fluff
- Use short, punchy sentences
- Include 1-3 action items when relevant
- End with an encouraging thought when appropriate
- Maximum 150 words per response

You are NOT a therapist. Focus on practical goal achievement.`;

export async function sendCoachMessage(
    userMessage: string,
    chatHistory: ChatMessage[],
    planContext?: { title: string; goal: string }
): Promise<ChatMessage> {
    // Build conversation context
    const conversationMessages = chatHistory.slice(-10).map((msg) => ({
        role: msg.role === "coach" ? "assistant" : "user",
        content: msg.content,
    }));

    // Add plan context if available
    let contextPreamble = "";
    if (planContext) {
        contextPreamble = `[User is working on: "${planContext.title}" - Goal: "${planContext.goal}"]\n\n`;
    }

    const prompt = `${contextPreamble}User says: "${userMessage}"

Respond as the achievement coach. Be helpful, specific, and motivating.`;

    try {
        const response = await generateObject({
            messages: [
                { role: "user" as const, content: `${SYSTEM_PROMPT}\n\n${prompt}` },
            ],
            schema: coachResponseSchema,
        });

        return {
            id: Date.now().toString(),
            role: "coach",
            content: response.message,
            actionItems: response.actionItems,
            encouragement: response.encouragement,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Coach error:", error);
        return {
            id: Date.now().toString(),
            role: "coach",
            content: "I'm having trouble processing that right now. Let's try again - what's the most important thing you want to accomplish today?",
            timestamp: new Date().toISOString(),
        };
    }
}

// Translated starters by locale
export const COACH_STARTERS: Record<string, string[]> = {
    en: [
        "What's your #1 priority today?",
        "I'm feeling stuck on my goal",
        "How do I stay motivated?",
        "Help me break this down",
    ],
    fr: [
        "Quelle est ta priorité n°1 aujourd'hui ?",
        "Je me sens bloqué sur mon objectif",
        "Comment rester motivé ?",
        "Aide-moi à décomposer ça",
    ],
    es: [
        "¿Cuál es tu prioridad #1 hoy?",
        "Me siento atascado con mi objetivo",
        "¿Cómo mantengo la motivación?",
        "Ayúdame a desglosar esto",
    ],
    de: [
        "Was ist heute deine #1 Priorität?",
        "Ich fühle mich bei meinem Ziel blockiert",
        "Wie bleibe ich motiviert?",
        "Hilf mir, das aufzuteilen",
    ],
    it: [
        "Qual è la tua priorità #1 oggi?",
        "Mi sento bloccato sul mio obiettivo",
        "Come resto motivato?",
        "Aiutami a scomporre questo",
    ],
};
