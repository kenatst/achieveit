// Typography constants for the app
const Typography = {
    fontFamily: {
        regular: "System",
        medium: "System",
        semiBold: "System",
        bold: "System",
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 28,
        "4xl": 34,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
    // Font presets
    display: {
        fontFamily: "System",
        fontWeight: "300" as const,
        letterSpacing: -1,
        hero: {
            fontSize: 42,
            lineHeight: 48,
            fontWeight: "300" as const,
        },
        italic: {
            fontSize: 42,
            lineHeight: 48,
            fontWeight: "300" as const,
            fontStyle: "italic" as const,
        },
    },
    sans: {
        fontFamily: "System",
        fontWeight: "400" as const,
        body: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: "400" as const,
        },
        label: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "500" as const,
        },
    },
};

export default Typography;
