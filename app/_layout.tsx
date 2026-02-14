import { CLERK_PUBLISHABLE_KEY, tokenCache } from "@/constants/Clerk";
import { useUserSync } from "@/hooks/useUserSync";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Globally sync user data to Firestore and Local Storage
  useUserSync();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // If user is signed in and in auth group, redirect to home
      router.replace("/");
    } else if (!isSignedIn && !inAuthGroup) {
      // If user is NOT signed in and NOT in auth group, redirect to sign-in
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(auth)/sign-up" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
