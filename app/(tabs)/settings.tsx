import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Switch,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Sun, Bell, Clock, Globe } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLocale } from "@/contexts/LanguageContext";
import {
    ReminderSettings,
    loadReminderSettings,
    saveReminderSettings,
    requestNotificationPermissions,
} from "@/utils/notifications";

type ThemeOption = "light" | "dark";

export default function SettingsScreen() {
    const { colors, theme, isDark, setTheme, shadows } = useTheme();
    const { locale, setLocale, t } = useLanguage();
    const [reminders, setReminders] = useState<ReminderSettings>({
        enabled: true,
        morningTime: "08:00",
        eveningTime: "20:00",
        morningEnabled: true,
        eveningEnabled: true,
    });

    useEffect(() => {
        loadReminderSettings().then(setReminders);
    }, []);

    const handleReminderChange = async (update: Partial<ReminderSettings>) => {
        const newSettings = { ...reminders, ...update };
        setReminders(newSettings);

        if (update.enabled === true || update.morningEnabled || update.eveningEnabled) {
            const hasPermission = await requestNotificationPermissions();
            if (!hasPermission) {
                Alert.alert(
                    t("settings.notificationsDisabled"),
                    t("settings.notificationsMessage")
                );
                return;
            }
        }

        await saveReminderSettings(newSettings);
    };

    const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
        { value: "light", label: t("settings.light"), icon: <Sun color={colors.inkMedium} size={20} /> },
        { value: "dark", label: t("settings.dark"), icon: <Moon color={colors.inkMedium} size={20} /> },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.ink }]}>{t("settings.title")}</Text>
                    </View>

                    {/* Language Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>
                            {t("settings.language")}
                        </Text>
                        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
                            {SUPPORTED_LANGUAGES.map((lang, index) => {
                                const isActive = locale === lang.code;
                                return (
                                    <Pressable
                                        key={lang.code}
                                        style={[
                                            styles.optionRow,
                                            index < SUPPORTED_LANGUAGES.length - 1 && {
                                                borderBottomWidth: 0.5,
                                                borderBottomColor: colors.divider,
                                            },
                                        ]}
                                        onPress={() => setLocale(lang.code)}
                                    >
                                        <Text style={styles.flag}>{lang.flag}</Text>
                                        <View style={styles.langInfo}>
                                            <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                                {lang.nativeName}
                                            </Text>
                                            <Text style={[styles.langSubtitle, { color: colors.inkFaint }]}>
                                                {lang.name}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.radio,
                                                { borderColor: colors.dividerStrong },
                                                isActive && { borderColor: colors.rust, backgroundColor: colors.rust },
                                            ]}
                                        >
                                            {isActive && <View style={styles.radioInner} />}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>
                            {t("settings.appearance")}
                        </Text>
                        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
                            {themeOptions.map((option, index) => {
                                const isActive = theme === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        style={[
                                            styles.optionRow,
                                            index < themeOptions.length - 1 && {
                                                borderBottomWidth: 0.5,
                                                borderBottomColor: colors.divider,
                                            },
                                        ]}
                                        onPress={() => setTheme(option.value)}
                                    >
                                        {option.icon}
                                        <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                            {option.label}
                                        </Text>
                                        <View
                                            style={[
                                                styles.radio,
                                                { borderColor: colors.dividerStrong },
                                                isActive && { borderColor: colors.rust, backgroundColor: colors.rust },
                                            ]}
                                        >
                                            {isActive && <View style={styles.radioInner} />}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Reminders Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>
                            {t("settings.reminders")}
                        </Text>
                        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
                            {/* Master Toggle */}
                            <View style={[styles.switchRow, { borderBottomWidth: 0.5, borderBottomColor: colors.divider }]}>
                                <Bell color={colors.rust} size={20} />
                                <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                    {t("settings.enableReminders")}
                                </Text>
                                <Switch
                                    value={reminders.enabled}
                                    onValueChange={(val) => handleReminderChange({ enabled: val })}
                                    trackColor={{ false: colors.divider, true: colors.rustSoft }}
                                    thumbColor={reminders.enabled ? colors.rust : colors.inkFaint}
                                />
                            </View>

                            {/* Morning Reminder */}
                            <View style={[styles.switchRow, { borderBottomWidth: 0.5, borderBottomColor: colors.divider }]}>
                                <Clock color={colors.inkMedium} size={20} />
                                <View style={styles.reminderInfo}>
                                    <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                        {t("settings.morningCheckin")}
                                    </Text>
                                    <Text style={[styles.reminderTime, { color: colors.inkFaint }]}>
                                        {reminders.morningTime}
                                    </Text>
                                </View>
                                <Switch
                                    value={reminders.morningEnabled && reminders.enabled}
                                    onValueChange={(val) => handleReminderChange({ morningEnabled: val })}
                                    trackColor={{ false: colors.divider, true: colors.rustSoft }}
                                    thumbColor={reminders.morningEnabled ? colors.rust : colors.inkFaint}
                                    disabled={!reminders.enabled}
                                />
                            </View>

                            {/* Evening Reminder */}
                            <View style={styles.switchRow}>
                                <Clock color={colors.inkMedium} size={20} />
                                <View style={styles.reminderInfo}>
                                    <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                        {t("settings.eveningReflection")}
                                    </Text>
                                    <Text style={[styles.reminderTime, { color: colors.inkFaint }]}>
                                        {reminders.eveningTime}
                                    </Text>
                                </View>
                                <Switch
                                    value={reminders.eveningEnabled && reminders.enabled}
                                    onValueChange={(val) => handleReminderChange({ eveningEnabled: val })}
                                    trackColor={{ false: colors.divider, true: colors.rustSoft }}
                                    thumbColor={reminders.eveningEnabled ? colors.rust : colors.inkFaint}
                                    disabled={!reminders.enabled}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Theme Indicator */}
                    <View style={styles.themeIndicator}>
                        <Text style={[styles.themeLabel, { color: colors.inkFaint }]}>
                            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 14,
        overflow: "hidden",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 18,
        gap: 14,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 18,
        gap: 14,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    flag: {
        fontSize: 24,
    },
    langInfo: {
        flex: 1,
    },
    langSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTime: {
        fontSize: 13,
        marginTop: 2,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
    },
    themeIndicator: {
        alignItems: "center",
        marginTop: 24,
    },
    themeLabel: {
        fontSize: 14,
    },
});
