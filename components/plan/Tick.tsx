import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface TickProps {
    on: boolean;
    onPress: () => void;
}

export default function Tick({ on, onPress }: TickProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            style={[
                styles.tick,
                { borderColor: colors.dividerStrong },
                on && { backgroundColor: colors.sage, borderColor: colors.sage },
            ]}
            onPress={onPress}
            hitSlop={8}
        >
            {on && <Check color="#FFFFFF" size={12} strokeWidth={3} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tick: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
});
