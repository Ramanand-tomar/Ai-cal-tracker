import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProfileCardProps {
  title?: string;
  children: React.ReactNode;
}

export default function ProfileCard({ title, children }: ProfileCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>}
      <View style={[
        styles.card, 
        { 
          backgroundColor: isDark ? colors.surface : colors.background, 
          borderColor: colors.border,
          shadowOpacity: isDark ? 0 : 0.03
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
});
