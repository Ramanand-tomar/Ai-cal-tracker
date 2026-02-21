import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
    ArrowLeft01Icon,
    DropletIcon,
    Dumbbell01Icon,
    FireIcon
} from 'hugeicons-react-native';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function PlusScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 p-6">
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 12 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ backgroundColor: isDark ? colors.surface : colors.border }}
          className="mr-4 p-2 rounded-full"
        >
          <ArrowLeft01Icon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-2xl font-bold">Add Entry</Text>
      </View>
      
      <View className="gap-4">
        {/* Log Exercise Button */}
        <TouchableOpacity
          onPress={() => router.push('/log-exercise')}
          style={{ 
            backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED',
            borderColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5'
          }}
          className="flex-row items-center p-5 rounded-3xl border"
        >
          <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white' }} className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
            <Dumbbell01Icon size={28} color="#F97316" />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-lg font-bold">Log Workout</Text>
            <Text style={{ color: colors.textSecondary }}>Track your exercise & calories</Text>
          </View>
        </TouchableOpacity>

        {/* Log Water Button */}
        <TouchableOpacity
          onPress={() => router.push('/water-intake')}
          style={{ 
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'
          }}
          className="flex-row items-center p-5 rounded-3xl border"
        >
          <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white' }} className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
            <DropletIcon size={28} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-lg font-bold">Log Water</Text>
            <Text style={{ color: colors.textSecondary }}>Track your hydration</Text>
          </View>
        </TouchableOpacity>

        {/* Manual Calorie Button (Existing) */}
        <TouchableOpacity
          onPress={() => router.push('/manual-calories')}
          style={{ 
            backgroundColor: isDark ? colors.surface : colors.border,
            borderColor: colors.border
          }}
          className="flex-row items-center p-5 rounded-3xl border"
        >
          <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white' }} className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
            <FireIcon size={28} color={isDark ? colors.textMuted : "#6B7280"} />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-lg font-bold">Manual Entry</Text>
            <Text style={{ color: colors.textSecondary }}>Quick add calories burned</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

