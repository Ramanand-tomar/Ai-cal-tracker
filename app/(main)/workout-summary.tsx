import AppLoader from '@/components/ui/AppLoader';
import { db } from '@/config/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FireIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const calories = Number(params.calories) || 0;
  const duration = params.duration || '0';
  const type = params.type || 'Workout';
  const intensity = params.intensity || 'Medium';

  const handleLog = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await addDoc(collection(db, 'dailyLogs'), {
        userId,
        date: today,
        calories: calories,
        duration: Number(duration),
        intensity: intensity,
        type: 'exercise',
        exerciseType: type,
        timestamp: serverTimestamp(),
      });

      console.log('Workout logged successfully');
      router.push('/');
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Workout Complete!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{type} • {duration} min • {intensity}</Text>

        <View style={styles.fireContainer}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
            <FireIcon size={64} color="#F97316" variant="stroke" />
          </View>
          <Text style={[styles.burnedLabel, { color: colors.textSecondary }]}>Your Workout Burned</Text>
          <Text style={[styles.calorieValue]}>{calories}</Text>
          <Text style={[styles.unitLabel, { color: colors.textMuted }]}>kcal</Text>
        </View>

        <View style={[styles.statsContainer, { backgroundColor: isDark ? colors.surface : '#F8FAFC' }]}>
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>Great job! You're crushing it.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && styles.logButtonDisabled]}
          onPress={handleLog}
          disabled={loading}
        >
          {loading ? (
            <AppLoader size={30} />
          ) : (
            <Text style={styles.logButtonText}>Log Workout</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
    fontWeight: '500',
  },
  fireContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  burnedLabel: {
    fontSize: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  calorieValue: {
    fontSize: 80,
    fontWeight: '900',
    color: '#F97316', // Orange for fire
    lineHeight: 80,
    marginBottom: 4,
  },
  unitLabel: {
    fontSize: 24,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 34,
  },
  logButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  logButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
