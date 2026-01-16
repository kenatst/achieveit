import { Platform } from "react-native";

// GOD TIER TYPOGRAPHY SYSTEM
// Concept: "Editorial Couture"
// Contrasting massive Serif Display fonts with functional Sans-Serif Micro-details

export default {
    // The "Voice" of the app - used for statements, headlines, and moments of impact
    display: {
        // Massive headlines (e.g. Onboarding statements)
        hero: {
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            fontWeight: "700" as const,
            fontSize: 48,
            lineHeight: 52,
            letterSpacing: -1.5,
        },
        // Standard section headers
        h1: {
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            fontWeight: "600" as const,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: -0.8,
        },
        // Sub-headers / Card titles
        h2: {
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            fontWeight: "600" as const,
            fontSize: 24,
            lineHeight: 30,
            letterSpacing: -0.5,
        },
        // Italic emphasis (used for key words)
        italic: {
            fontFamily: Platform.select({ ios: "Georgia-Italic", android: "serif-italic" }),
            fontStyle: "italic" as const,
        }
    },

    // The "Brain" of the app - used for UI elements, data, and dense information
    sans: {
        // [RESTORED] Headline for Home Screen prompt
        headline: {
            fontSize: 34,
            fontWeight: "700" as const,
            letterSpacing: -1,
            lineHeight: 40,
        },
        // Body text for reading
        body: {
            fontSize: 17,
            lineHeight: 26,
            letterSpacing: -0.3,
            fontWeight: "400" as const,
        },
        // UI Labels, Buttons, Tabs (Uppercase, tracked out)
        label: {
            fontSize: 13,
            fontWeight: "600" as const,
            letterSpacing: 1.2, // Wide tracking for that "expensive" look
            textTransform: "uppercase" as const,
        },
        // Micro details, captions, dates
        caption: {
            fontSize: 11,
            fontWeight: "500" as const,
            letterSpacing: 0.5,
            color: "rgba(0,0,0,0.5)",
        },
        // Numbers (Progress, Stats) - Monospaced feel
        number: {
            fontSize: 15,
            fontWeight: "600" as const,
            fontVariant: ["tabular-nums"],
        }
    }
};
