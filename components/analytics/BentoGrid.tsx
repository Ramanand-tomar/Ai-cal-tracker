import Colors from "@/constants/Colors";
import { DropletIcon } from "hugeicons-react-native";
import React from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import BentoCard from "./BentoCard";

const { width } = Dimensions.get("window");

interface BentoGridProps {
  insights: any;
  isLoading: boolean;
}

export default function BentoGrid({ insights, isLoading }: BentoGridProps) {
  if (isLoading && !insights) {
    return (
      <View style={styles.aiLoadingContainer}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <Text style={styles.aiLoadingText}>AI is analyzing your week...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Log some data to see AI insights</Text>
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
          <Text style={styles.healthScoreValue}>{insights.healthScore}</Text>
          <Text style={styles.healthScoreMax}>/100</Text>
        </View>
      </BentoCard>

      {/* Two Column Row for Macro and Activity */}
      <View style={styles.statsRow}>
        {/* Top Macro - Small Card */}
        <BentoCard label="Top Macro" style={styles.statCard}>
          <View style={styles.macroContent}>
            <Text style={styles.macroEmoji}>{insights.topMacro.icon}</Text>
            <Text style={styles.macroName}>{insights.topMacro.name}</Text>
          </View>
          <Text style={styles.macroValue}>{insights.topMacro.value}</Text>
        </BentoCard>

        {/* Consistency - Small Card */}
        <BentoCard label="Activity" style={styles.statCard}>
          <Text style={styles.consistencyText}>{insights.consistencyInsight}</Text>
        </BentoCard>
      </View>

      {/* Recommendation - Wide Card */}
      <BentoCard 
        label="AI Recommendation" 
        variant="blue"
        style={styles.recommendationCard}
      >
        {/* <View style={styles.recommendationHeader}>
          <DropletIcon size={18} color="#0EA5E9" variant="stroke" />
          <Text style={styles.recommendationHeaderText}>AI Recommendation</Text>
        </View> */}
        <Text style={styles.recommendationText}>{insights.recommendation}</Text>
      </BentoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  aiLoadingContainer: {
    height: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  aiLoadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  placeholderCard: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
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
    color: Colors.light.primary,
    letterSpacing: -2,
  },
  healthScoreMax: {
    fontSize: 20,
    fontWeight: '800',
    color: '#CBD5E1',
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
    color: '#1E293B',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  consistencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 20,
  },
  recommendationCard: {
    width: '100%',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369A1',
    lineHeight: 22,
  },
});
