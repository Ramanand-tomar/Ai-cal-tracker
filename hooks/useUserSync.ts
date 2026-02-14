import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect } from "react";

export const useUserSync = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        const syncUser = async () => {
            // Return early if not loaded or not signed in
            if (!isLoaded || !isSignedIn || !user) return;

            try {
                const userRef = doc(db, "users", user.id);
                const userSnap = await getDoc(userRef);

                const userData = {
                    uid: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    fullName: user.fullName,
                };

                // Save to LocalStorage (AsyncStorage) as requested
                await AsyncStorage.setItem("user_profile", JSON.stringify(userData));
                console.log("User profile saved to LocalStorage");

                if (!userSnap.exists()) {
                    // User doesn't exist in Firestore, create them
                    await setDoc(userRef, {
                        ...userData,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                    });
                    console.log("User initialized in Firestore");
                } else {
                    // Update last login and potentially other fields if they changed
                    await setDoc(
                        userRef,
                        {
                            lastLogin: serverTimestamp(),
                            imageUrl: user.imageUrl,
                            fullName: user.fullName,
                        },
                        { merge: true }
                    );
                    console.log("User session updated in Firestore");
                }
            } catch (error) {
                console.error("Error syncing user to Firestore/LocalStorage:", error);
            }
        };

        syncUser();
    }, [isLoaded, isSignedIn, user?.id]); // Use user.id as dependency for precision
};
