import AppLoader from "@/components/ui/AppLoader";
import { useTheme } from "@/context/ThemeContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft01Icon, CheckmarkCircle01Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

// Note: In a real app, you'd use a more robust file system library or pre-process images.
// For simplicity in this demo environment, we assume the environment handles the Image/File logic.

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.8;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

export default function AIAnalysisScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const steps = [
    { id: 1, label: "Analyzing food..." },
    { id: 2, label: "Getting Nutrition data..." },
    { id: 3, label: "Get final result" }
  ];

  useEffect(() => {
    if (imageUri) {
        performAIAnalysis();
    }
  }, [imageUri]);

  const performAIAnalysis = async () => {
    try {
      // Step 1: Start Analyzing
      setCurrentStep(0);
      
      // In a real implementation:
      // const file = new File(imageUri as string);
      // const base64Image = await file.base64();
      
      // Mocking AI response for the purpose of dark mode refinement
      setTimeout(() => {
        const mockResult = {
          food_name: "Grilled Salmon with Avocado",
          calories: 450,
          protein: 35,
          carbs: 12,
          fat: 28,
          confidence_score: 0.92
        };
        
        setAiResult(mockResult);
        setCurrentStep(1);
        
        setTimeout(() => {
          setCurrentStep(2);
          setTimeout(() => {
            setCurrentStep(3);
            setIsCompleted(true);
          }, 1500);
        }, 1500);
      }, 2000);

    } catch (error) {
      console.error("AI Analysis Error:", error);
      Alert.alert("Analysis Failed", "Could not analyze the image. Please try again.");
      router.back();
    }
  };

  const AnalysisStep = ({ step, index, currentStep }: { step: typeof steps[0], index: number, currentStep: number }) => {
    const isActive = index === currentStep;
    const isDone = index < currentStep;

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 200).springify()}
        style={[
            styles.stepItem, 
            { backgroundColor: isDark ? colors.surface : 'white', borderColor: isDark ? colors.border : '#F1F5F9' },
            isDone && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7' }
        ]}
      >
        <View style={styles.stepIconContainer}>
          {isDone ? (
            <CheckmarkCircle01Icon size={24} color={isDark ? '#10B981' : colors.primary} variant="stroke" />
          ) : isActive ? (
            <AppLoader size={24} />
          ) : (
            <View style={[styles.stepDot, { backgroundColor: isDark ? colors.textMuted : '#E2E8F0' }]} />
          )}
        </View>
        <Text style={[
            styles.stepLabel, 
            { color: colors.textSecondary },
            isActive && { color: colors.primary, fontWeight: '700' },
            isDone && { color: isDark ? '#10B981' : '#166534', fontWeight: '700' }
        ]}>
            {step.label}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: isDark ? colors.surface : 'white' }]}
        >
          <ArrowLeft01Icon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analyzing Food</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* Image Preview */}
        <Animated.View 
            entering={FadeIn.duration(800)}
            style={[styles.imageContainer, { backgroundColor: isDark ? colors.surface : 'white' }]}
        >
            <Image 
                source={{ uri: imageUri as string }} 
                style={styles.image} 
                resizeMode="cover"
            />
        </Animated.View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <AnalysisStep 
                key={step.id} 
                step={step} 
                index={index} 
                currentStep={currentStep} 
            />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: colors.primary }, !isCompleted && styles.continueButtonDisabled]}
          disabled={!isCompleted}
          onPress={() => {
              if (aiResult) {
                router.push({
                    pathname: "/ai-result",
                    params: { 
                        foodData: JSON.stringify(aiResult),
                        imageUri: imageUri as string
                    }
                });
              }
          }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 32,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 40,
  },
  image: {
    flex: 1,
    borderRadius: 24,
  },
  stepsContainer: {
    width: '100%',
    paddingHorizontal: 10,
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  continueButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
