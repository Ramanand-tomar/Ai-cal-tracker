import { db } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WaterIntakeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [halfGlassCount, setHalfGlassCount] = useState(0); // 0 to 8

  const GLASS_VOLUME_ML = 250;
  const HALF_GLASS_VOLUME = GLASS_VOLUME_ML / 2;
  const MAX_HALF_GLASSES = 8; // 4 Full glasses

  const totalMl = halfGlassCount * HALF_GLASS_VOLUME;

  const handleIncrement = () => {
    if (halfGlassCount < MAX_HALF_GLASSES) {
      setHalfGlassCount(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (halfGlassCount > 0) {
      setHalfGlassCount(prev => prev - 1);
    }
  };

  const handleLogWater = async () => {
    if (totalMl === 0) {
      Alert.alert('Empty', 'Please add some water before logging.');
      return;
    }
    if (!userId) return;

    setLoading(true);
    try {
      const today = new Date().toLocaleDateString('en-CA');
      
      await addDoc(collection(db, 'dailyLogs'), {
        userId,
        date: today,
        type: 'water', // Distinct type for water logs
        amount: totalMl, // stored in ml (e.g. 500)
        timestamp: serverTimestamp(),
      });

      console.log('Water logged successfully');
      router.push('/');
    } catch (error) {
      console.error('Error logging water:', error);
      Alert.alert('Error', 'Failed to log water. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderGlasses = () => {
    if (halfGlassCount === 0) {
      return (
        <Image 
          source={require('@/assets/images/empty_glass.png')} 
          style={styles.glassImage} 
          resizeMode="contain" 
        />
      );
    }

    const fullGlasses = Math.floor(halfGlassCount / 2);
    const hasHalf = halfGlassCount % 2 !== 0;
    const glasses = [];

    // Render Full Glasses
    for (let i = 0; i < fullGlasses; i++) {
      glasses.push(
        <Image 
          key={`full-${i}`}
          source={require('@/assets/images/full_glass.png')} 
          style={styles.glassImageSmall} 
          resizeMode="contain" 
        />
      );
    }

    // Render Half Glass if needed
    if (hasHalf) {
      glasses.push(
        <Image 
          key="half"
          source={require('@/assets/images/half_glass.png')} 
          style={styles.glassImageSmall} 
          resizeMode="contain" 
        />
      );
    }

    return <View style={styles.glassesContainer}>{glasses}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft01Icon size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Water Intake</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* Visualizer */}
        <View style={styles.visualizerContainer}>
          {renderGlasses()}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, halfGlassCount === 0 && styles.controlButtonDisabled]}
            onPress={handleDecrement}
            disabled={halfGlassCount === 0}
          >
            <MinusSignIcon size={32} color={halfGlassCount === 0 ? '#CBD5E1' : '#0F172A'} />
          </TouchableOpacity>

          <View style={styles.amountDisplay}>
            <Text style={styles.amountText}>{totalMl}</Text>
            <Text style={styles.unitText}>ml</Text>
          </View>

          <TouchableOpacity 
            style={[styles.controlButton, halfGlassCount === MAX_HALF_GLASSES && styles.controlButtonDisabled]}
            onPress={handleIncrement}
            disabled={halfGlassCount === MAX_HALF_GLASSES}
          >
            <PlusSignIcon size={32} color={halfGlassCount === MAX_HALF_GLASSES ? '#CBD5E1' : '#0F172A'} />
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          1 Half Glass = {HALF_GLASS_VOLUME}ml • Full Glass = {GLASS_VOLUME_ML}ml
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logButton, (loading || totalMl === 0) && styles.logButtonDisabled]}
          onPress={handleLogWater}
          disabled={loading || totalMl === 0}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.logButtonText}>Log Water</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  visualizerContainer: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glassesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  glassImage: {
    width: 200,
    height: 300,
  },
  glassImageSmall: {
    width: 80, // Smaller when multiple
    height: 120,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  amountDisplay: {
    alignItems: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
    lineHeight: 38,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  helperText: {
    fontSize: 14,
    color: '#94A3B8',
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
