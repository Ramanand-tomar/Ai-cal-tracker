import Colors from "@/constants/Colors";
import { AiSettingIcon, SparklesIcon } from "hugeicons-react-native";
import React from "react";
import { Text, View } from "react-native";

interface InsightCardProps {
  insight: string;
}

export default function InsightCard({ insight }: InsightCardProps) {
  if (!insight) return null;

  return (
    <View className="bg-primary-50/50 p-6 rounded-[32px] border border-primary-100/30 mt-6 overflow-hidden relative">
      {/* Decorative Sparkle */}
      <View className="absolute -top-2 -right-2 opacity-10">
        <SparklesIcon size={80} color={Colors.light.primary} />
      </View>

      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
          <AiSettingIcon size={18} color={Colors.light.primary} variant="stroke" />
        </View>
        <Text className="ml-3 text-primary-900 font-black text-xs uppercase tracking-widest">
          Gemini AI Insight
        </Text>
      </View>

      <Text className="text-gray-800 font-bold text-lg leading-6 italic">
        "{insight}"
      </Text>
      
      <View className="mt-4 flex-row items-center">
         <View className="h-1 w-12 bg-primary-200 rounded-full" />
         <Text className="ml-3 text-[10px] font-bold text-primary-400 uppercase tracking-tighter">
            Personalized for your goals
         </Text>
      </View>
    </View>
  );
}
