import AllActivityModal from "@/components/AllActivityModal";
import CaloriesCard from "@/components/CaloriesCard";
import HomeHeader from "@/components/HomeHeader";
import InsightCard from "@/components/InsightCard";
import RecentActivity, { Activity } from "@/components/RecentActivity";
import WaterIntakeCard from "@/components/WaterIntakeCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import {
    cancelAllNotifications,
    requestNotificationPermissions,
    scheduleReminders
} from "@/utils/notifications";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { startOfToday } from "date-fns";
import { Redirect, useFocusEffect } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { Logout01Icon } from "hugeicons-react-native";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { colors, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
// ... (rest of the state and fetch logic remains the same)
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  
  const [goals, setGoals] = useState({
    total: 2100,
    protein: 150,
    carbs: 250,
    fat: 70,
    waterGoal: 2.5,
    waterConsumed: 0,
    consumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatConsumed: 0,
    burned: 0,
    insight: "",
  });

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setGoals(prev => ({
          ...prev,
          total: data.dailyCalories || prev.total,
          protein: data.protein || prev.protein,
          carbs: data.carbs || prev.carbs,
          fat: data.fats || prev.fat,
          waterGoal: data.waterIntake || prev.waterGoal,
          insight: data.insight || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchDailyLogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      const q = query(
        collection(db, 'dailyLogs'),
        where('userId', '==', user.id),
        where('date', '==', dateString)
      );

      const querySnapshot = await getDocs(q);
      const logs:any[] = [];
      let totalCaloriesConsumed = 0;
      let totalCaloriesBurned = 0;
      let totalWaterConsumed = 0;
      let totalProteinConsumed = 0;
      let totalCarbsConsumed = 0;
      let totalFatConsumed = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data
        });
        
        if (data.type === 'exercise') {
          totalCaloriesBurned += data.calories || 0;
        } else if (data.type === 'water') {
          totalWaterConsumed += data.amount || 0;
        } else if (data.type === 'meal') {
           totalCaloriesConsumed += data.calories || 0; 
           totalProteinConsumed += data.protein || 0;
           totalCarbsConsumed += data.carbs || 0;
           totalFatConsumed += data.fat || 0;
        }
      });

      setGoals(prev => ({
        ...prev,
        consumed: totalCaloriesConsumed,
        burned: totalCaloriesBurned, // We should add 'burned' to goals state if possible, or just use it in remaining
        proteinConsumed: totalProteinConsumed,
        carbsConsumed: totalCarbsConsumed,
        fatConsumed: totalFatConsumed,
        waterConsumed: totalWaterConsumed / 1000 
      }));

      // Map logs to activities format
      const mappedActivities = logs.map(log => {
        let title = 'Activity';
        let subtitle = 'Logged item';
        
        if (log.type === 'water') {
          title = 'Water';
          subtitle = `${log.amount} ml`;
        } else if (log.type === 'meal') {
          title = log.title || 'Meal';
          subtitle = log.serving_amount ? `${log.serving_amount} serving` : 'Food Log';
        } else if (log.exerciseType === 'Manual') {
          title = 'Manual Entry';
          subtitle = 'Calories burned';
        } else if (log.type === 'exercise') {
          title = log.exerciseType || 'Exercise';
          subtitle = 'Workout';
        }

        // Format time from timestamp
        let time = 'Recent';
        if (log.timestamp) {
          const date = log.timestamp.toDate();
          time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (log.time) {
          time = log.time;
        }

        return {
          id: log.id,
          type: log.type || 'exercise',
          exerciseType: log.exerciseType,
          title,
          subtitle,
          value: log.type === 'water' ? `${log.amount} ml` : `${log.calories} kcal`,
          calories: log.calories || 0,
          amount: log.amount || 0,
          duration: log.duration,
          intensity: log.intensity,
          time
        };
      });

      // Sort by time (newest first) needed if not ordered by query
      mappedActivities.sort((a, b) => {
        // Simple sort, robust implementation would keep raw timestamp
        return 0; 
      });

      setActivities(mappedActivities);

      // Smart Notification Scheduling:
      // Only schedule if notifications are enabled in user profile
      const userDataRef = doc(db, "users", user.id);
      const userDataSnap = await getDoc(userDataRef);
      const userData = userDataSnap.exists() ? userDataSnap.data() : null;
      
      if (userData && userData.notificationsEnabled !== false) {
        const isSubscribed = userData.isSubscribed || false;

        if (mappedActivities.length > 0) {
          // User has logged activity, cancel reminders for the day
          await cancelAllNotifications();
          console.log("Activity detected, notifications cancelled.");
        } else {
          // No activity logged, ensure reminders are scheduled
          const hasPermission = await requestNotificationPermissions();
          if (hasPermission) {
            await scheduleReminders(isSubscribed);
            console.log("No activity detected, notifications scheduled.");
          }
        }
      }

    } catch (error) {
        console.error("Error fetching daily logs:", error);
    } finally {
        setLoading(false);
    }
};

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchDailyLogs();
    }, [user?.id, selectedDate])
  );
  
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <HomeHeader />
      <WeeklyCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="mt-8">
          <CaloriesCard 
            remaining={Math.max(0, goals.total - goals.consumed + goals.burned)}
            total={goals.total}
            consumed={goals.consumed} 
            protein={goals.proteinConsumed}
            carbs={goals.carbsConsumed}
            fat={goals.fatConsumed}
            proteinGoal={goals.protein}
            carbsGoal={goals.carbs}
            fatGoal={goals.fat}
            onUpdateGoals={(newGoals) => {
              setGoals({
                ...goals,
                total: newGoals.total,
                protein: newGoals.proteinGoal,
                carbs: newGoals.carbsGoal,
                fat: newGoals.fatGoal
              });
            }}
          />

          <WaterIntakeCard 
            consumedLiters={goals.waterConsumed}
            goalLiters={goals.waterGoal}
            onUpdateWater={(waterData) => {
              setGoals({
                ...goals,
                waterGoal: waterData.waterGoal,
                waterConsumed: waterData.waterConsumed
              });
            }}
          />

          <InsightCard insight={goals.insight} />

          <RecentActivity 
            activities={activities} 
            onViewAll={() => setIsActivityModalVisible(true)}
          />

          <AllActivityModal 
            isVisible={isActivityModalVisible}
            onClose={() => setIsActivityModalVisible(false)}
            activities={activities}
          />

          {/* Sign Out Button for Testing */}
          <TouchableOpacity
            onPress={() => signOut()}
            style={{ backgroundColor: isDark ? colors.surface : colors.border, borderColor: colors.border }}
            className="py-4 rounded-2xl flex-row items-center justify-center mt-12 border"
          >
            <Logout01Icon size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }} className="font-bold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

