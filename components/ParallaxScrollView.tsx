import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";

interface ParallaxScrollViewProps {
    headerImage?: React.ReactNode;
    headerHeight?: number;
    children: React.ReactNode;
    stickyHeaderIndex?: number;
    style?: any;
    contentContainerStyle?: any;
    showsVerticalScrollIndicator?: boolean;
}

export default function ParallaxScrollView({
    headerImage,
    headerHeight = 300,
    children,
    style,
    contentContainerStyle,
    showsVerticalScrollIndicator = false,
}: ParallaxScrollViewProps) {
    const { colors, isDark } = useTheme();
    const scrollY = new Animated.Value(0);

    const headerScale = scrollY.interpolate({
        inputRange: [-headerHeight, 0],
        outputRange: [2, 1],
        extrapolateLeft: "extend",
        extrapolateRight: "clamp",
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [-headerHeight, 0, headerHeight],
        outputRange: [-headerHeight / 2, 0, headerHeight * 0.5],
        extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.6],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }, style]}>
            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true } // Native driver for opacity/transform
                )}
                scrollEventThrottle={16}
                style={{ flex: 1 }}
                contentContainerStyle={[
                    { paddingTop: headerHeight, paddingBottom: 100 }, // Safe padding
                    contentContainerStyle,
                ]}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            >
                {children}
            </Animated.ScrollView>

            {/* Parallax Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        height: headerHeight,
                        transform: [{ scale: headerScale }, { translateY: headerTranslateY }],
                        opacity: headerOpacity,
                    },
                ]}
            >
                {headerImage}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        overflow: "hidden",
        zIndex: 0, // Behind scrollview content
    },
});
