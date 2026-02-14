import { db } from "@/config/firebaseConfig";
import { getGeminiModel } from "@/config/geminiConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Brain01Icon, CheckmarkCircle01Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Animated, SafeAreaView, Text, View } from "react-native";

interface Step {
  id: number;
  text: string;
  status: "pending" | "loading" | "completed";
}

export default function AiGenerate() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, text: "Analyzing your fitness profile", status: "loading" },
    { id: 2, text: "Connecting to Gemini AI", status: "pending" },
    { id: 3, text: "Personalizing your daily targets", status: "pending" },
    { id: 4, text: "Finalizing your health plan", status: "pending" },
  ]);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    startChecklist();
    generateHealthProfile();
  }, []);

  const updateStepStatus = (id: number, status: "pending" | "loading" | "completed") => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status } : step
    ));
  };

  const startChecklist = async () => {
    // Step 1 is already loading
    await new Promise(r => setTimeout(r, 1500));
    updateStepStatus(1, "completed");
    updateStepStatus(2, "loading");

    await new Promise(r => setTimeout(r, 1500));
    updateStepStatus(2, "completed");
    updateStepStatus(3, "loading");

    await new Promise(r => setTimeout(r, 2000));
    updateStepStatus(3, "completed");
    updateStepStatus(4, "loading");
  };

  const generateHealthProfile = async () => {
    if (!user) return;

    try {
      const { gender, goal, workout, birthdate, height, weight } = params;
      
      const birthDate = new Date(birthdate as string);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const prompt = `
        Acting as a professional nutritionist and fitness expert, calculate the daily nutritional requirements for a user with the following profile:
        - Gender: ${gender}
        - Age: ${age}
        - Goal: ${goal} (lose/gain/maintain)
        - Activity Level: ${workout} workouts per week
        - Height: ${height} feet
        - Weight: ${weight} kg

        Please provide the following values in a strict JSON format:
        {
          "dailyCalories": number (as kcal),
          "protein": number (in grams),
          "carbs": number (in grams),
          "fats": number (in grams),
          "waterIntake": number (in liters),
          "insight": "a short (max 15 words) professional fitness insight based on their goal"
        }
        Only return the JSON.
      `;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      
      const healthData = JSON.parse(jsonMatch[0]);
      
      const userData = {
        ...params,
        ...healthData,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      };

      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, userData, { merge: true });

      // Final step completion based on AI result
      updateStepStatus(4, "completed");
      setIsCompleted(true);

      setTimeout(() => {
        router.replace("/");
      }, 2000);

    } catch (error) {
      console.error("AI Generation Error:", error);
      setTimeout(() => router.replace("/"), 3000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
      <Animated.View 
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        className="w-full items-center"
      >
        <View className="w-24 h-24 bg-primary-50 rounded-full items-center justify-center mb-10 shadow-sm">
          {isCompleted ? (
            <CheckmarkCircle01Icon size={48} color={Colors.light.primary} />
          ) : (
            <Brain01Icon size={48} color={Colors.light.primary} />
          )}
        </View>

        <Text className="text-3xl font-bold text-gray-900 text-center mb-8">
          {isCompleted ? "Profile Ready!" : "Creating Your Plan"}
        </Text>
        
        <View className="w-full bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
          {steps.map((step) => (
            <View key={step.id} className="flex-row items-center mb-6 last:mb-0">
              <View className="w-6 h-6 items-center justify-center">
                {step.status === "completed" ? (
                  <CheckmarkCircle01Icon size={20} color={Colors.light.primary} />
                ) : step.status === "loading" ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <View className="w-2 h-2 rounded-full bg-gray-200" />
                )}
              </View>
              <Text className={`ml-4 text-base font-medium ${
                step.status === "completed" ? "text-gray-900" : 
                step.status === "loading" ? "text-primary-600" : "text-gray-400"
              }`}>
                {step.text}
              </Text>
            </View>
          ))}
        </View>
        
        <Text className="mt-10 text-gray-400 text-center text-sm leading-5 px-6 italic">
          "The secret of getting ahead is getting started."
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
