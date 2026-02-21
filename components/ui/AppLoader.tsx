import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AppLoaderProps {
  size?: number;
  label?: string;
  fullScreen?: boolean;
}

export default function AppLoader({ size = 80, label, fullScreen = false }: AppLoaderProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={[containerStyle, { backgroundColor: fullScreen ? colors.background : 'transparent' }]}>
      <Image
        source={require('@/assets/images/Bouncing Fruits.gif')}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
