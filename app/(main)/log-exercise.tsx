import { useRouter } from 'expo-router';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Dumbbell01Icon,
    PencilEdit01Icon,
    WorkoutRunIcon
} from 'hugeicons-react-native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LogExerciseScreen() {
  const router = useRouter();

  const ExerciseOption = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    description: string; 
    icon: any; 
    color: string; 
    bgColor: string;
  }) => (
    <TouchableOpacity 
      style={styles.optionCard}
      activeOpacity={0.7}
      onPress={() => {
        if (title === 'Manual') {
          router.push('/manual-calories');
        } else {
          router.push({
            pathname: '/exercise-details',
            params: { type: title, description: description }
          });
        }
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon size={32} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <ArrowRight01Icon size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Exercise</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft01Icon size={24} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          <ExerciseOption 
            title="Run"
            description="Running, Walking, Cycling etc"
            icon={WorkoutRunIcon}
            color="#3B82F6"
            bgColor="#EFF6FF"
          />
          <ExerciseOption 
            title="Weight Lifting"
            description="Gym, Machine etc"
            icon={Dumbbell01Icon}
            color="#8B5CF6"
            bgColor="#F5F3FF"
          />
          <ExerciseOption 
            title="Manual"
            description="Enter calories Burn Manually"
            icon={PencilEdit01Icon}
            color="#F97316"
            bgColor="#FFF7ED"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Refreshing premium light blue/gray tint
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
    marginBottom: 20,
    letterSpacing: -0.5,
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
    paddingBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
