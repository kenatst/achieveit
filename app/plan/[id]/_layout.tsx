import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function PlanLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="overview" />
            <Stack.Screen name="weekly" />
            <Stack.Screen name="routines" />
            <Stack.Screen name="goals" />
            <Stack.Screen name="export" />
        </Stack>
    );
}
