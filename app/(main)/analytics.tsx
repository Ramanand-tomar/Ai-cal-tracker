import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays
} from "date-fns";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { CheckmarkCircle01Icon, WechatIcon } from "hugeicons-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function Analytics() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("--");
  const [streakDays, setStreakDays] = useState<{ day: string; date: Date; checked: boolean }[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isStreakModalVisible, setIsStreakModalVisible] = useState(false);

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

      // 2. Fetch Weekly Logs for Streak
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
        activeDates.add(doc.data().date);
      });

      const formattedDays = days.map((date) => ({
        day: format(date, "EEEEE"), // Single letter day
        modalDay: format(date, "EEE"), // DDD format (Sun, Mon, etc.)
        date: date,
        checked: activeDates.has(format(date, "yyyy-MM-dd"))
      }));

      setStreakDays(formattedDays);

      // 3. Calculate Actual Consecutive Streak
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
          // If not today, check if yesterday had a log (to allow today's log to be missing yet)
          // But usually streak means consecutive including today or ending yesterday
          break;
        }
      }
      setCurrentStreak(streak);

    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

        {/* Placeholder for more analytics to satisfy premium feel */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.placeholderSection}
        >
          <Text style={styles.sectionHeading}>Weekly Insights</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Detailed activity charts coming soon...</Text>
          </View>
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
});
