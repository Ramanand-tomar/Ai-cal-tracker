
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
    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mt-6">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-gray-900 font-bold text-xl">Water</Text>
          <Text className="text-gray-500 text-sm mt-1">{consumedLiters}L / {goalLiters}L today</Text>
        </View>
        <TouchableOpacity 
          className="p-2 bg-gray-50 rounded-xl border border-gray-100"
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
        >
          <Edit01Icon size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {Array.from({ length: totalGlasses }).map((_, i) => renderGlass(i))}
      </View>

      <View className="mt-8 pt-4 border-t border-gray-50 flex-row justify-between items-center">
        <Text className="text-primary-700 font-bold text-sm">
          {glassesLeft > 0 ? `${glassesLeft} glasses left` : "Goal achieved! 💧"}
        </Text>
        <View className="bg-primary-50 px-3 py-1.5 rounded-full">
            <Text className="text-primary-900 font-bold text-xs">{(consumedLiters * 1000).toFixed(0)} ml</Text>
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
