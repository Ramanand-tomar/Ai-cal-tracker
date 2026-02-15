import { useUser } from "@clerk/clerk-expo";
import { Notification01Icon } from "hugeicons-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  const { user } = useUser();

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-white mt-12">
      <View className="flex-row items-center">
        {user?.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            className="w-12 h-12 rounded-full border-2 border-primary-50"
          />
        ) : (
          <View className="w-12 h-12 bg-primary-50 rounded-full items-center justify-center border-2 border-primary-50">
            <Text className="text-primary font-bold text-lg">
              {user?.firstName?.charAt(0) || "U"}
            </Text>
          </View>
        )}
        <View className="ml-4">
          <Text className="text-gray-400 font-medium text-sm">Welcome back 👋</Text>
          <Text className="text-gray-900 font-bold text-xl">
            {user?.firstName || "User"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
      >
        <Notification01Icon size={22} color="#111827" />
        {/* Subtle indicator for notifications */}
        <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </TouchableOpacity>
    </View>
  );
}
