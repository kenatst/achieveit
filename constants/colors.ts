// GOD TIER COLOR PALETTE
// Concept: "Vogue Cover" / "Old Money Aesthetic"
// Natural, expensive materials: Alabaster, Ink, Vermilion, Silk

export interface ColorScheme {
  background: string;
  backgroundDeep: string;
  ink: string;
  inkMedium: string;
  inkLight: string;
  inkFaint: string;
  inkSoft: string;
  inkMuted: string;
  accent: string;
  accentGlow: string;
  success: string;
  successLight: string;
  surface: string;
  surfaceHighlight: string;
  surfacePressed: string;
  divider: string;
  dividerStrong: string;
  error: string;
  warning: string;
  negative: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  rust: string;
  rustSoft: string;
  sage: string;
  sageSoft: string;
}

export interface ShadowItem {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ShadowScheme {
  sm: ShadowItem;
  card: ShadowItem;
  md: ShadowItem;
  floating: ShadowItem;
}

const light: ColorScheme = {
  // Canvas: A rich, warm alabaster text (not white, not yellow - expensive paper)
  background: "#FDFCF8",
  backgroundDeep: "#F5F2EB",

  // Ink: Softer than black, warmer than gray. Like creative writing ink.
  ink: "#121212",
  inkMedium: "#4A4A45", // Burnt graphite
  inkLight: "#8C8C84",  // Stone
  inkFaint: "#C8C8C0",  // Very light ink
  inkSoft: "#6A6A62",   // Medium-soft ink
  inkMuted: "#4A4A45",

  // Vermilion: The signature accent. Aggressive, classic, unavoidable.
  accent: "#D94528",
  accentGlow: "rgba(217, 69, 40, 0.15)",

  // Secondary: British Racing Green (Deep, intellectual success)
  success: "#2A3B30",
  successLight: "#E8EDE9",

  // Surfaces: Use silk-like off-whites for cards to create depth without shadows
  surface: "#F2EFE9",
  surfaceHighlight: "#FFFFFF",
  surfacePressed: "#E8E5DF",

  // Borders: Barely there, structural
  divider: "#E6E2D8",
  dividerStrong: "#D4D0C4",

  // Functional
  error: "#D94528", // Same as accent, bold
  warning: "#D99E28", // Old gold
  negative: "#C41E1E", // Danger red

  // Aliases for backward compatibility
  text: "#121212",
  textMuted: "#4A4A45",
  textSecondary: "#8C8C84",
  rust: "#D94528",
  rustSoft: "rgba(217, 69, 40, 0.12)",
  sage: "#2A3B30",
  sageSoft: "rgba(42, 59, 48, 0.12)",
};

const dark: ColorScheme = {
  // Canvas: Deep charcoal with warm undertones
  background: "#0D0D0C",
  backgroundDeep: "#161614",

  // Ink becomes light for dark mode
  ink: "#FAF9F6",
  inkMedium: "#C8C8C0",
  inkLight: "#8C8C84",
  inkFaint: "#4A4A45",
  inkSoft: "#A8A8A0",
  inkMuted: "#C8C8C0",

  // Vermilion: Slightly brighter for dark backgrounds
  accent: "#E85A3D",
  accentGlow: "rgba(232, 90, 61, 0.20)",

  // Secondary: Sage becomes lighter
  success: "#4A6B54",
  successLight: "#1E2A22",

  // Surfaces: Dark cards with subtle differentiation
  surface: "#1A1A18",
  surfaceHighlight: "#242422",
  surfacePressed: "#121210",

  // Borders: Subtle, warm grays
  divider: "#2A2A28",
  dividerStrong: "#3A3A38",

  // Functional
  error: "#E85A3D",
  warning: "#E8B33D",
  negative: "#E84D4D",

  // Aliases
  text: "#FAF9F6",
  textMuted: "#C8C8C0",
  textSecondary: "#8C8C84",
  rust: "#E85A3D",
  rustSoft: "rgba(232, 90, 61, 0.15)",
  sage: "#4A6B54",
  sageSoft: "rgba(74, 107, 84, 0.15)",
};

const shadows: { light: ShadowScheme; dark: ShadowScheme } = {
  light: {
    sm: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    card: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    md: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    floating: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 1,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 4,
    },
    floating: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.7,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

export type Theme = "light" | "dark";

export const colors = { light, dark };
export const themeShadows = shadows;

// Default export for backward compatibility
export default {
  light,
  dark,
  shadows: shadows.light,
};
