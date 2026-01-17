import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonProps) {
    const { colors } = useTheme();

    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{
                type: "timing",
                duration: 800,
                loop: true,
            }}
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.divider,
                },
                style,
            ]}
        />
    );
}

interface SkeletonCardProps {
    lines?: number;
    style?: ViewStyle;
}

export function SkeletonCard({ lines = 3, style }: SkeletonCardProps) {
    const { colors, shadows } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card, style]}>
            <Skeleton width="60%" height={18} style={{ marginBottom: 12 }} />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? "40%" : "100%"}
                    height={14}
                    style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
                />
            ))}
        </View>
    );
}

interface SkeletonListProps {
    count?: number;
    style?: ViewStyle;
}

export function SkeletonList({ count = 4, style }: SkeletonListProps) {
    return (
        <View style={[styles.list, style]}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} lines={2} style={{ marginBottom: 12 }} />
            ))}
        </View>
    );
}

interface SkeletonProgressRingProps {
    size?: number;
}

export function SkeletonProgressRing({ size = 120 }: SkeletonProgressRingProps) {
    const { colors } = useTheme();

    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{
                type: "timing",
                duration: 800,
                loop: true,
            }}
            style={[
                styles.progressRing,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: colors.divider,
                },
            ]}
        >
            <View
                style={[
                    styles.progressRingInner,
                    {
                        width: size - 16,
                        height: size - 16,
                        borderRadius: (size - 16) / 2,
                        backgroundColor: colors.background,
                    },
                ]}
            />
        </MotiView>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: "hidden",
    },
    card: {
        padding: 18,
        borderRadius: 16,
    },
    list: {
        gap: 12,
    },
    progressRing: {
        borderWidth: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    progressRingInner: {
        alignItems: "center",
        justifyContent: "center",
    },
});
