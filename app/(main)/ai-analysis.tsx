import Colors from "@/constants/Colors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { File } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft01Icon, CheckmarkCircle01Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.8;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

export default function AIAnalysisScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
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
      
      const file = new File(imageUri as string);
      const base64Image = await file.base64();

      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      
      const prompt = `Analyze this food image. Provide a JSON response with the following structure:
      {
        "food_name": "Dish Name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "confidence_score": number (0-1)
      }
      Only return the JSON object, no other text.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ]);

      // Step 2: Extracting Data
      setCurrentStep(1);
      
      const response = await result.response;
      const text = response.text();
      
      // Clean up JSON response if it has backticks
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanedText);
      
      setAiResult(parsedResult);
      
      // Artificial delay for smooth UX transition
      setTimeout(() => {
          setCurrentStep(2);
      }, 1000);

      // Step 3: Complete
      setTimeout(() => {
          setCurrentStep(3);
          setIsCompleted(true);
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
        style={[styles.stepItem, isDone && styles.stepItemDone]}
      >
        <View style={styles.stepIconContainer}>
          {isDone ? (
            <CheckmarkCircle01Icon size={24} color={Colors.light.primary} variant="stroke" />
          ) : isActive ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <View style={styles.stepDot} />
          )}
        </View>
        <Text style={[
            styles.stepLabel, 
            isActive && styles.stepLabelActive,
            isDone && styles.stepLabelDone
        ]}>
            {step.label}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft01Icon size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyzing Food</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* Image Preview */}
        <Animated.View 
            entering={FadeIn.duration(800)}
            style={styles.imageContainer}
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
          style={[styles.continueButton, !isCompleted && styles.continueButtonDisabled]}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60, // Increased to 60 for safe area
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
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
    color: '#0F172A',
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
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
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  stepLabelActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  stepLabelDone: {
    color: '#166534',
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
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
