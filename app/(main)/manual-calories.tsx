import { db } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
    ArrowLeft01Icon,
    FireIcon,
} from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ManualCaloriesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    if (!calories || isNaN(Number(calories)) || Number(calories) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid calorie amount.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'You must be logged in to save data.');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toLocaleDateString('en-CA');
      
      await addDoc(collection(db, 'dailyLogs'), {
        userId,
        date: today,
        calories: Number(calories),
        type: 'exercise',
        exerciseType: 'Manual',
        timestamp: serverTimestamp(),
      });

      console.log('Calories logged successfully');
      router.push('/');
    } catch (error) {
      console.error('Error logging calories:', error);
      Alert.alert('Error', 'Failed to log exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manual Entry</Text>
        <Text style={styles.headerSubtitle}>Enter calories burned manually</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/log-exercise')}
        >
          <ArrowLeft01Icon size={24} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FireIcon size={24} color={Colors.light.secondary} />
            <Text style={styles.cardLabel}>Calories Burned</Text>
          </View>
          
          <TextInput
            style={styles.calorieInput}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
            placeholder="0"
            placeholderTextColor="#CBD5E1"
            editable={!loading}
          />
          <Text style={styles.unitLabel}>cal</Text>
        </View>
      </ScrollView>

      {/* Log Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logButton, loading && styles.logButtonDisabled]}
          onPress={handleLog}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.logButtonText}>Log Exercise</Text>
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
    padding: 32,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  calorieInput: {
    fontSize: 72,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 200,
    borderBottomWidth: 3,
    borderBottomColor: Colors.light.primary,
    paddingVertical: 16,
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
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
  logButton: {
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  logButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
