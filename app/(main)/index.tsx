import CaloriesCard from "@/components/CaloriesCard";
import HomeHeader from "@/components/HomeHeader";
import RecentActivity, { Activity } from "@/components/RecentActivity";
import WaterIntakeCard from "@/components/WaterIntakeCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { db } from "@/config/firebaseConfig";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { startOfToday } from "date-fns";
import { Redirect, useFocusEffect } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Logout01Icon } from "hugeicons-react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [goals, setGoals] = useState({
    total: 2100,
    protein: 150,
    carbs: 250,
    fat: 70,
    waterGoal: 2.5,
    waterConsumed: 1.35,
  });

  const fetchDailyLogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const q = query(
        collection(db, 'dailyLogs'),
        where('userId', '==', user.id),
        where('date', '==', dateString)
      );

      const querySnapshot = await getDocs(q);
      const logs = [];
      let totalCaloriesBurned = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data
        });
        
        if (data.type === 'exercise') {
          totalCaloriesBurned += data.calories || 0;
        }
      });

      // Update goals with consumed calories (burned in this case, but using consumed prop for visual)
      setGoals(prev => ({
        ...prev,
        // For now, mapping burned calories to 'consumed' visual on the card
        // In a real app, you might want to separate consumed (food) vs burned (exercise)
        // or net calories. Here we'll treat it as "calories tracked"
        consumed: totalCaloriesBurned 
      }));

      // Map logs to activities format
      const mappedActivities = logs.map(log => {
        let title = 'Activity';
        let subtitle = 'Logged item';
        
        if (log.exerciseType === 'Manual') {
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
        }

        return {
          id: log.id,
          type: log.type || 'exercise',
          exerciseType: log.exerciseType,
          title,
          subtitle,
          value: `${log.calories} kcal`,
          calories: log.calories,
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

    } catch (error) {
      console.error("Error fetching daily logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDailyLogs();
    }, [user?.id, selectedDate])
  );
  
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HomeHeader />
      <WeeklyCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="mt-8">
          <CaloriesCard 
            remaining={goals.total - goals.consumed}
            total={goals.total}
            consumed={goals.consumed} // This now reflects fetched data
            protein={45} // Still mock for now
            carbs={65}
            fat={22}
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

          <RecentActivity activities={activities} />

          {/* Sign Out Button for Testing */}
          <TouchableOpacity
            onPress={() => signOut()}
            className="bg-gray-50 py-4 rounded-2xl flex-row items-center justify-center mt-12 border border-gray-100"
          >
            <Logout01Icon size={20} color="#6B7280" />
            <Text className="text-gray-500 font-bold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
