import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

// Import translations
import en from "@/translations/en.json";
import fr from "@/translations/fr.json";
import es from "@/translations/es.json";
import de from "@/translations/de.json";
import it from "@/translations/it.json";

const LANGUAGE_STORAGE_KEY = "achieveit_language";

export type SupportedLocale = "en" | "fr" | "es" | "de" | "it";

export const SUPPORTED_LANGUAGES: { code: SupportedLocale; name: string; nativeName: string; flag: string }[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
];

// Initialize i18n
const i18n = new I18n({
    en,
    fr,
    es,
    de,
    it,
});

i18n.enableFallback = true;
i18n.defaultLocale = "en";

// Get device language and map to supported locale
const getDeviceLocale = (): SupportedLocale => {
    const locales = getLocales();
    if (locales.length > 0) {
        const deviceLang = locales[0].languageCode;
        if (deviceLang && ["en", "fr", "es", "de", "it"].includes(deviceLang)) {
            return deviceLang as SupportedLocale;
        }
    }
    return "en";
};

interface LanguageContextType {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
    t: (scope: string, options?: object) => string;
    languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [locale, setLocaleState] = useState<SupportedLocale>("en");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language preference or use device locale
    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
            if (saved && ["en", "fr", "es", "de", "it"].includes(saved)) {
                setLocaleState(saved as SupportedLocale);
                i18n.locale = saved;
            } else {
                const deviceLocale = getDeviceLocale();
                setLocaleState(deviceLocale);
                i18n.locale = deviceLocale;
            }
            setIsLoaded(true);
        });
    }, []);

    // Set locale and persist
    const setLocale = useCallback((newLocale: SupportedLocale) => {
        setLocaleState(newLocale);
        i18n.locale = newLocale;
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
    }, []);

    // Translation function
    const t = useCallback((scope: string, options?: object): string => {
        return i18n.t(scope, options);
    }, [locale]);

    // Get language full name
    const languageName = SUPPORTED_LANGUAGES.find(l => l.code === locale)?.name || "English";

    const value: LanguageContextType = {
        locale,
        setLocale,
        t,
        languageName,
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

// Export i18n instance for direct use in non-component contexts
export { i18n };
