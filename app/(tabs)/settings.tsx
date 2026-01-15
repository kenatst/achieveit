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
import { Moon, Sun, Bell, Clock } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
    ReminderSettings,
    loadReminderSettings,
    saveReminderSettings,
    requestNotificationPermissions,
} from "@/utils/notifications";

type ThemeOption = "light" | "dark";

export default function SettingsScreen() {
    const { colors, theme, isDark, setTheme, shadows } = useTheme();
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
                    "Notifications Disabled",
                    "Please enable notifications in your device settings to receive reminders."
                );
                return;
            }
        }

        await saveReminderSettings(newSettings);
    };

    const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
        { value: "light", label: "Light", icon: <Sun color={colors.inkMedium} size={20} /> },
        { value: "dark", label: "Dark", icon: <Moon color={colors.inkMedium} size={20} /> },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.ink }]}>Settings</Text>
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.inkFaint }]}>
                            APPEARANCE
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
                            SMART REMINDERS
                        </Text>
                        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
                            {/* Master Toggle */}
                            <View style={[styles.switchRow, { borderBottomWidth: 0.5, borderBottomColor: colors.divider }]}>
                                <Bell color={colors.rust} size={20} />
                                <Text style={[styles.optionLabel, { color: colors.ink }]}>
                                    Enable Reminders
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
                                        Morning Check-in
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
                                        Evening Reflection
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
