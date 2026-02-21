import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface BentoCardProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  style?: ViewStyle | ViewStyle[];
  labelColor?: string;
  variant?: 'default' | 'blue';
}

export default function BentoCard({ 
  label, 
  children, 
  description, 
  style, 
  labelColor,
  variant = 'default'
}: BentoCardProps) {
  const { colors, isDark } = useTheme();
  
  const defaultLabelColor = colors.textMuted;
  const finalLabelColor = labelColor || defaultLabelColor;

  const cardBg = isDark ? colors.surface : variant === 'blue' ? '#F0F9FF' : '#F8FAFC';
  const cardBorder = isDark 
    ? (variant === 'blue' ? 'rgba(14, 165, 233, 0.2)' : colors.border) 
    : (variant === 'blue' ? '#E0F2FE' : '#F1F5F9');

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: cardBg, 
        borderColor: cardBorder,
        shadowColor: variant === 'blue' ? "#0EA5E9" : "#000",
        shadowOpacity: isDark ? (variant === 'blue' ? 0.2 : 0) : 0.05
      },
      style
    ]}>
      <Text style={[styles.label, { color: finalLabelColor }]}>{label}</Text>
      {children}
      {description && <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  blueCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#E0F2FE',
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.08,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  description: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
});
