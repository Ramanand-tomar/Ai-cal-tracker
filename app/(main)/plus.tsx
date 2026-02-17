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
  
  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 bg-gray-50 rounded-full"
        >
          <ArrowLeft01Icon size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Add Entry</Text>
      </View>
      
      <View className="gap-4">
        {/* Log Exercise Button */}
        <TouchableOpacity
          onPress={() => router.push('/log-exercise')}
          className="flex-row items-center p-5 bg-orange-50 rounded-3xl border border-orange-100"
        >
          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4">
            <Dumbbell01Icon size={28} color="#F97316" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">Log Workout</Text>
            <Text className="text-gray-500">Track your exercise & calories</Text>
          </View>
        </TouchableOpacity>

        {/* Log Water Button */}
        <TouchableOpacity
          onPress={() => router.push('/water-intake')}
          className="flex-row items-center p-5 bg-blue-50 rounded-3xl border border-blue-100"
        >
          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4">
            <DropletIcon size={28} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">Log Water</Text>
            <Text className="text-gray-500">Track your hydration</Text>
          </View>
        </TouchableOpacity>

        {/* Manual Calorie Button (Existing) */}
        <TouchableOpacity
          onPress={() => router.push('/manual-calories')}
          className="flex-row items-center p-5 bg-gray-50 rounded-3xl border border-gray-100"
        >
          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4">
            <FireIcon size={28} color="#6B7280" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">Manual Entry</Text>
            <Text className="text-gray-500">Quick add calories burned</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
