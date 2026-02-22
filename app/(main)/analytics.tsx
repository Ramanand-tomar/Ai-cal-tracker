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
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
const { width } = Dimensions.get("window");

export default function Analytics() {
  const router = useRouter();
  const { user } = useUser();
  const { colors, isDark } = useTheme();
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

      // 4. Calculate Actual Consecutive Streak (Optimized: single query for last 30 days)
      const streakLimitDate = subDays(new Date(), 30);
      const streakQuery = query(
        logsRef,
        where("userId", "==", user.id),
        where("date", ">=", format(streakLimitDate, "yyyy-MM-dd"))
      );
      const streakSnap = await getDocs(streakQuery);
      const activityDates = new Set(streakSnap.docs.map(doc => doc.data().date));
      
      let streak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dateStr = format(checkDate, "yyyy-MM-dd");
        if (activityDates.has(dateStr)) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          // If no log today, it might still be part of a streak if they haven't finished the day?
          // But standard streak logic usually requires at least one log per day.
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={[styles.heading, { color: colors.text }]}>Progress</Text>
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
                style={[styles.streakCard, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}
            >
                <View style={styles.streakHeader}>
                <View style={[styles.fireIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white' }]}>
                    <Image 
                    source={require('@/assets/images/fire.png')} 
                    style={styles.fireIcon}
                    resizeMode="contain"
                    />
                </View>
                <Text style={[styles.streakTitle, { color: colors.textSecondary }]}>Day Streak</Text>
                </View>

                <View style={styles.streakGrid}>
                {streakDays.map((item, index) => (
                    <View key={index} style={styles.streakDayItem}>
                    <View style={[
                        styles.checkCircle,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                        item.checked && styles.checkCircleActive,
                        isSameDay(item.date, new Date()) && { borderColor: colors.primary }
                    ]}>
                        {item.checked && (
                        <CheckmarkCircle01Icon size={14} color="white" variant="stroke" />
                        )}
                    </View>
                    <Text style={[
                        styles.dayText,
                        { color: isSameDay(item.date, new Date()) ? colors.primary : colors.textMuted }
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
              style={[
                  styles.weightCard, 
                  { 
                      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF', 
                      borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE' 
                  }
              ]}
            >
              <View style={styles.weightHeader}>
                <View style={[styles.weightIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
                  <WechatIcon size={24} color="#8B5CF6" />
                </View>
                <Text style={[styles.weightTitle, { color: isDark ? colors.textSecondary : '#4F46E5' }]}>My Weight</Text>
              </View>
              <View style={styles.weightValueContainer}>
                <Text style={[styles.weightValue, { color: colors.text }]}>{weight}</Text>
                <Text style={[styles.weightUnit, { color: colors.textMuted }]}>kg</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Calories Burned Chart */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.chartSection}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Calories Burned</Text>
           <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             <View style={styles.chartHeader}>
               <View>
                 <Text style={[styles.chartTitle, { color: colors.text }]}>Top Performance</Text>
                 <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Weekly Calories</Text>
               </View>
               <View style={[styles.chartBadge, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED' }]}>
                  <FireIcon size={14} color="#F97316" variant="stroke" />
                  <Text style={styles.chartBadgeText}>
                    {weeklyCalories.reduce((a, b) => a + b, 0).toLocaleString()} kcal
                  </Text>
               </View>
             </View>

             <View style={styles.chartContainer}>
               <BarChart
                  data={{
                    labels: streakDays.map(d => d.day),
                    datasets: [{ data: weeklyCalories }]
                  }}
                  width={width - 48 - 32}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => isDark ? colors.primary : colors.primary, 
                    labelColor: (opacity = 1) => colors.textMuted,
                    style: { borderRadius: 16 },
                    barPercentage: 0.6,
                    fillShadowGradientFrom: colors.primary,
                    fillShadowGradientTo: colors.primary,
                    fillShadowGradientOpacity: 1,
                  }}
                  style={{ marginVertical: 8, borderRadius: 16, paddingRight: 0 }}
                  showValuesOnTopOfBars={true}
                  fromZero
                  withInnerLines={false}
                  withHorizontalLabels={false}
                  flatColor={true} 
                />
             </View>
           </View>
        </Animated.View>

        {/* Weekly Energy Card */}
        <Animated.View 
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.energySection}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Weekly Energy</Text>
          
          <View style={[styles.energyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Summary Row */}
            <View style={[styles.energySummaryRow, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                {/* Burned */}
                <View style={styles.energySummaryItem}>
                <View style={[styles.energyIconBg, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED' }]}>
                    <FireIcon size={20} color="#F97316" variant="stroke" />
                </View>
                <View>
                    <Text style={[styles.energyValue, { color: colors.text }]}>
                    {weeklyCalories.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Text>
                    <Text style={styles.energyLabel}>Burned</Text>
                </View>
                </View>

                {/* Divider */}
                <View style={[styles.energyDivider, { backgroundColor: colors.border }]} />

                {/* Consumed */}
                <View style={styles.energySummaryItem}>
                <View style={[styles.energyIconBg, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                    <MenuRestaurantIcon size={20} color="#3B82F6" variant="stroke" />
                </View>
                <View>
                    <Text style={[styles.energyValue, { color: colors.text }]}>
                    {weeklyConsumed.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Text>
                    <Text style={styles.energyLabel}>Consumed</Text>
                </View>
                </View>

                {/* Divider */}
                <View style={[styles.energyDivider, { backgroundColor: colors.border }]} />

                {/* Net */}
                <View style={styles.energySummaryItem}>
                <View style={[styles.energyIconBg, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4' }]}>
                    <CalculateIcon size={20} color="#16A34A" variant="stroke" />
                </View>
                <View>
                    <Text style={[styles.energyValue, { color: '#16A34A' }]}>
                    {(weeklyConsumed.reduce((a, b) => a + b, 0) - weeklyCalories.reduce((a, b) => a + b, 0)).toLocaleString()}
                    </Text>
                    <Text style={styles.energyLabel}>Net</Text>
                </View>
                </View>
            </View>

            {/* Custom Bar Chart */}
            <View style={styles.customChartContainer}>
                <View style={styles.chartBarsContainer}>
                {streakDays.map((day, index) => {
                    const consumed = weeklyConsumed[index] || 0;
                    const burned = weeklyCalories[index] || 0;
                    
                    const allValues = [...weeklyConsumed, ...weeklyCalories];
                    const maxVal = Math.max(...allValues, 100); 
                    
                    const barHeight = 120;
                    const consumedHeight = (consumed / maxVal) * barHeight;
                    const burnedHeight = (burned / maxVal) * barHeight;

                    return (
                    <View key={index} style={styles.chartBarGroup}>
                        <View style={styles.barsWrapper}>
                        {/* Consumed Bar (Blue) */}
                        <View style={[
                            styles.bar, 
                            { 
                            height: Math.max(consumedHeight, 4),
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
                        isSameDay(day.date, new Date()) && { color: colors.primary, fontWeight: '800' }
                        ]}>{day.day}</Text>
                    </View>
                    );
                })}
                </View>

                {/* Legend */}
                <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Burned</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Consumed</Text>
                </View>
                </View>
            </View>
          </View>
        </Animated.View>

        {/* Water Consumption Card */}
        <Animated.View 
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.waterSection}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Water Intake</Text>

          <View style={[styles.waterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.waterSummary}>
                <View style={[styles.waterIconBg, { backgroundColor: isDark ? 'rgba(14, 165, 233, 0.1)' : '#E0F2FE' }]}>
                <DropletIcon size={24} color="#0EA5E9" variant="stroke" />
                </View>
                <View>
                <Text style={[styles.waterValue, { color: colors.text }]}>
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
                        color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                        strokeWidth: 3
                        }
                    ]
                }}
                width={width - 48 - 32}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                    labelColor: (opacity = 1) => colors.textMuted,
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#0EA5E9" },
                    propsForBackgroundLines: { strokeDasharray: "", stroke: isDark ? 'rgba(255,255,255,0.05)' : "#F1F5F9", strokeWidth: 1 }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16, paddingRight: 16 }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                />
            </View>
          </View>
        </Animated.View>

        {/* Weekly Insights (Bento Grid) */}
        <Animated.View 
          entering={FadeInUp.delay(900).duration(600)}
          style={styles.bentoSection}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Weekly Insights</Text>
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
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <TouchableWithoutFeedback>
              <Animated.View 
                entering={FadeInUp.springify()}
                style={[styles.modalContent, { backgroundColor: colors.background }]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={[styles.modalFireIconBg, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED' }]}>
                      <Image 
                        source={require('@/assets/images/fire.png')} 
                        style={styles.modalFireIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text style={[styles.modalStreakCount, { color: colors.text }]}>{currentStreak}</Text>
                      <Text style={[styles.modalStreakSub, { color: colors.textSecondary }]}>Daily Streak</Text>
                    </View>
                  </View>
                  <Text style={[styles.modalKeepItUp, { color: colors.primary }]}>Keep it up🔥</Text>
                </View>

                <View style={[styles.modalGrid, { backgroundColor: isDark ? colors.surface : '#F8FAFC' }]}>
                  {streakDays.map((item: any, index) => (
                    <View key={index} style={styles.modalDayItem}>
                      <View style={[
                        styles.modalCheckCircle,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                        item.checked && styles.modalCheckCircleActive,
                        isSameDay(item.date, new Date()) && { borderColor: colors.primary }
                      ]}>
                        {item.checked && (
                          <CheckmarkCircle01Icon size={18} color="white" variant="stroke" />
                        )}
                      </View>
                      <Text style={[
                        styles.modalDayText,
                        isSameDay(item.date, new Date()) && { color: colors.primary }
                      ]}>
                        {item.modalDay}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.modalCloseBtn, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]}
                  onPress={() => setIsStreakModalVisible(false)}
                >
                  <Text style={[styles.modalCloseBtnText, { color: colors.textSecondary }]}>Close</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 34,
    fontWeight: '900',
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
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
  },
  weightCard: {
    flex: 1,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#F97316', // Orange for streak
    borderColor: '#F97316',
  },
  todayCircle: {
    borderColor: Colors.light.primary, // This will be overridden by theme.primary
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
  },
  todayText: {
    color: Colors.light.primary, // This will be overridden by theme.primary
  },
  weightHeader: {
    marginBottom: 12,
  },
  weightIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  weightTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  weightValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 32,
  },
  chartCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
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
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
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
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
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
    lineHeight: 48,
  },
  modalStreakSub: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalKeepItUp: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
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
    textTransform: 'uppercase',
  },
  modalTodayText: {
    color: Colors.light.primary,
  },
  modalCloseBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  energySection: {
    marginBottom: 32,
  },
  energyCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  energySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
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
  },
  waterSection: {
    marginBottom: 32,
  },
  waterCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  waterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  bentoSection: {
    marginBottom: 40,
  },
});
