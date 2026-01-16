import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { triggerSelection } from "@/utils/haptics";
import Typography from "@/constants/typography";

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
        <View style={[styles.container, { backgroundColor: colors.surface + "CC", borderColor: colors.divider }]}>
            {/* Background pill indicator */}
            {layout.length === tabs.length && (
                <MotiView
                    animate={{
                        translateX: layout[activeIndex]?.x || 0,
                        width: layout[activeIndex]?.width || 0,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={[styles.indicator, { backgroundColor: colors.backgroundDeep }]}
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
                                fontWeight: activeTab === tab ? "600" : "500",
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
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        marginHorizontal: 16,
        marginBottom: 8,
        position: "relative",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        zIndex: 1,
    },
    tabText: {
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    indicator: {
        position: "absolute",
        top: 4,
        bottom: 4,
        borderRadius: 20,
        zIndex: 0,
    },
});
