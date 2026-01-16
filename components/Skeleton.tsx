import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { MotiView } from "moti";

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

/**
 * Elegant skeleton loading component with shimmer effect
 */
export default function Skeleton({
    width = "100%",
    height = 20,
    borderRadius = 8,
    style
}: SkeletonProps) {
    const { colors } = useTheme();

    return (
        <MotiView
            from={{ opacity: 0.3 }}
            animate={{ opacity: 0.7 }}
            transition={{
                type: "timing",
                duration: 800,
                loop: true,
            }}
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colors.divider,
                },
                style,
            ]}
        />
    );
}

/**
 * Skeleton card for plan preview during loading
 */
export function SkeletonCard() {
    const { colors, shadows } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }, shadows.card]}>
            <Skeleton width="70%" height={24} borderRadius={6} />
            <View style={{ height: 12 }} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="90%" height={16} style={{ marginTop: 8 }} />
            <View style={{ height: 20 }} />
            <Skeleton width="40%" height={12} />
        </View>
    );
}

/**
 * Skeleton for plan generation screen
 */
export function PlanGeneratingSkeleton() {
    const { colors } = useTheme();

    return (
        <View style={styles.generatingContainer}>
            {/* Title skeleton */}
            <Skeleton width={200} height={28} borderRadius={8} style={{ alignSelf: "center" }} />
            <View style={{ height: 16 }} />
            <Skeleton width={280} height={18} borderRadius={6} style={{ alignSelf: "center" }} />

            {/* Progress bar skeleton */}
            <View style={{ height: 40 }} />
            <Skeleton width="100%" height={6} borderRadius={3} />

            {/* Stages skeleton */}
            <View style={{ height: 32 }} />
            {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.stageRow}>
                    <Skeleton width={20} height={20} borderRadius={10} />
                    <Skeleton width={180} height={16} borderRadius={6} style={{ marginLeft: 14 }} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: "hidden",
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    generatingContainer: {
        paddingHorizontal: 32,
    },
    stageRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
});
