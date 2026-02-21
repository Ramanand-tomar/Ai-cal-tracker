import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { Notification01Icon } from "hugeicons-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  const { user } = useUser();
  const { colors, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-row items-center justify-between px-6 py-3">
      <View className="flex-row items-center">
        {user?.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            style={{ borderColor: isDark ? colors.surface : colors.primaryLight }}
            className="w-12 h-12 rounded-full border-2"
          />
        ) : (
          <View style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }} className="w-12 h-12 rounded-full items-center justify-center border-2">
            <Text style={{ color: colors.primary }} className="font-bold text-lg">
              {user?.firstName?.charAt(0) || "U"}
            </Text>
          </View>
        )}
        <View className="ml-3">
          <Text style={{ color: colors.textSecondary }} className="font-semibold text-sm">Welcome back 👋</Text>
          <Text style={{ color: colors.text }} className="font-bold text-xl">
            {user?.firstName || "User"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={{ backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }}
        className="w-11 h-11 rounded-xl items-center justify-center border"
      >
        <Notification01Icon size={22} color={colors.text} />
        {/* Subtle indicator for notifications */}
        <View style={{ borderColor: colors.background }} className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2" />
      </TouchableOpacity>
    </View>
  );
}

