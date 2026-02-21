import { useTheme } from "@/context/ThemeContext";
import { Edit01Icon } from "hugeicons-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EditWaterModal from "./EditWaterModal";

interface WaterIntakeCardProps {
  consumedLiters: number;
  goalLiters: number;
  onUpdateWater: (data: { waterGoal: number; waterConsumed: number }) => void;
}

const GLASS_VOLUME = 0.25; // 250ml per glass
const MAX_GLASSES_PER_ROW = 8;
const MAX_TOTAL_GLASSES = 16;

export default function WaterIntakeCard({ consumedLiters, goalLiters, onUpdateWater }: WaterIntakeCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { colors, isDark } = useTheme();
  
  const totalGlasses = Math.min(Math.ceil(goalLiters / GLASS_VOLUME), MAX_TOTAL_GLASSES);
  const consumedGlasses = consumedLiters / GLASS_VOLUME;
  const glassesLeft = Math.max(0, totalGlasses - Math.floor(consumedGlasses));

  const renderGlass = (index: number) => {
    let source;
    if (index + 1 <= consumedGlasses) {
      source = require("../assets/images/full_glass.png");
    } else if (index < consumedGlasses) {
      source = require("../assets/images/half_glass.png");
    } else {
      source = require("../assets/images/empty_glass.png");
    }

    return (
      <View key={index} style={styles.glassContainer}>
        <Image source={source} style={styles.glassImage} resizeMode="contain" />
      </View>
    );
  };

  return (
    <View 
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      className="p-6 rounded-[32px] border shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text style={{ color: colors.text }} className="font-bold text-xl">Water</Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">{consumedLiters.toFixed(1)}L / {goalLiters.toFixed(1)}L today</Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: isDark ? colors.background : '#F9FAFB', borderColor: colors.border }}
          className="p-2 rounded-xl border"
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
        >
          <Edit01Icon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {Array.from({ length: totalGlasses }).map((_, i) => renderGlass(i))}
      </View>

      <View style={{ borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }} className="mt-8 pt-4 border-t flex-row justify-between items-center">
        <Text style={{ color: colors.primary }} className="font-bold text-sm">
          {glassesLeft > 0 ? `${glassesLeft} glasses left` : "Goal achieved! 💧"}
        </Text>
        <View style={{ backgroundColor: isDark ? 'rgba(41, 143, 80, 0.2)' : colors.primaryLight }} className="px-3 py-1.5 rounded-full">
            <Text style={{ color: isDark ? colors.primary : colors.primaryDark }} className="font-bold text-xs">{(consumedLiters * 1000).toFixed(0)} ml</Text>
        </View>
      </View>

      <EditWaterModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={onUpdateWater}
        initialValues={{ waterGoal: goalLiters, waterConsumed: consumedLiters }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  glassContainer: {
    width: 32,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassImage: {
    width: '100%',
    height: '100%',
  },
});
