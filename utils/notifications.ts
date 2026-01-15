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
        console.log("Notifications only work on physical devices");
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Notification permissions denied");
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
    // Cancel all existing reminders first
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

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// Cancel all reminders
export async function cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Motivational messages for variety
const MORNING_MESSAGES = [
    "Ready to crush your goals today? Check your Focus tab.",
    "Small steps lead to big wins. What's your first task?",
    "Today is a fresh opportunity. Make it count!",
    "Your goals are waiting. Let's make progress!",
];

const EVENING_MESSAGES = [
    "How did today go? Log your progress before bed.",
    "Reflect on your wins today. Every step counts!",
    "End the day strong. Review what you accomplished.",
    "Tomorrow starts tonight. Plan your priorities.",
];

export function getRandomMessage(type: "morning" | "evening"): string {
    const messages = type === "morning" ? MORNING_MESSAGES : EVENING_MESSAGES;
    return messages[Math.floor(Math.random() * messages.length)];
}
