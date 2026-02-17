import { db } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FireIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>{type} • {duration} min • {intensity}</Text>

        <View style={styles.fireContainer}>
          <View style={styles.iconCircle}>
            <FireIcon size={64} color="#F97316" variant="stroke" />
          </View>
          <Text style={styles.burnedLabel}>Your Workout Burned</Text>
          <Text style={styles.calorieValue}>{calories}</Text>
          <Text style={styles.unitLabel}>kcal</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.motivationText}>Great job! You're crushing it.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logButton, loading && styles.logButtonDisabled]}
          onPress={handleLog}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
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
    backgroundColor: 'white',
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
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
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
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  burnedLabel: {
    fontSize: 16,
    color: '#64748B',
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
    color: '#94A3B8',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 34,
  },
  logButton: {
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
