import { useTheme } from "@/context/ThemeContext";
import { ArrowRight01Icon } from "hugeicons-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileOptionProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  textColor?: string;
}

export default function ProfileOption({
  icon,
  label,
  onPress,
  showChevron = true,
  isLast = false,
  textColor,
}: ProfileOptionProps) {
  const { colors, isDark } = useTheme();
  
  const finalTextColor = textColor || colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container, 
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
      ]}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
          {icon}
        </View>
        <Text style={[styles.label, { color: finalTextColor }]}>{label}</Text>
      </View>
      {showChevron && <ArrowRight01Icon size={20} color={colors.textMuted} variant="stroke" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
