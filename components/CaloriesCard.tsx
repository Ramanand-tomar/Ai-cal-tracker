import EditMacrosModal from "@/components/EditMacrosModal";
import { SegmentedHalfCircleProgress30 } from "@/components/HalfProgress";
import { useTheme } from "@/context/ThemeContext";
import { Activity01Icon, Edit01Icon, FireIcon, MenuRestaurantIcon } from "hugeicons-react-native";
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
  const { colors, isDark } = useTheme();
  const progress = Math.min(consumed / total, 1);
  
  const proteinLeft = Math.max(0, proteinGoal - protein);
  const carbsLeft = Math.max(0, carbsGoal - carbs);
  const fatLeft = Math.max(0, fatGoal - fat);

  return (
    <View 
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      className="p-6 rounded-[32px] border shadow-sm overflow-hidden"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text style={{ color: colors.textSecondary }} className="font-medium text-sm mb-1">Remaining Calories</Text>
          <Text style={{ color: colors.text }} className="font-bold text-4xl">{remaining}</Text>
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
        <View 
          style={{ 
            backgroundColor: isDark ? 'rgba(41, 143, 80, 0.1)' : colors.primaryLight,
            borderColor: isDark ? 'rgba(41, 143, 80, 0.2)' : 'rgba(41, 143, 80, 0.1)'
          }}
          className="flex-row justify-between mb-6 px-4 py-4 rounded-3xl border"
        >
          <View className="items-center flex-1">
            <Text style={{ color: isDark ? colors.primary : colors.primaryDark }} className="text-[10px] font-bold uppercase tracking-wider mb-1">Goal</Text>
            <Text style={{ color: isDark ? colors.text : colors.primaryDark }} className="font-bold text-xl">{total}</Text>
          </View>
          <View style={{ backgroundColor: isDark ? 'rgba(41, 143, 80, 0.3)' : 'rgba(41, 143, 80, 0.1)' }} className="w-[1px] h-10 self-center" />
          <View className="items-center flex-1">
            <Text style={{ color: isDark ? colors.primary : colors.primaryDark }} className="text-[10px] font-bold uppercase tracking-wider mb-1">Consumed</Text>
            <Text style={{ color: isDark ? colors.text : colors.primaryDark }} className="font-bold text-xl">{consumed}</Text>
          </View>
        </View>

        <View className="flex-row" style={{ gap: 12 }}>
          {/* Protein Card */}
          <View 
            style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}
            className="flex-1 p-4 rounded-2xl border items-center"
          >
            <View style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
              <Activity01Icon size={24} color="#3b82f6" />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[8px] font-bold uppercase mb-1">Protein left</Text>
            <Text style={{ color: colors.text }} className="font-bold text-base">{proteinLeft.toFixed(1)}g</Text>
          </View>

          {/* Carbs Card */}
          <View 
            style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED', borderColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }}
            className="flex-1 p-4 rounded-2xl border items-center"
          >
            <View style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
              <MenuRestaurantIcon size={24} color="#f97316" />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[8px] font-bold uppercase mb-1">Carbs left</Text>
            <Text style={{ color: colors.text }} className="font-bold text-base">{carbsLeft.toFixed(1)}g</Text>
          </View>

          {/* Fat Card */}
          <View 
            style={{ backgroundColor: isDark ? 'rgba(234, 179, 8, 0.1)' : '#FEFCE8', borderColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3' }}
            className="flex-1 p-4 rounded-2xl border items-center"
          >
            <View style={{ backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
              <FireIcon size={24} color="#eab308" />
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[8px] font-bold uppercase mb-1">Fat left</Text>
            <Text style={{ color: colors.text }} className="font-bold text-base">{fatLeft.toFixed(1)}g</Text>
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

