import Colors from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
    AiSettingIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    Dumbbell01Icon,
    RulerIcon,
    UserIcon,
    WeightScaleIcon,
    Sword01Icon
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

// Mock icons for gender and goal if they don't exist in basic hugeicons
const MaleIcon = UserIcon;
const FemaleIcon = UserIcon;
const GymIcon = Dumbbell01Icon;

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const updateProgress = (step: number) => {
    Animated.spring(progress, {
      toValue: (step + 1) / STEPS.length,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();

    // Reset and trigger entrance animation for new step content
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
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
      <View className="px-8 mt-8">
        <View className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-primary"
            style={{ width: progressWidth }}
          />
        </View>
        <View className="flex-row justify-between mt-3">
            <Text className="text-[10px] font-black text-primary uppercase tracking-widest">
              Step {currentStep + 1}
            </Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
            </Text>
        </View>
      </View>
    );
  };

  const OptionCard = ({ 
    title, 
    isSelected, 
    onPress, 
    icon : IconComponent 
  }: { 
    title: string; 
    isSelected: boolean; 
    onPress: () => void; 
    icon: any 
  }) => {
    const Icon = IconComponent || UserIcon;
    return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        shadowColor: isSelected ? Colors.light.primary : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isSelected ? 0.1 : 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
      className={`flex-row items-center p-5 rounded-[24px] mb-4 border-2 ${
        isSelected 
        ? "bg-white border-primary" 
        : "bg-white border-transparent"
      }`}
    >
      <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
        isSelected ? "bg-primary" : "bg-gray-50"
      }`}>
        <Icon size={26} color={isSelected ? "white" : "#6B7280"} />
      </View>
      <View className="ml-4 flex-1">
        <Text className={`text-lg font-bold ${
          isSelected ? "text-gray-900" : "text-gray-700"
        }`}>
          {title}
        </Text>
        {isSelected && (
          <Text className="text-primary text-xs font-bold mt-0.5">Selected</Text>
        )}
      </View>
      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
            <ArrowRight01Icon size={14} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

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
              icon={WeightScaleIcon} 
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
              icon={AiSettingIcon} 
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
              icon={Sword01Icon} 
              isSelected={workout === "2-3"} 
              onPress={() => setWorkout("2-3")} 
            />
            <OptionCard 
              title="3-4 Days / Week" 
              icon={Sword01Icon} 
              isSelected={workout === "3-4"} 
              onPress={() => setWorkout("3-4")} 
            />
            <OptionCard 
              title="5-6 Days / Week" 
              icon={GymIcon} 
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
                <RulerIcon size={24} color="#9CA3AF" />
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
                <WeightScaleIcon size={24} color="#9CA3AF" />
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

      <View className="flex-1 px-8 pt-12">
        <Animated.View 
          style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }}
          className="mb-10"
        >
          <Text className="text-4xl font-black text-gray-900 mb-2 leading-[48px]">
            {STEPS[currentStep].title}
          </Text>
          <Text className="text-gray-400 font-bold text-lg leading-6">
            {STEPS[currentStep].description}
          </Text>
        </Animated.View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View
             style={{ 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }}
          >
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        <View className="flex-row items-center space-x-4 pb-10 pt-4 bg-white">
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              className="w-16 h-16 bg-gray-50 rounded-3xl items-center justify-center border border-gray-100"
            >
              <ArrowLeft01Icon size={24} color="#111827" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={isNextDisabled() || loading}
            className={`flex-1 h-16 rounded-[24px] items-center justify-center flex-row shadow-2xl ${
              isNextDisabled() || loading ? "bg-gray-200" : "bg-primary"
            }`}
            style={!(isNextDisabled() || loading) ? {
              shadowColor: Colors.light.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
            } : {}}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">
                  {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                </Text>
                <ArrowRight01Icon size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
