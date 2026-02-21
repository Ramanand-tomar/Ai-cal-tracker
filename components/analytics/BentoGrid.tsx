import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import BentoCard from "./BentoCard";

const { width } = Dimensions.get("window");

interface BentoGridProps {
  insights: any;
  isLoading: boolean;
}

export default function BentoGrid({ insights, isLoading }: BentoGridProps) {
  const { colors, isDark } = useTheme();

  if (isLoading && !insights) {
    return (
      <View style={[styles.aiLoadingContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.aiLoadingText, { color: colors.textSecondary }]}>AI is analyzing your week...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={[styles.placeholderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Log some data to see AI insights</Text>
      </View>
    );
  }

  return (
    <View style={styles.bentoGrid}>
      {/* Health Score - Complete Grid Row */}
      <BentoCard 
        label="Health Score" 
        description="Based on your logs"
        style={styles.healthScoreCard}
      >
        <View style={styles.healthScoreContainer}>
          <Text style={[styles.healthScoreValue, { color: colors.primary }]}>{insights.healthScore}</Text>
          <Text style={[styles.healthScoreMax, { color: colors.textMuted }]}>/100</Text>
        </View>
      </BentoCard>

      {/* Two Column Row for Macro and Activity */}
      <View style={styles.statsRow}>
        {/* Top Macro - Small Card */}
        <BentoCard label="Top Macro" style={styles.statCard}>
          <View style={styles.macroContent}>
            <Text style={styles.macroEmoji}>{insights.topMacro.icon}</Text>
            <Text style={[styles.macroName, { color: colors.text }]}>{insights.topMacro.name}</Text>
          </View>
          <Text style={[styles.macroValue, { color: colors.textSecondary }]}>{insights.topMacro.value}</Text>
        </BentoCard>

        {/* Consistency - Small Card */}
        <BentoCard label="Activity" style={styles.statCard}>
          <Text style={[styles.consistencyText, { color: colors.textSecondary }]}>{insights.consistencyInsight}</Text>
        </BentoCard>
      </View>

      {/* Recommendation - Wide Card */}
      <BentoCard 
        label="AI Recommendation" 
        variant="blue"
        style={styles.recommendationCard}
      >
        <Text style={[
          styles.recommendationText, 
          { color: isDark ? (colors.primary === '#0A84FF' ? '#60A5FA' : colors.primary) : '#0369A1' }
        ]}>{insights.recommendation}</Text>
      </BentoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  aiLoadingContainer: {
    height: 200,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
  },
  aiLoadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderCard: {
    height: 180,
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bentoGrid: {
    width: '100%',
    gap: 16,
  },
  healthScoreCard: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: -4,
  },
  healthScoreValue: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -2,
  },
  healthScoreMax: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    height: 140,
    justifyContent: 'center',
  },
  macroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  macroEmoji: {
    fontSize: 24,
  },
  macroName: {
    fontSize: 13,
    fontWeight: '800',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  consistencyText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  recommendationCard: {
    width: '100%',
  },
  recommendationText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
});

