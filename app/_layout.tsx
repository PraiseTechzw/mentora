"use client"

import { Stack } from "expo-router"
import { useFonts } from "expo-font"
import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"
import { UserProvider } from "../contexts/UserContext"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // You can add custom fonts here if needed
  })

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen after fonts are loaded
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <UserProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="video/[id]"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="instructor/upload"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
          <Stack.Screen
          name="onboarding/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </UserProvider>
  )
}
