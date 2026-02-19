import { CrownIcon } from "hugeicons-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TrialCardProps {
  onPress?: () => void;
}

export default function TrialCard({ onPress }: TrialCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.iconBg}>
        <CrownIcon size={24} color="#F59E0B" variant="stroke" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Start Free Trial</Text>
        <Text style={styles.subtitle}>Start 7 days Free trial</Text>
      </View>
      <View style={styles.badge}>
         <Text style={styles.badgeText}>PRO</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginBottom: 24,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#92400E",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B45309",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900",
  },
});
