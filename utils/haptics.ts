import * as Haptics from "expo-haptics";

/**
 * Haptic feedback utilities for premium tactile experience
 */

// Light tap - for navigation, button press
export const lightTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Medium tap - for task completion, checkbox toggle
export const mediumTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Heavy tap - for milestone/phase completion
export const heavyTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

// Success - for major achievements (week completed, plan finished)
export const successNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Warning - for destructive actions confirmation
export const warningNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Error - for failed actions
export const errorNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

// Selection change - for picker/segment changes
export const selectionChanged = () => {
    Haptics.selectionAsync();
};
