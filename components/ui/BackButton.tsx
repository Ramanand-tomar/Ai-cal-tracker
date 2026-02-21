
import { useRouter } from "expo-router";
import { ArrowLeft01Icon } from "hugeicons-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
}

export default function BackButton({ onPress, color }: BackButtonProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconColor = color || colors.text;

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[
        styles.backButton, 
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC' }
      ]}
      activeOpacity={0.7}
    >
      <ArrowLeft01Icon size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
