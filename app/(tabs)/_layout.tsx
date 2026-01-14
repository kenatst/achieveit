import React from "react";
import { Tabs } from "expo-router";
import {
  Sparkles,
  FolderOpen,
  BarChart2,
} from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopWidth: 0.5,
          borderTopColor: Colors.light.divider,
          height: 88,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: Colors.light.rust,
        tabBarInactiveTintColor: Colors.light.inkMuted,
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
            <Sparkles color={color} size={22} strokeWidth={1.8} />
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
    </Tabs>
  );
}
