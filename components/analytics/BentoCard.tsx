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
  labelColor = '#64748B',
  variant = 'default'
}: BentoCardProps) {
  return (
    <View style={[
      styles.card, 
      variant === 'blue' && styles.blueCard,
      style
    ]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {children}
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    color: '#94A3B8',
    marginTop: 8,
  },
});
