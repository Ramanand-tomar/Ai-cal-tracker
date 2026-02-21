import { db } from "@/config/firebaseConfig";
import { CLERK_PUBLISHABLE_KEY, tokenCache } from "@/constants/Clerk";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserSync } from "@/hooks/useUserSync";
import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Globally sync user data to Firestore and Local Storage
  useUserSync();

  // Initialize notification listeners
  useNotifications();

  useEffect(() => {
    if (!isSignedIn || !user) {
      setOnboardingCompleted(null);
      return;
    }

    // Direct listen to user document for onboarding status
    const unsub = onSnapshot(doc(db, "users", user.id), {
      next: (docS) => {
        if (docS.exists()) {
          setOnboardingCompleted(docS.data().onboardingCompleted || false);
        } else {
          setOnboardingCompleted(false);
        }
      },
      error: (err) => {
        console.warn("Error listening to user document:", err);
      }
    });

    return () => unsub();
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || (onboardingCompleted === null && isSignedIn) || !isMounted) return;

    const segment = segments[0] as string;
    const inAuthGroup = segment === "(auth)";
    const inOnboardingGroup = segment === "(onboarding)";

    if (isSignedIn) {
      if (onboardingCompleted === false && !inOnboardingGroup) {
        router.replace("/(onboarding)");
      } else if (onboardingCompleted === true && (inAuthGroup || inOnboardingGroup)) {
        router.replace("/");
      }
    } else if (!inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded, onboardingCompleted, segments, isMounted]);

  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };

  return (
    <NavigationProvider value={customTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(onboarding)/index" />
        <Stack.Screen name="(onboarding)/ai-generate" />
      </Stack>
    </NavigationProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider>
          <UserProvider>
            <SafeAreaProvider>
              <InitialLayout />
            </SafeAreaProvider>
          </UserProvider>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

