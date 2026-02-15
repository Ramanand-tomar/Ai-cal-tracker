import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import { Add01Icon, Analytics01Icon, Home01Icon, UserIcon } from "hugeicons-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Home01Icon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => <Analytics01Icon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <UserIcon size={24} color={color} />,
        }}
      />
      
      {/* Floating Action Button - Not a real screen */}
      <Tabs.Screen
        name="plus"
        options={{
          tabBarButton: () => <PlusButton />,
        }}
      />
    </Tabs>
  );
}

const PlusButton = () => (
  <TouchableOpacity
    activeOpacity={0.8}
    className="items-center justify-center"
    style={styles.plusButtonContainer}
  >
    <View className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary-200">
      <Add01Icon size={28} color="white" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    height: 75,
    paddingBottom: Platform.OS === "ios" ? 0 : 0, // Centering icons
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderTopWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  plusButtonContainer: {
    top: -10, // Slight lift for prominence
    paddingHorizontal: 10,
  }
});
