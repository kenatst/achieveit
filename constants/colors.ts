// GOD TIER COLOR PALETTE
// Concept: "Vogue Cover" / "Old Money Aesthetic"
// Natural, expensive materials: Alabaster, Ink, Vermilion, Silk

export default {
  light: {
    // Canvas: A rich, warm alabaster text (not white, not yellow - expensive paper)
    background: "#FDFCF8",

    // Ink: Softer than black, warmer than gray. Like creative writing ink.
    ink: "#121212",
    inkMedium: "#4A4A45", // Burnt graphite
    inkLight: "#8C8C84",  // Stone

    // Vermilion: The signature accent. Aggressive, classic, unavoidable.
    accent: "#D94528",
    accentGlow: "rgba(217, 69, 40, 0.15)",

    // Secondary: British Racing Green (Deep, intellectual success)
    success: "#2A3B30",
    successLight: "#E8EDE9",

    // Surfaces: Use silk-like off-whites for cards to create depth without shadows
    surface: "#F2EFE9",
    surfaceHighlight: "#FFFFFF",

    // Borders: Barely there, structural
    divider: "#E6E2D8",

    // Functional
    error: "#D94528", // Same as accent, bold
    warning: "#D99E28", // Old gold

    // Aliases for backward compatibility
    text: "#121212",
    textMuted: "#4A4A45",
    textSecondary: "#8C8C84",
    rust: "#D94528",
    sage: "#2A3B30",
    inkMuted: "#4A4A45",
  },

  // Shadows are diffuse and ambient, like gallery lighting
  shadows: {
    card: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    floating: {
      shadowColor: "#2A2825",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    }
  }
};
