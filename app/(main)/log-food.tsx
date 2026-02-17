import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { getFoodDetails } from "@/utils/fatSecretApi";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    Activity01Icon,
    ArrowLeft01Icon,
    CourseIcon,
    Edit01Icon,
    FireIcon,
    MenuRestaurantIcon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function LogFoodScreen() {
  const { foodId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [foodData, setFoodData] = useState<any>(null);
  
  // Base values per serving
  const [baseNutrition, setBaseNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Display values
  const [servingAmount, setServingAmount] = useState("1");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");

  useEffect(() => {
    if (foodId) {
      fetchDetails();
    }
  }, [foodId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getFoodDetails(foodId as string);
      if (data) {
        setFoodData(data);
        // Basic parsing of the first serving
        const serving = data.servings?.serving[0] || data.servings?.serving;
        if (serving) {
            const base = {
                calories: parseFloat(serving.calories || "0"),
                protein: parseFloat(serving.protein || "0"),
                carbs: parseFloat(serving.carbohydrate || "0"),
                fat: parseFloat(serving.fat || "0")
            };
            setBaseNutrition(base);
            // Initial set
            setCalories(base.calories.toString());
            setProtein(base.protein.toString());
            setCarbs(base.carbs.toString());
            setFat(base.fat.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching food details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate whenever servingAmount or baseNutrition changes
  useEffect(() => {
    const multiplier = parseFloat(servingAmount);
    if (isNaN(multiplier)) return;

    setCalories(Math.round(baseNutrition.calories * multiplier).toString());
    setProtein((baseNutrition.protein * multiplier).toFixed(1));
    setCarbs((baseNutrition.carbs * multiplier).toFixed(1));
    setFat((baseNutrition.fat * multiplier).toFixed(1));
  }, [servingAmount, baseNutrition]);

  const handleLogFood = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const today = new Date().toLocaleDateString('en-CA');
      
      await addDoc(collection(db, "dailyLogs"), {
        userId: user.id,
        type: 'meal',
        title: foodData.food_name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        serving_amount: servingAmount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: serverTimestamp(),
        date: today
      });

      router.replace("/");
    } catch (error) {
      console.error("Error logging food:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft01Icon size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <View style={styles.foodHeader}>
            <TextInput 
              style={styles.foodName}
              value={foodData?.food_name}
              onChangeText={(text) => setFoodData({...foodData, food_name: text})}
              multiline
            />
            <Edit01Icon size={24} color={Colors.light.primary} />
          </View>
          <Text style={styles.brandName}>{foodData?.brand_name || 'Generic Food'}</Text>
        </Animated.View>

        {/* Serving Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.sectionCard}>
          <View className="flex-row justify-between items-center mb-4">
            <Text style={styles.sectionTitle}>Serving Amount</Text>
            <View style={styles.servingInputContainer}>
                <TextInput 
                    style={styles.servingInput}
                    value={servingAmount}
                    onChangeText={setServingAmount}
                    keyboardType="decimal-pad"
                />
                <Text style={styles.servingUnit}>servings</Text>
            </View>
          </View>
          <Text style={styles.helperText}>Adjust the amount to recalculate nutrition automatically.</Text>
        </Animated.View>

        {/* Calories Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.caloriesCard}>
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View style={styles.fireIconCircle}>
                        <FireIcon size={24} color="white" variant="stroke" />
                    </View>
                    <Text style={styles.caloriesLabel}>Total Calories</Text>
                </View>
                <TouchableOpacity style={styles.editIcon}>
                    <Edit01Icon size={18} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            <View className="flex-row items-baseline">
                <TextInput 
                    style={styles.caloriesValue}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                />
                <Text style={styles.kcalUnit}>kcal</Text>
            </View>
        </Animated.View>

        {/* Macros Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="flex-row justify-between mb-8">
            {/* Protein */}
            <View style={styles.macroCard}>
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mb-2">
                    <Activity01Icon size={16} color="#3B82F6" />
                </View>
                <Text style={styles.macroLabel}>Protein</Text>
                <View className="flex-row items-center">
                    <TextInput 
                        style={styles.macroValue}
                        value={protein}
                        onChangeText={setProtein}
                        keyboardType="decimal-pad"
                    />
                    <Text style={styles.macroUnit}>g</Text>
                </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroCard}>
                <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mb-2">
                    <MenuRestaurantIcon size={16} color="#F97316" />
                </View>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View className="flex-row items-center">
                    <TextInput 
                        style={styles.macroValue}
                        value={carbs}
                        onChangeText={setCarbs}
                        keyboardType="decimal-pad"
                    />
                    <Text style={styles.macroUnit}>g</Text>
                </View>
            </View>

            {/* Fats */}
            <View style={styles.macroCard}>
                <View className="w-8 h-8 rounded-full bg-yellow-50 items-center justify-center mb-2">
                    <CourseIcon size={16} color="#EAB308" />
                </View>
                <Text style={styles.macroLabel}>Fats</Text>
                <View className="flex-row items-center">
                    <TextInput 
                        style={styles.macroValue}
                        value={fat}
                        onChangeText={setFat}
                        keyboardType="decimal-pad"
                    />
                    <Text style={styles.macroUnit}>g</Text>
                </View>
            </View>
        </Animated.View>

      </ScrollView>

      {/* Fixed Log Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logButton}
          onPress={handleLogFood}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Tick02Icon size={24} color="white" variant="stroke" />
              <Text style={styles.logButtonText}>Log Food</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased to 60 for safe area
    paddingBottom: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 32, // Adjusted size to fit better and be editable
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1,
    lineHeight: 38,
    flex: 1,
    marginRight: 10,
  },
  brandName: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  servingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  servingInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    width: 40,
    textAlign: 'center',
  },
  servingUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: '500',
  },
  caloriesCard: {
    backgroundColor: "#0F172A",
    borderRadius: 32,
    padding: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  fireIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EA580C",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  caloriesValue: {
    color: "white",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    minWidth: 120,
  },
  kcalUnit: {
    color: "#94A3B8",
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 8,
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  macroCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    minWidth: 40,
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  logButton: {
    backgroundColor: Colors.light.primary,
    height: 64,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 10,
  },
});
