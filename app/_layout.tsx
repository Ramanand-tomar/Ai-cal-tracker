import { db } from "@/config/firebaseConfig";
import { CLERK_PUBLISHABLE_KEY, tokenCache } from "@/constants/Clerk";
import { useUserSync } from "@/hooks/useUserSync";
import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import "../global.css";

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Globally sync user data to Firestore and Local Storage
  useUserSync();

  useEffect(() => {
    if (!isSignedIn || !user) {
      setOnboardingCompleted(null);
      return;
    }

    // Direct listen to user document for onboarding status
    const unsub = onSnapshot(doc(db, "users", user.id), (docS) => {
      if (docS.exists()) {
        setOnboardingCompleted(docS.data().onboardingCompleted || false);
      } else {
        setOnboardingCompleted(false);
      }
    });

    return () => unsub();
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || (onboardingCompleted === null && isSignedIn)) return;

    const segment = segments[0] as string;
    const inAuthGroup = segment === "(auth)";
    const inOnboardingGroup = segment === "(onboarding)";

    if (isSignedIn) {
      if (onboardingCompleted === false && !inOnboardingGroup) {
        // Redirect to onboarding if not completed
        router.replace("/(onboarding)");
      } else if (onboardingCompleted === true && (inAuthGroup || inOnboardingGroup)) {
        // Redirect to home if onboarding is done and user is in auth or onboarding pages
        router.replace("/");
      }
    } else if (!inAuthGroup) {
      // If user is NOT signed in and NOT in auth group, redirect to sign-in
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded, onboardingCompleted, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(main)/index" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(auth)/sign-up" />
      <Stack.Screen name="(onboarding)/index" />
      <Stack.Screen name="(onboarding)/ai-generate" />
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
