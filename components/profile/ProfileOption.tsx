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
  textColor = "#1E293B",
}: ProfileOptionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, !isLast && styles.borderBottom]}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {showChevron && <ArrowRight01Icon size={20} color="#94A3B8" variant="stroke" />}
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
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
