import QuickActionModal from "@/components/QuickActionModal";
import Colors from "@/constants/Colors";
import { Tabs } from "expo-router";
import { Add01Icon, Analytics01Icon, Home01Icon, UserIcon } from "hugeicons-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

export default function MainLayout() {
  const [isQuickActionVisible, setIsQuickActionVisible] = useState(false);

  return (
    <>
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
        
        <Tabs.Screen
          name="plus"
          options={{
            tabBarButton: () => (
              <PlusButton onPress={() => setIsQuickActionVisible(true)} />
            ),
          }}
        />

        <Tabs.Screen
          name="log-exercise"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="exercise-details"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="manual-calories"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="workout-summary"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>

      <QuickActionModal 
        isVisible={isQuickActionVisible} 
        onClose={() => setIsQuickActionVisible(false)} 
      />
    </>
  );
}

const PlusButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="items-center justify-center"
    style={styles.plusButtonContainer}
  >
    <View 
      className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
      style={{
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Add01Icon size={32} color="white" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
    height: 70,
    paddingBottom: Platform.OS === "ios" ? 0 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderTopWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  plusButtonContainer: {
    top: -15,
    paddingHorizontal: 8,
  }
});
