import { useTheme } from "@/context/ThemeContext";
import { AiSettingIcon, SparklesIcon } from "hugeicons-react-native";
import React from "react";
import { Text, View } from "react-native";

interface InsightCardProps {
  insight: string;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const { colors, isDark } = useTheme();
  if (!insight) return null;

  return (
    <View 
      style={{ 
        backgroundColor: isDark ? 'rgba(41, 143, 80, 0.1)' : colors.primaryLight,
        borderColor: isDark ? 'rgba(41, 143, 80, 0.2)' : 'rgba(41, 143, 80, 0.3)'
      }}
      className="p-6 rounded-[32px] border mt-6 overflow-hidden relative"
    >
      {/* Decorative Sparkle */}
      <View className="absolute -top-2 -right-2 opacity-10">
        <SparklesIcon size={80} color={colors.primary} />
      </View>

      <View className="flex-row items-center mb-3">
        <View style={{ backgroundColor: isDark ? 'rgba(41, 143, 80, 0.2)' : colors.primaryLight }} className="w-8 h-8 rounded-full items-center justify-center">
          <AiSettingIcon size={18} color={colors.primary} variant="stroke" />
        </View>
        <Text style={{ color: colors.text }} className="ml-3 font-black text-xl uppercase tracking-widest">
          AI Insight
        </Text>
      </View>

      <Text style={{ color: colors.text }} className="font-bold text-lg leading-6 italic">
        "{insight}"
      </Text>
      
      <View className="mt-4 flex-row items-center">
         <View style={{ backgroundColor: isDark ? colors.primary : '#E2E8F0' }} className="h-1 w-12 rounded-full" />
         <Text style={{ color: colors.textMuted }} className="ml-3 text-[10px] font-bold uppercase tracking-tighter">
            Personalized for your goals
         </Text>
      </View>
    </View>
  );
}

