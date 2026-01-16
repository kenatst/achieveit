import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for premium tactile experience
 */

// Light tap - for minor interactions (toggle, select option)
export const triggerLight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Medium tap - for significant actions (complete task, log routine)
export const triggerMedium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Heavy tap - for major completions (finish phase, reach checkpoint)
export const triggerHeavy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

// Success notification - for celebrations (plan created, goal achieved)
export const triggerSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Warning notification - for alerts
export const triggerWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Error notification - for failures
export const triggerError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

// Selection changed - for picker/segment controls
export const triggerSelection = () => {
    Haptics.selectionAsync();
};
