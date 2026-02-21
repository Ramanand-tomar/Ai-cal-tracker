import AppLoader from '@/components/ui/AppLoader';
import { db } from '@/config/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
    ArrowLeft01Icon,
    FireIcon,
} from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ManualCaloriesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { colors, isDark } = useTheme();
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

      router.push('/');
    } catch (error) {
      console.error('Error logging calories:', error);
      Alert.alert('Error', 'Failed to log exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: isDark ? colors.surface : 'white' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manual Entry</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Enter calories burned manually</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}
          onPress={() => router.push('/log-exercise')}
        >
          <ArrowLeft01Icon size={24} color={colors.textSecondary} />
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <FireIcon size={24} color={colors.secondary} />
            <Text style={[styles.cardLabel, { color: colors.text }]}>Calories Burned</Text>
          </View>
          
          <TextInput
            style={[styles.calorieInput, { color: colors.text, borderBottomColor: colors.primary }]}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            editable={!loading}
          />
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>cal</Text>
        </View>
      </ScrollView>

      {/* Log Button */}
      <View style={[styles.footer, { backgroundColor: isDark ? colors.surface : 'white', borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.logButton, 
            { backgroundColor: colors.primary },
            loading && styles.logButtonDisabled
          ]}
          onPress={handleLog}
          disabled={loading}
        >
          {loading ? (
            <AppLoader size={30} />
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
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
    padding: 32,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
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
  },
  calorieInput: {
    fontSize: 72,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 200,
    borderBottomWidth: 3,
    paddingVertical: 16,
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
  },
  logButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
