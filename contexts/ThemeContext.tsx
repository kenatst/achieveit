import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, themeShadows, ColorScheme, Theme } from "@/constants/colors";

const THEME_STORAGE_KEY = "achieveit_theme";

interface ThemeContextType {
    theme: Theme;
    colors: ColorScheme;
    shadows: typeof themeShadows.light;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>("light");
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

    // Save preference
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const value: ThemeContextType = {
        theme,
        colors: colors[theme],
        shadows: themeShadows[theme],
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
    };

    // Don't render until theme is loaded to avoid flash
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
