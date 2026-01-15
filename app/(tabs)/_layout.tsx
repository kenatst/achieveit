import React from "react";
import { Tabs } from "expo-router";
import {
  PenLine,
  FolderOpen,
  BarChart2,
  Settings,
  Crosshair,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.divider,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: colors.rust,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <PenLine color={color} size={22} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus",
          tabBarIcon: ({ color, size }) => (
            <Crosshair color={color} size={22} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, size }) => (
            <FolderOpen color={color} size={22} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <BarChart2 color={color} size={22} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={22} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
