import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Old Money / Quiet Luxury Palette
 */
const Colors = {
    light: {
        background: '#F9F8F6', // Warm Alabaster
        surface: '#FFFFFF',
        surfaceHighlight: '#F2F0EC',
        primary: '#C18C5D',     // Burnished Gold
        secondary: '#6B705C',   // Sage Green
        ink: '#1A1816',
        inkMedium: '#595552',
        inkFaint: '#A6A29E',
        inkMuted: '#A6A29E',    // Alias for compatibility
        inkSoft: '#595552',     // Alias for compatibility
        text: '#1A1816',        // Alias for compatibility
        accent: '#C18C5D',      // Alias for compatibility
        divider: '#EBE9E5',
        dividerStrong: '#D6D3CE',
        rust: '#A45D45',
        rustSoft: '#F5EBE8',
        sage: '#6B705C',
        sageSoft: '#EFEFEA',
        backgroundDeep: '#F9F8F6', // Alias
        surfacePressed: '#F2F0EC', // Alias
        negative: '#BF4343',
        shadow: '#2C2A26',
    },
    dark: {
        background: '#121110',
        surface: '#1C1A18',
        surfaceHighlight: '#262422',
        primary: '#D4A373',
        secondary: '#8F9382',
        ink: '#F2F0EC',
        inkMedium: '#A8A4A0',
        inkFaint: '#6E6A66',
        inkMuted: '#6E6A66',    // Alias
        inkSoft: '#A8A4A0',     // Alias
        text: '#F2F0EC',        // Alias
        accent: '#D4A373',      // Alias
        divider: '#2C2A26',
        dividerStrong: '#423F3A',
        rust: '#C77D63',
        rustSoft: '#332622',
        sage: '#8F9382',
        sageSoft: '#242622',
        backgroundDeep: '#121110', // Alias
        surfacePressed: '#262422', // Alias
        negative: '#E06C6C',
        shadow: '#000000',
    },
};

type Theme = 'light' | 'dark';

type ThemeContextType = {
    theme: Theme;
    colors: typeof Colors.light;
    shadows: {
        card: any;
        float: any;
        sm: any; // Compatibility
        md: any; // Compatibility
    };
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    colors: Colors.light,
    shadows: { card: {}, float: {}, sm: {}, md: {} },
    isDark: false,
    setTheme: () => { },
    toggleTheme: () => { },
});

const THEME_STORAGE_KEY = "achieveit_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved === "light" || saved === "dark") {
                setThemeState(saved);
            }
            setIsLoaded(true);
        });
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const colors = Colors[theme];

    const shadows = useMemo(() => ({
        card: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === 'light' ? 0.04 : 0.2,
            shadowRadius: 12,
            elevation: 2,
            borderWidth: 1,
            borderColor: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
        },
        float: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: theme === 'light' ? 0.08 : 0.3,
            shadowRadius: 24,
            elevation: 6,
        },
        sm: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: theme === 'light' ? 0.05 : 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme === 'light' ? 0.04 : 0.2,
            shadowRadius: 12,
            elevation: 2,
        },
    }), [colors, theme]);

    // Avoid flash
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{
            theme,
            colors,
            shadows,
            isDark: theme === 'dark',
            setTheme,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
