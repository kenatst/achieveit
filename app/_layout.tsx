import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlansProvider } from "@/contexts/PlansContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const ONBOARDING_KEY = "has_completed_onboarding";

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(value === "true");
      } catch (e) {
        setHasOnboarded(false);
      }
      setIsReady(true);
      SplashScreen.hideAsync();
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isReady || hasOnboarded === null) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!hasOnboarded && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [isReady, hasOnboarded, segments]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="questionnaire"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="generating"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="plan/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PlansProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </PlansProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
