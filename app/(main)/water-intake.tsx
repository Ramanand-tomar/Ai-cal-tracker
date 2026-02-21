import AppLoader from '@/components/ui/AppLoader';
import { db } from '@/config/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft01Icon, MinusSignIcon, PlusSignIcon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WaterIntakeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [halfGlassCount, setHalfGlassCount] = useState(0);

  const GLASS_VOLUME_ML = 250;
  const HALF_GLASS_VOLUME = GLASS_VOLUME_ML / 2;
  const MAX_HALF_GLASSES = 8;

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
        type: 'water',
        amount: totalMl,
        timestamp: serverTimestamp(),
      });

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: isDark ? colors.surface : 'white' }]}
        >
          <ArrowLeft01Icon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Water Intake</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        <View style={styles.visualizerContainer}>
          {renderGlasses()}
        </View>

        <View style={[styles.controlsContainer, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }, halfGlassCount === 0 && styles.controlButtonDisabled]}
            onPress={handleDecrement}
            disabled={halfGlassCount === 0}
          >
            <MinusSignIcon size={32} color={halfGlassCount === 0 ? colors.textMuted : colors.text} />
          </TouchableOpacity>

          <View style={styles.amountDisplay}>
            <Text style={[styles.amountText, { color: colors.primary }]}>{totalMl}</Text>
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>ml</Text>
          </View>

          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }, halfGlassCount === MAX_HALF_GLASSES && styles.controlButtonDisabled]}
            onPress={handleIncrement}
            disabled={halfGlassCount === MAX_HALF_GLASSES}
          >
            <PlusSignIcon size={32} color={halfGlassCount === MAX_HALF_GLASSES ? colors.textMuted : colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          1 Half Glass = {HALF_GLASS_VOLUME}ml • Full Glass = {GLASS_VOLUME_ML}ml
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.logButton, 
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            (loading || totalMl === 0) && styles.logButtonDisabled
          ]}
          onPress={handleLogWater}
          disabled={loading || totalMl === 0}
        >
          {loading ? (
            <AppLoader size={30} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 80,
    height: 120,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
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
    lineHeight: 38,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
