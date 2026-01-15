import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";
import Typography from "@/constants/typography";

const { width } = Dimensions.get("window");
const TIPS_STORAGE_KEY = "achieveit_seen_tips";

interface HelpTipProps {
    id: string;
    message: string;
    position?: "top" | "bottom";
    onDismiss?: () => void;
}

export default function HelpTip({ id, message, position = "top", onDismiss }: HelpTipProps) {
    const [visible, setVisible] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(position === "top" ? -20 : 20)).current;

    useEffect(() => {
        checkIfSeen();
    }, []);

    const checkIfSeen = async () => {
        try {
            const seenTips = await AsyncStorage.getItem(TIPS_STORAGE_KEY);
            const parsed = seenTips ? JSON.parse(seenTips) : [];
            if (!parsed.includes(id)) {
                setVisible(true);
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        } catch (e) {
            // Ignore errors, just don't show tip
        }
    };

    const handleDismiss = async () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: position === "top" ? -20 : 20,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(async () => {
            setVisible(false);
            try {
                const seenTips = await AsyncStorage.getItem(TIPS_STORAGE_KEY);
                const parsed = seenTips ? JSON.parse(seenTips) : [];
                if (!parsed.includes(id)) {
                    await AsyncStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify([...parsed, id]));
                }
            } catch (e) {
                // Ignore
            }
            onDismiss?.();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                position === "bottom" && styles.containerBottom,
                { opacity, transform: [{ translateY }] },
            ]}
        >
            <View style={styles.tipContent}>
                <Text style={styles.tipText}>{message}</Text>
                <Pressable onPress={handleDismiss} hitSlop={12}>
                    <X color={Colors.light.inkMedium} size={18} strokeWidth={2} />
                </Pressable>
            </View>
        </Animated.View>
    );
}

// Component to reset all tips (for testing)
export const resetAllTips = async () => {
    await AsyncStorage.removeItem(TIPS_STORAGE_KEY);
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 100,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    containerBottom: {
        top: undefined,
        bottom: 120,
    },
    tipContent: {
        backgroundColor: Colors.light.surface,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.light.divider,
        ...Colors.shadows.card,
    },
    tipText: {
        ...Typography.sans.body,
        flex: 1,
        color: Colors.light.inkMedium,
        fontSize: 14,
    },
});
