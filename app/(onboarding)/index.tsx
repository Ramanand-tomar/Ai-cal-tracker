import Colors from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
    HeightIcon,
    UserIcon,
    WeightIcon,
    Work01Icon
} from "hugeicons-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const STEPS = [
  { title: "Select Gender", description: "Help us personalize your experience" },
  { title: "What's your Goal?", description: "Set a target that motivates you" },
  { title: "Workout Details", description: "How active are you during the week?" },
  { title: "Birthdate", description: "To calculate your calories more accurately" },
  { title: "Physical Stats", description: "Enter your height and weight" },
];

export default function Onboarding() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  // Form Data
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [workout, setWorkout] = useState("");
  const [birthdate, setBirthdate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const updateProgress = (step: number) => {
    Animated.timing(progress, {
      toValue: (step + 1) / STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).current.start();
  };

  React.useEffect(() => {
    updateProgress(currentStep);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const onboardingData = {
        gender,
        goal,
        workout,
        birthdate: birthdate.toISOString(),
        height,
        weight,
      };

      // 1. Save to LocalStorage (optional but good for persistence)
      await AsyncStorage.setItem("user_onboarding", JSON.stringify(onboardingData));

      // 2. Navigate to AI generation screen with params
      // We pass data as query params for simplicity in this flow
      router.push({
        pathname: "/(onboarding)/ai-generate",
        params: onboardingData
      });
    } catch (error) {
      console.error("Error navigating to AI generation:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    const progressWidth = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View className="px-8 mt-4">
        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-primary"
            style={{ width: progressWidth }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
            <Text className="text-xs font-bold text-primary">STEP {currentStep + 1}</Text>
            <Text className="text-xs font-medium text-gray-400">{currentStep + 1} of {STEPS.length}</Text>
        </View>
      </View>
    );
  };

  const OptionCard = ({ 
    title, 
    isSelected, 
    onPress, 
    icon : Icon 
  }: { 
    title: string; 
    isSelected: boolean; 
    onPress: () => void; 
    icon: any 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-6 rounded-3xl mb-4 border-2 shadow-sm ${
        isSelected 
        ? "bg-primary-50 border-primary" 
        : "bg-white border-gray-100"
      }`}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
        isSelected ? "bg-primary" : "bg-gray-50"
      }`}>
        <Icon size={24} color={isSelected ? "white" : "#9CA3AF"} />
      </View>
      <Text className={`ml-4 text-lg font-bold ${
        isSelected ? "text-primary-700" : "text-gray-700"
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Gender
        return (
          <View className="pt-6">
            <OptionCard 
              title="Male" 
              icon={MaleIcon} 
              isSelected={gender === "male"} 
              onPress={() => setGender("male")} 
            />
            <OptionCard 
              title="Female" 
              icon={FemaleIcon} 
              isSelected={gender === "female"} 
              onPress={() => setGender("female")} 
            />
            <OptionCard 
              title="Other" 
              icon={UserIcon} 
              isSelected={gender === "other"} 
              onPress={() => setGender("other")} 
            />
          </View>
        );
      case 1: // Goal
        return (
          <View className="pt-6">
            <OptionCard 
              title="Lose Weight" 
              icon={WeightIcon} 
              isSelected={goal === "lose"} 
              onPress={() => setGoal("lose")} 
            />
            <OptionCard 
              title="Gain Weight" 
              icon={GymIcon} 
              isSelected={goal === "gain"} 
              onPress={() => setGoal("gain")} 
            />
            <OptionCard 
              title="Maintain Health" 
              icon={AiSetting01Icon} 
              isSelected={goal === "maintain"} 
              onPress={() => setGoal("maintain")} 
            />
          </View>
        );
      case 2: // Workout
        return (
          <View className="pt-6">
            <OptionCard 
              title="2-3 Days / Week" 
              icon={Work01Icon} 
              isSelected={workout === "2-3"} 
              onPress={() => setWorkout("2-3")} 
            />
            <OptionCard 
              title="3-4 Days / Week" 
              icon={Work01Icon} 
              isSelected={workout === "3-4"} 
              onPress={() => setWorkout("3-4")} 
            />
            <OptionCard 
              title="5-6 Days / Week" 
              icon={HealthIcon} 
              isSelected={workout === "5-6"} 
              onPress={() => setWorkout("5-6")} 
            />
          </View>
        );
      case 3: // Birthdate
        return (
          <View className="pt-6 items-center">
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-8 items-center justify-center flex-row shadow-sm"
            >
              <Calendar01Icon size={32} color={Colors.light.primary} />
              <View className="ml-4">
                <Text className="text-gray-400 font-bold text-xs uppercase mb-1">Select Birthdate</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {birthdate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setBirthdate(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
            <Text className="mt-8 text-gray-400 text-center leading-5 px-4">
                Your age helps us calculate your Basal Metabolic Rate (BMR) for better accuracy.
            </Text>
          </View>
        );
      case 4: // Stats
        return (
          <View className="pt-6 space-y-6">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-2">Height (Feet & Inches)</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-5 shadow-sm">
                <HeightIcon size={24} color="#9CA3AF" />
                <TextInput
                  placeholder="e.g. 5.11"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="flex-1 ml-4 text-xl font-bold text-gray-900"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text className="text-gray-400 font-bold ml-2">ft</Text>
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-2">Weight (kg)</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-5 shadow-sm">
                <WeightIcon size={24} color="#9CA3AF" />
                <TextInput
                  placeholder="e.g. 70"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="flex-1 ml-4 text-xl font-bold text-gray-900"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text className="text-gray-400 font-bold ml-2">kg</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0: return !gender;
      case 1: return !goal;
      case 2: return !workout;
      case 3: return false; 
      case 4: return !height || !weight;
      default: return false;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderProgress()}

      <View className="flex-1 px-8 pt-10">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">{STEPS[currentStep].title}</Text>
          <Text className="text-gray-500 font-medium text-lg leading-6">{STEPS[currentStep].description}</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {renderStepContent()}
        </ScrollView>

        <View className="flex-row space-x-4 pb-10 pt-4 bg-white">
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
            >
              <ArrowLeft01Icon size={24} color="#111827" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={isNextDisabled() || loading}
            className={`flex-1 h-16 rounded-2xl items-center justify-center flex-row shadow-lg ${
              isNextDisabled() || loading ? "bg-primary-300" : "bg-primary shadow-primary-200"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">
                  {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
                </Text>
                <ArrowRight01Icon size={24} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
