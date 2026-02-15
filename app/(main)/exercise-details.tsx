import { db } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { calculateCalories } from '@/utils/calorieCalculation';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft01Icon,
} from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ExerciseDetailsScreen() {
  const params = useLocalSearchParams();
  const { type, description } = params;
  const router = useRouter();
  const { userId } = useAuth();
  
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium'); // 0: Low, 1: Medium, 2: High
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
    setSelectedChip(0); // Deselect chips if manual input is used
  };

  const handleContinue = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // 1. Fetch user weight
      const userDoc = await getDoc(doc(db, 'users', userId));
      let userStats = {};
      
      if (userDoc.exists()) {
        userStats = userDoc.data();
      }

      // 2. Calculate Calories
      const durationNum = parseInt(duration) || 0;
      const calories = calculateCalories(
        type as string || 'Run',
        intensity,
        durationNum,
        userStats
      );

      // 3. Navigate to Summary
      router.push({
        pathname: '/(main)/workout-summary',
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

  const intensityMap = { 'Low': 0, 'Medium': 1, 'High': 2 };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{type || 'Workout'} Details</Text>
        <Text style={styles.headerSubtitle}>{description || 'Set your intensity and duration.'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(main)/log-exercise')}
        >
          <ArrowLeft01Icon size={24} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intensity Selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Intensity</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderFill, 
                  { width: `${(intensityMap[intensity] / 2) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.sliderPoints}>
              {['Low', 'Medium', 'High'].map((level, index) => (
                <TouchableOpacity
                  key={level}
                  style={styles.sliderPointWrapper}
                  onPress={() => setIntensity(level as 'Low' | 'Medium' | 'High')}
                >
                  <View 
                    style={[
                      styles.sliderThumb,
                      intensity === level && styles.sliderThumbActive
                    ]} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, intensity === 'Low' && styles.activeLabel]}>Low</Text>
              <Text style={[styles.sliderLabel, intensity === 'Medium' && styles.activeLabel]}>Medium</Text>
              <Text style={[styles.sliderLabel, intensity === 'High' && styles.activeLabel]}>High</Text>
            </View>
          </View>
        </View>

        {/* Duration Selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Duration (minutes)</Text>
          <View style={styles.chipsContainer}>
            {durationPresets.map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.chip,
                  selectedChip === mins && styles.chipActive
                ]}
                onPress={() => handleChipPress(mins)}
              >
                <Text style={[
                  styles.chipText,
                  selectedChip === mins && styles.chipTextActive
                ]}>{mins} min</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.manualInputContainer}>
            <Text style={styles.inputLabel}>Enter manually</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={duration}
              onChangeText={handleManualDurationChange}
              placeholder="0"
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: 'white',
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
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  sliderContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderPoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -15, // Offset to center thumb on track
  },
  sliderPointWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  sliderThumbActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeLabel: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: 'white',
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.light.primary,
  },
  manualInputContainer: {
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
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

