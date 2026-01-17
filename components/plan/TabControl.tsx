import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { triggerSelection } from "@/utils/haptics";

interface TabControlProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function TabControl({ tabs, activeTab, onTabChange }: TabControlProps) {
    const { colors } = useTheme();
    const [layout, setLayout] = useState<{ width: number; x: number }[]>([]);

    const activeIndex = tabs.indexOf(activeTab);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            {/* Background pill indicator */}
            {layout.length === tabs.length && (
                <MotiView
                    animate={{
                        translateX: layout[activeIndex]?.x || 0,
                        width: layout[activeIndex]?.width || 0,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={[styles.indicator, { backgroundColor: colors.backgroundDeep }]} // Changed to dark/deep for contrast
                />
            )}

            {tabs.map((tab, i) => (
                <Pressable
                    key={tab}
                    onLayout={(e) => {
                        const { width, x } = e.nativeEvent.layout;
                        setLayout((prev) => {
                            const newLayout = [...prev];
                            newLayout[i] = { width, x };
                            return newLayout;
                        });
                    }}
                    onPress={() => {
                        if (activeTab !== tab) {
                            triggerSelection();
                            onTabChange(tab);
                        }
                    }}
                    style={styles.tab}
                    hitSlop={8}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === tab ? colors.ink : colors.inkMuted,
                                fontWeight: activeTab === tab ? "700" : "500",
                            },
                        ]}
                    >
                        {tab}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderRadius: 100,
        padding: 4,
        borderWidth: 1,
        marginHorizontal: 32,
        marginBottom: 20,
        position: "relative",
        height: 52, // Fixed height for elegance
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    tabText: {
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    indicator: {
        position: "absolute",
        top: 4,
        bottom: 4,
        borderRadius: 100,
        zIndex: 0,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
});
