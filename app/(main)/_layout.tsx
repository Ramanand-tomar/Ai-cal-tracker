import QuickActionModal from "@/components/QuickActionModal";
import { useTheme } from "@/hooks/useTheme";
import { Tabs } from "expo-router";
import { Add01Icon, Analytics01Icon, Home01Icon, UserIcon } from "hugeicons-react-native";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function MainLayout() {
  const [isQuickActionVisible, setIsQuickActionVisible] = useState(false);
  const { colors, isDark } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface }],
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: isDark ? colors.textMuted : "#9CA3AF",
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
            tabBarStyle: { display: 'none' },
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

        <Tabs.Screen
          name="water-intake"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="food-search"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="log-food"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="ai-analysis"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="ai-result"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="update-weight"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="personal-details"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="preferences"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="feature-requests"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="terms-conditions"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="privacy-policy"
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

const PlusButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="items-center justify-center"
      style={styles.plusButtonContainer}
    >
      <View 
        className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
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
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
    borderRadius: 28,
    marginHorizontal:8,
    height: 68,
    paddingHorizontal:8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderTopWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  plusButtonContainer: {
    top: -10,
    alignSelf: "center",
    paddingHorizontal: 6,
  }
});
