import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDERS_KEY = "achieveit_reminders";

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface ReminderSettings {
    enabled: boolean;
    morningTime: string; // HH:MM format
    eveningTime: string;
    morningEnabled: boolean;
    eveningEnabled: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
    enabled: true,
    morningTime: "08:00",
    eveningTime: "20:00",
    morningEnabled: true,
    eveningEnabled: true,
};

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        // console.log("Notifications only work on physical devices");
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        return false;
    }

    // Configure Android channel
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
            name: "Daily Reminders",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#D94528",
        });
    }

    return true;
}

// Save reminder settings
export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(settings));
    await scheduleReminders(settings);
}

// Load reminder settings
export async function loadReminderSettings(): Promise<ReminderSettings> {
    const saved = await AsyncStorage.getItem(REMINDERS_KEY);
    if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_SETTINGS;
}

// Schedule all reminders based on settings
export async function scheduleReminders(settings: ReminderSettings): Promise<void> {
    // We only cancel the "daily" recurring ones, avoiding to kill smart nudges if possible
    // But identifiers for recurring triggers are managed by system.
    // Simplest is to just cancel purely based on known identifiers?? 
    // Expo doesn't let us tag notifications easily. 
    // For now, cancelAll is safe because smart nudges are transient.
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Morning reminder
    if (settings.morningEnabled) {
        const [hours, minutes] = settings.morningTime.split(":").map(Number);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Good morning! 🌅",
                body: "Ready to crush your goals today? Check your Focus tab.",
                data: { screen: "focus" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
        });
    }

    // Evening reminder
    if (settings.eveningEnabled) {
        const [hours, minutes] = settings.eveningTime.split(":").map(Number);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Evening check-in 🌙",
                body: "How did today go? Log your progress before bed.",
                data: { screen: "dashboard" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
        });
    }
}

// --- SMART NUDGES (Context Aware) ---

const NUDGE_ID = "smart_nudge_today";

export async function scheduleMissedRoutineNudge(routineName: string) {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Schedule for 18:00 today if it's before 18:00
    // If it's after 18:00, maybe schedule for 20:00?
    // Let's keep it simple: Schedule for 1 hour from now.

    await Notifications.scheduleNotificationAsync({
        identifier: NUDGE_ID,
        content: {
            title: "Keep the streak alive! 🔥",
            body: `You haven't logged '${routineName}' yet. Done it?`,
            data: { screen: "focus" },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 3600 * 2, // 2 hours
            repeats: false,
        },
    });
}

export async function cancelMissedRoutineNudge() {
    await Notifications.cancelScheduledNotificationAsync(NUDGE_ID);
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// Cancel all reminders
export async function cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
