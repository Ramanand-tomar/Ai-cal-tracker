import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  uid: string;
  email: string | undefined;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | undefined;
  dailyCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  waterIntake?: number;
  onboardingCompleted?: boolean;
}

interface UserContextType {
  userData: UserProfile | null;
  loading: boolean;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (isLoaded && isSignedIn && user) {
      const userRef = doc(db, 'users', user.id);
      
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData({
            uid: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
            ...docSnap.data(),
          } as UserProfile);
        } else {
          // If Firestore doc doesn't exist yet, use Clerk data
          setUserData({
            uid: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            imageUrl: user.imageUrl,
          });
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to user data:", error);
        setLoading(false);
      });
    } else if (isLoaded && !isSignedIn) {
      setUserData(null);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLoaded, isSignedIn, user?.id]);

  const refreshUserData = () => {
    // onSnapshot handles real-time updates, but we can add manual logic if needed
  };

  return (
    <UserContext.Provider value={{ userData, loading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
};
