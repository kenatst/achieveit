import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface SectionHeaderProps {
    label: string;
    icon: LucideIcon;
    isOpen: boolean;
    onToggle: () => void;
}

export default function SectionHeader({ label, icon: Icon, isOpen, onToggle }: SectionHeaderProps) {
    const { colors } = useTheme();

    return (
        <Pressable style={styles.sectionHeader} onPress={onToggle}>
            <Icon color={colors.ink} size={18} strokeWidth={1.8} />
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>{label}</Text>
            {isOpen ? (
                <ChevronUp color={colors.inkFaint} size={18} />
            ) : (
                <ChevronDown color={colors.inkFaint} size={18} />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        gap: 10,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
    },
});
