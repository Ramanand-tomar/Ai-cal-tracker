import { useRouter } from 'expo-router';
import { ArrowLeft01Icon } from 'hugeicons-react-native';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function PlusScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <TouchableOpacity 
        onPress={() => router.back()}
        className="mb-8"
      >
        <ArrowLeft01Icon size={24} color="#111827" />
      </TouchableOpacity>
      
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900">Add New Entry</Text>
        <Text className="text-gray-500 mt-2 text-center">
          This is where you'll be able to add new calorie logs, workouts, or health data.
        </Text>
      </View>
    </SafeAreaView>
  );
}
