import BentoGrid from "@/components/analytics/BentoGrid";
import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays
} from "date-fns";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import {
  CalculateIcon,
  CheckmarkCircle01Icon,
  DropletIcon,
  FireIcon,
  MenuRestaurantIcon,
  WechatIcon
} from "hugeicons-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function Analytics() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("--");
  const [streakDays, setStreakDays] = useState<{ day: string; date: Date; checked: boolean }[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);
  const [weeklyCalories, setWeeklyCalories] = useState<number[]>(new Array(7).fill(0));
  const [weeklyConsumed, setWeeklyConsumed] = useState<number[]>(new Array(7).fill(0));
  const [weeklyWater, setWeeklyWater] = useState<number[]>(new Array(7).fill(0));
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1. Fetch User Weight
      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setWeight(userData.weight || "--");
      }

      // 2. Fetch Weekly Logs for Streak & Energy
      const start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
      const end = endOfWeek(new Date(), { weekStartsOn: 0 }); // Saturday
      const days = eachDayOfInterval({ start, end });

      const logsRef = collection(db, "dailyLogs");
      const weekLogsQuery = query(
        logsRef,
        where("userId", "==", user.id),
        where("date", ">=", format(start, "yyyy-MM-dd")),
        where("date", "<=", format(end, "yyyy-MM-dd"))
      );

      const querySnapshot = await getDocs(weekLogsQuery);
      const activeDates = new Set<string>();
      querySnapshot.forEach((doc) => {
        if (doc.data().type !== 'water') { // Only count non-water logs for streak if that's the logic, or all logs? 
          // Usually streak implies activity or logging food. Let's keep it inclusive or check requirements.
          // For now, assuming any log counts towards streak.
          activeDates.add(doc.data().date);
        }
      });

      const formattedDays = days.map((date) => ({
        day: format(date, "EEEEE"), // Single letter day
        modalDay: format(date, "EEE"), // DDD format (Sun, Mon, etc.)
        date: date,
        checked: activeDates.has(format(date, "yyyy-MM-dd"))
      }));

      setStreakDays(formattedDays);

      // 3. Process Weekly Data (Burned vs Consumed vs Water)
      const burnedPerDay = new Array(7).fill(0);
      const consumedPerDay = new Array(7).fill(0);
      const waterPerDay = new Array(7).fill(0);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const logDate = new Date(data.date);
        const dayIndex = logDate.getDay(); // 0 for Sunday
        
        if (data.type === 'exercise' || data.type === 'workout') {
           burnedPerDay[dayIndex] += (Number(data.calories) || 0);
        } else if (data.type === 'meal') {
           consumedPerDay[dayIndex] += (Number(data.calories) || 0);
        } else if (data.type === 'water') {
           waterPerDay[dayIndex] += (Number(data.amount) || 0);
        }
      });
      setWeeklyCalories(burnedPerDay);
      setWeeklyConsumed(consumedPerDay);
      setWeeklyWater(waterPerDay);

      // 4. Calculate Actual Consecutive Streak
      let streak = 0;
      let checkDate = new Date();
      
      // Check today first, then go backwards
      while (true) {
        const dateStr = format(checkDate, "yyyy-MM-dd");
        const streakQuery = query(
          logsRef,
          where("userId", "==", user.id),
          where("date", "==", dateStr)
        );
        const streakSnap = await getDocs(streakQuery);
        
        if (!streakSnap.empty) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

      // 5. Generate or Load AI Insights
      if (querySnapshot.size > 0) {
        const weekStartStr = format(start, "yyyy-MM-dd");
        const insightRef = doc(db, "users", user.id, "weeklyAIInsights", weekStartStr);
        const insightSnap = await getDoc(insightRef);
        
        let shouldGenerate = true;
        
        if (insightSnap.exists()) {
          const cachedData = insightSnap.data();
          const lastGenerated = cachedData.lastGeneratedAt?.toDate();
          const now = new Date();
          
          // If generated in last 24 hours, use cache
          if (lastGenerated && (now.getTime() - lastGenerated.getTime()) < 24 * 60 * 60 * 1000) {
            setAiInsights(cachedData.data);
            shouldGenerate = false;
          }
        }

        if (shouldGenerate) {
          const logsData = querySnapshot.docs.map(doc => doc.data());
          // Don't await, let it generate in background while showing old data if any
          generateAIInsights(logsData, burnedPerDay, consumedPerDay, waterPerDay, weekStartStr);
        }
      }

    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateAIInsights = async (logs: any[], burned: number[], consumed: number[], water: number[], weekStartStr: string) => {
    if (isGeneratingAI) return;
    
    setIsGeneratingAI(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      
      const summaryData = {
        totalBurned: burned.reduce((a, b) => a + b, 0),
        totalConsumed: consumed.reduce((a, b) => a + b, 0),
        avgWater: water.reduce((a, b) => a + b, 0) / 7,
        mealCount: logs.filter(l => l.type === 'meal').length,
        exerciseCount: logs.filter(l => l.type === 'exercise' || l.type === 'workout').length,
        recentMeals: logs.filter(l => l.type === 'meal').slice(-5).map(l => l.title)
      };

      const prompt = `Based on the following weekly health data summary, generate personalized insights for a fitness app.
      Data Summary: ${JSON.stringify(summaryData)}
      
      Return a JSON object with this EXACT structure:
      {
        "healthScore": number (0-100),
        "topMacro": { "name": "string", "icon": "emoji", "value": "string" },
        "consistencyInsight": "string (short, max 60 chars)",
        "recommendation": "string (actionable tip, max 100 chars)"
      }
      Only return the JSON object, no other text. Handle errors gracefully by returning a valid JSON with placeholder info if needed.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedInsights = JSON.parse(cleanedText);
      
      // Save to Firestore
      const insightRef = doc(db, "users", user!.id, "weeklyAIInsights", weekStartStr);
      await setDoc(insightRef, {
        data: parsedInsights,
        lastGeneratedAt: new Date(),
        summaryData: summaryData // Helpful for debugging
      });

      setAiInsights(parsedInsights);
    } catch (error) {
      console.error("Gemini AI Error:", error);
      // Optional: Set some default/error insights so UI doesn't look empty
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading && streakDays.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.heading}>Progress</Text>
        </Animated.View>

        <View style={styles.cardsRow}>
          {/* Daily Streak Card */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setIsStreakModalVisible(true)}
            style={{ flex: 1.5 }}
          >
            <Animated.View 
                entering={FadeInUp.delay(200).duration(600)}
                style={styles.streakCard}
            >
                <View style={styles.streakHeader}>
                <View style={styles.fireIconBg}>
                    <Image 
                    source={require('@/assets/images/fire.png')} 
                    style={styles.fireIcon}
                    resizeMode="contain"
                    />
                </View>
                <Text style={styles.streakTitle}>Day Streak</Text>
                </View>

                <View style={styles.streakGrid}>
                {streakDays.map((item, index) => (
                    <View key={index} style={styles.streakDayItem}>
                    <View style={[
                        styles.checkCircle,
                        item.checked && styles.checkCircleActive,
                        isSameDay(item.date, new Date()) && styles.todayCircle
                    ]}>
                        {item.checked && (
                        <CheckmarkCircle01Icon size={14} color="white" variant="stroke" />
                        )}
                    </View>
                    <Text style={[
                        styles.dayText,
                        isSameDay(item.date, new Date()) && styles.todayText
                    ]}>
                        {item.day}
                    </Text>
                    </View>
                ))}
                </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Weight Card */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push("/update-weight")}
            style={{ flex: 1 }}
          >
            <Animated.View 
              entering={FadeInUp.delay(400).duration(600)}
              style={styles.weightCard}
            >
              <View style={styles.weightHeader}>
                <View style={styles.weightIconBg}>
                  <WechatIcon size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.weightTitle}>My Weight</Text>
              </View>
              <View style={styles.weightValueContainer}>
                <Text style={styles.weightValue}>{weight}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Calories Burned Chart */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.chartSection}
        >
          <Text style={styles.sectionHeading}>Calories Burned</Text>
           <View style={styles.chartHeader}>
             <View>
               <Text style={styles.chartTitle}>Top Performance</Text>
               <Text style={styles.chartSubtitle}>Weekly Calories</Text>
             </View>
             <View style={styles.chartBadge}>
                <FireIcon size={14} color="#F97316" variant="stroke" />
                <Text style={styles.chartBadgeText}>
                  {weeklyCalories.reduce((a, b) => a + b, 0).toLocaleString()} kcal
                </Text>
             </View>
           </View>

           <View style={styles.chartContainer}>
             <BarChart
                data={{
                  labels: streakDays.map(d => d.day), // Mon, Tue, Wed...
                  datasets: [
                    {
                      data: weeklyCalories
                    }
                  ]
                }}
                width={width - 48 - 32} // Adjusted width
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(41, 143, 80, ${opacity})`, 
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  barPercentage: 0.6,
                  fillShadowGradientFrom: "#298f50",
                  fillShadowGradientTo: "#22c55e",
                  fillShadowGradientOpacity: 1,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 0,
                }}
                showValuesOnTopOfBars={true}
                fromZero
                withInnerLines={false}
                withHorizontalLabels={false} // Clean look
                flatColor={true} 
              />
           </View>
        </Animated.View>

        {/* Weekly Energy Card */}
        <Animated.View 
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.energyCard}
        >
          <Text style={styles.sectionHeading}>Weekly Energy</Text>
          
          {/* Summary Row */}
          <View style={styles.energySummaryRow}>
            {/* Burned */}
            <View style={styles.energySummaryItem}>
              <View style={[styles.energyIconBg, { backgroundColor: '#FFF7ED' }]}>
                 <FireIcon size={20} color="#F97316" variant="stroke" />
              </View>
              <View>
                <Text style={styles.energyValue}>
                  {weeklyCalories.reduce((a, b) => a + b, 0).toLocaleString()}
                </Text>
                <Text style={styles.energyLabel}>Burned</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.energyDivider} />

            {/* Consumed */}
            <View style={styles.energySummaryItem}>
              <View style={[styles.energyIconBg, { backgroundColor: '#EFF6FF' }]}>
                 <MenuRestaurantIcon size={20} color="#3B82F6" variant="stroke" />
              </View>
              <View>
                <Text style={styles.energyValue}>
                  {weeklyConsumed.reduce((a, b) => a + b, 0).toLocaleString()}
                </Text>
                <Text style={styles.energyLabel}>Consumed</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.energyDivider} />

            {/* Net */}
            <View style={styles.energySummaryItem}>
              <View style={[styles.energyIconBg, { backgroundColor: '#F0FDF4' }]}>
                 <CalculateIcon size={20} color="#16A34A" variant="stroke" />
              </View>
              <View>
                <Text style={[styles.energyValue, { color: '#16A34A' }]}>
                  {(weeklyConsumed.reduce((a, b) => a + b, 0) - weeklyCalories.reduce((a, b) => a + b, 0)).toLocaleString()}
                </Text>
                <Text style={styles.energyLabel}>Net Energy</Text>
              </View>
            </View>
          </View>

          {/* Custom Bar Chart */}
          <View style={styles.customChartContainer}>
            <View style={styles.chartBarsContainer}>
              {streakDays.map((day, index) => {
                const consumed = weeklyConsumed[index] || 0;
                const burned = weeklyCalories[index] || 0;
                
                // Calculate max value for scaling, ensuring a minimum baseline to avoid division by zero
                const allValues = [...weeklyConsumed, ...weeklyCalories];
                const maxVal = Math.max(...allValues, 100); 
                
                const barHeight = 120; // Maximum height of a bar
                const consumedHeight = (consumed / maxVal) * barHeight;
                const burnedHeight = (burned / maxVal) * barHeight;

                return (
                  <View key={index} style={styles.chartBarGroup}>
                    <View style={styles.barsWrapper}>
                      {/* Consumed Bar (Blue) */}
                      <View style={[
                        styles.bar, 
                        { 
                          height: Math.max(consumedHeight, 4), // Min height for visibility
                          backgroundColor: '#3B82F6' 
                        } 
                      ]} />
                      
                      {/* Burned Bar (Orange) */}
                      <View style={[
                        styles.bar, 
                        { 
                          height: Math.max(burnedHeight, 4), 
                          backgroundColor: '#F97316' 
                        } 
                      ]} />
                    </View>
                    <Text style={[
                      styles.chartDayText,
                      isSameDay(day.date, new Date()) && styles.chartTodayText
                    ]}>{day.day}</Text>
                  </View>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                <Text style={styles.legendText}>Burned</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Consumed</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Water Consumption Card */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.waterCard}
        >
          <Text style={styles.sectionHeading}>Water Intake</Text>

          <View style={styles.waterSummary}>
            <View style={styles.waterIconBg}>
              <DropletIcon size={24} color="#0EA5E9" variant="stroke" />
            </View>
            <View>
              <Text style={styles.waterValue}>
                {weeklyWater.reduce((a, b) => a + b, 0).toLocaleString()} ml
              </Text>
              <Text style={styles.waterLabel}>Total this week</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <LineChart
              data={{
                  labels: streakDays.map(d => d.day),
                  datasets: [
                    {
                      data: weeklyWater.length > 0 ? weeklyWater : [0],
                      color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, // Blue
                      strokeWidth: 3
                    }
                  ]
              }}
              width={width - 48 - 32} // Adjusted width
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#0EA5E9"
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "", // Solid lines
                    stroke: "#F1F5F9",
                    strokeWidth: 1
                  }
              }}
              bezier
              style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingRight: 16, // Add padding for last label
              }}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          </View>
        </Animated.View>

        {/* Weekly Insights (Bento Grid) */}
        <Animated.View 
          entering={FadeInUp.delay(900).duration(600)}
          style={styles.bentoSection}
        >
          <Text style={styles.sectionHeading}>Weekly Insights</Text>
          <BentoGrid insights={aiInsights} isLoading={isGeneratingAI} />
        </Animated.View>
      </ScrollView>

      {/* Streak Details Modal */}
      <Modal
        visible={isStreakModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsStreakModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsStreakModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                entering={FadeInUp.springify()}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalFireIconBg}>
                      <Image 
                        source={require('@/assets/images/fire.png')} 
                        style={styles.modalFireIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={styles.modalStreakCount}>{currentStreak}</Text>
                      <Text style={styles.modalStreakSub}>Daily Streak</Text>
                    </View>
                  </View>
                  <Text style={styles.modalKeepItUp}>Keep it up🔥</Text>
                </View>

                <View style={styles.modalGrid}>
                  {streakDays.map((item: any, index) => (
                    <View key={index} style={styles.modalDayItem}>
                      <View style={[
                        styles.modalCheckCircle,
                        item.checked && styles.modalCheckCircleActive,
                        isSameDay(item.date, new Date()) && styles.modalTodayCircle
                      ]}>
                        {item.checked && (
                          <CheckmarkCircle01Icon size={18} color="white" variant="stroke" />
                        )}
                      </View>
                      <Text style={[
                        styles.modalDayText,
                        isSameDay(item.date, new Date()) && styles.modalTodayText
                      ]}>
                        {item.modalDay}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setIsStreakModalVisible(false)}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 32,
    letterSpacing: -1,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  streakCard: {
    flex: 1.5,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  weightCard: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Subtle purple
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    justifyContent: 'space-between',
  },
  streakHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fireIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  fireIcon: {
    width: 28,
    height: 28,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  streakDayItem: {
    alignItems: 'center',
    gap: 6,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#F97316', // Orange for streak
    borderColor: '#F97316',
  },
  todayCircle: {
    borderColor: Colors.light.primary,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  todayText: {
    color: Colors.light.primary,
  },
  weightHeader: {
    marginBottom: 12,
  },
  weightIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  weightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C3AED',
  },
  weightValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 32,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  chartBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  chartContainer: {
    alignItems: 'center',
  },
  placeholderSection: {
    marginTop: 8,
  },
  placeholderCard: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalFireIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFireIcon: {
    width: 36,
    height: 36,
  },
  modalStreakCount: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 48,
  },
  modalStreakSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalKeepItUp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
    marginTop: 8,
  },
  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
  },
  modalDayItem: {
    alignItems: 'center',
    gap: 10,
  },
  modalCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckCircleActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  modalTodayCircle: {
    borderColor: Colors.light.primary,
  },
  modalDayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  modalTodayText: {
    color: Colors.light.primary,
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  energyCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 32,
  },
  energySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
  },
  energySummaryItem: {
    flex: 1,
    gap: 8,
    alignItems: 'center', // Centered for cleaner look
  },
  energyIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  energyLabel: {
    fontSize: 11, // Slightly smaller
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  energyDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  customChartContainer: {
    alignItems: 'center',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  chartBarGroup: {
    alignItems: 'center',
    gap: 8,
    width: 24, // Fixed width for alignment
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 120, // Match max height in calculation
  },
  bar: {
    width: 6,
    borderRadius: 4,
  },
  chartDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chartTodayText: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  waterCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 32,
  },
  waterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  waterIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  waterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  bentoSection: {
    marginBottom: 40,
  },
});
