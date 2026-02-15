import EditMacrosModal from "@/components/EditMacrosModal";
import { SegmentedHalfCircleProgress30 } from "@/components/HalfProgress";
import { Bread01Icon, Edit01Icon, NaturalFoodIcon, OrganicFoodIcon } from "hugeicons-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CaloriesCardProps {
  remaining: number;
  total: number;
  consumed: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onUpdateGoals: (data: { total: number; proteinGoal: number; carbsGoal: number; fatGoal: number }) => void;
}

export default function CaloriesCard({ 
  remaining, total, consumed, 
  protein, carbs, fat,
  proteinGoal, carbsGoal, fatGoal,
  onUpdateGoals
}: CaloriesCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const progress = Math.min(consumed / total, 1);
  
  const proteinLeft = Math.max(0, proteinGoal - protein);
  const carbsLeft = Math.max(0, carbsGoal - carbs);
  const fatLeft = Math.max(0, fatGoal - fat);

  return (
    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-gray-400 font-medium text-sm mb-1">Remaining Calories</Text>
          <Text className="text-gray-900 font-bold text-4xl">{remaining}</Text>
        </View>
        
        <TouchableOpacity 
          className="p-2 bg-gray-50 rounded-xl border border-gray-100"
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
        >
          <Edit01Icon size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center mt-4">
        <SegmentedHalfCircleProgress30 
          progress={progress}
          size={240}
          strokeWidth={20}
          segments={20}
          gapAngle={3}
          value={consumed}
          label="kcal consumed"
        />
      </View>

      <View className="mt-8">
        <View className="flex-row justify-between mb-6 px-4 py-4 bg-primary-50 rounded-3xl border border-primary-100/50">
          <View className="items-center flex-1">
            <Text className="text-primary-700 text-[10px] font-bold uppercase tracking-wider mb-1">Goal</Text>
            <Text className="text-primary-900 font-bold text-xl">{total}</Text>
          </View>
          <View className="w-[1px] h-10 bg-primary-200/50 self-center" />
          <View className="items-center flex-1">
            <Text className="text-primary-700 text-[10px] font-bold uppercase tracking-wider mb-1">Consumed</Text>
            <Text className="text-primary-900 font-bold text-xl">{consumed}</Text>
          </View>
        </View>

        <View className="flex-row" style={{ gap: 12 }}>
          {/* Protein Card */}
          <View className="flex-1 bg-primary-50 p-4 rounded-2xl border border-primary-100/30 items-center">
            <View className="w-12 h-12 rounded-2xl bg-blue-100 items-center justify-center mb-3">
              <NaturalFoodIcon size={24} color="#3b82f6" />
            </View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1">Protein left</Text>
            <Text className="text-gray-900 font-bold text-base">{proteinLeft}g</Text>
          </View>

          {/* Carbs Card */}
          <View className="flex-1 bg-primary-50 p-4 rounded-2xl border border-primary-100/30 items-center">
            <View className="w-12 h-12 rounded-2xl bg-orange-100 items-center justify-center mb-3">
              <Bread01Icon size={24} color="#f97316" />
            </View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1">Carbs left</Text>
            <Text className="text-gray-900 font-bold text-base">{carbsLeft}g</Text>
          </View>

          {/* Fat Card */}
          <View className="flex-1 bg-primary-50 p-4 rounded-2xl border border-primary-100/30 items-center">
            <View className="w-12 h-12 rounded-2xl bg-yellow-100 items-center justify-center mb-3">
              <OrganicFoodIcon size={24} color="#eab308" />
            </View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1">Fat left</Text>
            <Text className="text-gray-900 font-bold text-base">{fatLeft}g</Text>
          </View>
        </View>
      </View>

      <EditMacrosModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={onUpdateGoals}
        initialValues={{ total, proteinGoal, carbsGoal, fatGoal }}
      />
    </View>
  );
}
