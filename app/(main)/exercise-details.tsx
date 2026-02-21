import AppLoader from "@/components/ui/AppLoader";
import { db } from '@/config/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';
import { calculateCalories } from '@/utils/calorieCalculation';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import {
    Activity01Icon,
    ArrowLeft01Icon,
    FireIcon,
    Yoga01Icon,
} from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ExerciseDetailsScreen() {
  const params = useLocalSearchParams();
  const { type, description } = params;
  const router = useRouter();
  const { userId } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [duration, setDuration] = useState('30');
  const [selectedChip, setSelectedChip] = useState(30);
  const [loading, setLoading] = useState(false);

  const durationPresets = [15, 30, 60, 90];

  const handleChipPress = (mins: number) => {
    setSelectedChip(mins);
    setDuration(mins.toString());
  };

  const handleManualDurationChange = (text: string) => {
    setDuration(text);
    setSelectedChip(0);
  };

  const handleContinue = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      let userStats = {};
      
      if (userDoc.exists()) {
        userStats = userDoc.data();
      }

      const durationNum = parseInt(duration) || 0;
      const calories = calculateCalories(
        type as string || 'Run',
        intensity,
        durationNum,
        userStats
      );

      router.push({
        pathname: '/workout-summary',
        params: {
          calories,
          duration: durationNum,
          type: type || 'Workout',
          intensity
        }
      });
    } catch (error) {
      console.error('Error calculating calories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: isDark ? colors.surface : 'white' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{type || 'Workout'} Details</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{description || 'Set your intensity and duration.'}</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
          onPress={() => router.push('/log-exercise')}
        >
          <ArrowLeft01Icon size={24} color={colors.textSecondary} />
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intensity Selector */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Workout Intensity</Text>
          <View style={styles.intensityGrid}>
            {[
              { 
                level: 'Low', 
                desc: 'Light effort', 
                sub: 'Easy pace',
                icon: Yoga01Icon,
                color: '#10B981',
                bg: '#ECFDF5'
              },
              { 
                level: 'Medium', 
                desc: 'Steady pace', 
                sub: 'Moderate',
                icon: Activity01Icon,
                color: colors.primary,
                bg: isDark ? 'rgba(16, 185, 129, 0.1)' : '#EAF6ED'
              },
              { 
                level: 'High', 
                desc: 'All-out', 
                sub: 'Vigorous',
                icon: FireIcon,
                color: '#F97316',
                bg: '#FFF7ED'
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = intensity === item.level;
              return (
                <TouchableOpacity
                  key={item.level}
                  onPress={() => setIntensity(item.level as any)}
                  style={[
                    styles.intensityCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderColor: isDark ? colors.border : '#F8FAFC' },
                    isActive && { borderColor: item.color, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white' }
                  ]}
                >
                  <View style={[
                    styles.intensityIconCircle, 
                    { backgroundColor: item.bg },
                    isActive && { backgroundColor: item.color }
                  ]}>
                    <Icon size={20} color={isActive ? 'white' : item.color} variant="stroke" />
                  </View>
                  <Text style={[styles.intensityLevel, { color: colors.textSecondary }, isActive && { color: item.color }]}>{item.level}</Text>
                  <Text style={[styles.intensityDesc, { color: colors.text }]}>{item.desc}</Text>
                  <Text style={[styles.intensitySub, { color: colors.textMuted }]}>{item.sub}</Text>
                  
                  {isActive && (
                    <Animated.View 
                      entering={FadeInDown.springify()} 
                      style={[styles.activeIndicator, { backgroundColor: item.color }]} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration Selector */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Duration (minutes)</Text>
          <View style={styles.chipsContainer}>
            {durationPresets.map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.chip,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: 'transparent' },
                  selectedChip === mins && { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.primary }
                ]}
                onPress={() => handleChipPress(mins)}
              >
                <Text style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  selectedChip === mins && { color: colors.primary }
                ]}>{mins} min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.manualInputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Enter manually</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F8FAFC', borderColor: colors.border, color: colors.text }]}
              keyboardType="numeric"
              value={duration}
              onChangeText={handleManualDurationChange}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: isDark ? colors.surface : 'white', borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: colors.primary }, loading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <AppLoader size={30} />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  intensityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  intensityCard: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  intensityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  intensityLevel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  intensityDesc: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  intensitySub: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  manualInputContainer: {
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
  },
  continueButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  continueButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
});
