import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Activity01Icon,
  Add01Icon,
  Dumbbell01Icon,
  FireIcon,
  MenuRestaurantIcon,
  Yoga01Icon
} from "hugeicons-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface Activity {
  id: string;
  type: 'meal' | 'exercise' | 'water';
  exerciseType?: string; // Run, Weight Lifting, Manual, etc.
  title: string;
  subtitle: string;
  value: string; // Display string "500 kcal" or "250 ml"
  calories?: number;
  amount?: number;
  duration?: number;
  intensity?: string;
  time: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const mockActivities: Activity[] = [];

export default function RecentActivity({ activities = mockActivities }: RecentActivityProps) {
  const router = useRouter();

  const getIcon = (type: string, exerciseType?: string) => {
    if (type === 'meal') return MenuRestaurantIcon;
    if (type === 'water') return Activity01Icon;
    if (exerciseType === 'Run') return Activity01Icon;
    if (exerciseType === 'Weight Lifting') return Dumbbell01Icon;
    if (exerciseType === 'Yoga') return Yoga01Icon;
    return Activity01Icon;
  };

  const getIconColor = (type: string) => {
    if (type === 'meal') return Colors.light.primary;
    if (type === 'water') return '#0EA5E9'; // Sky blue for water
    return '#3B82F6'; // Blue for exercises
  };

  const getIconBg = (type: string) => {
    if (type === 'meal') return '#EAF6ED';
    if (type === 'water') return '#F0F9FF'; // Light sky blue
    return '#EFF6FF'; // Light blue for exercises
  };

  const renderActivityItem = (activity: Activity, index: number) => {
    const isExercise = activity.type === 'exercise';
    const IconComponent = getIcon(activity.type, activity.exerciseType) || Activity01Icon;
    const iconBg = getIconBg(activity.type);
    const iconColor = getIconColor(activity.type);

    return (
      <Animated.View 
        key={activity.id}
        entering={FadeInDown.delay(index * 100).springify()}
      >
        <TouchableOpacity 
          style={styles.activityItem}
          activeOpacity={0.7}
        >
          {/* Left Icon with Accent */}
          <View style={[styles.itemIconContainer, { backgroundColor: iconBg }]}>
            <View style={[styles.iconAccent, { backgroundColor: iconColor }]} />
            <IconComponent size={22} color={iconColor} variant="stroke" />
          </View>

          {/* Middle Content */}
          <View style={styles.itemInfo}>
            <View className="flex-row items-center justify-between mb-1">
                <Text style={styles.itemTitle} numberOfLines={1}>{activity.title}</Text>
                <Text style={styles.itemTime}>{activity.time}</Text>
            </View>
            
            {isExercise ? (
              <View className="flex-row items-center">
                <View style={styles.caloriesPill}>
                  <FireIcon size={12} color="#F97316" variant="stroke" />
                  <Text style={styles.caloriesText}>
                    {activity.calories || 0} kcal
                  </Text>
                </View>
                
                {(activity.intensity || activity.duration) && (
                  <View className="flex-row items-center ml-2">
                    <View className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
                    <Text style={styles.itemSubtitle}>
                      {activity.intensity ? `${activity.intensity} • ` : ''}
                      {activity.duration ? `${activity.duration}m` : ''}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
                <View className="flex-row items-center">
                   <Text style={styles.itemSubtitle} numberOfLines={1}>{activity.subtitle}</Text>
                   {/* We could add macro dots here in the future */}
                </View>
            )}
          </View>

          {/* Value on the right */}
          <View style={styles.itemRight}>
             <View style={[
               styles.valueTag, 
               { backgroundColor: isExercise ? '#FFF4ED' : activity.type === 'water' ? '#F0F9FF' : '#F0FDF4' }
             ]}>
                <Text style={[
                  styles.valueText, 
                  { color: isExercise ? '#EA580C' : activity.type === 'water' ? '#0369A1' : '#166534' }
                ]}>
                    {isExercise ? `-${activity.calories}` : 
                     activity.type === 'water' ? `+${activity.amount}` : `+${activity.calories}`}
                </Text>
             </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
        entering={FadeInDown.springify()}
        style={styles.emptyContainer}
    >
      <View style={styles.iconContainer}>
        <Activity01Icon size={40} color={Colors.light.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your feed is quiet</Text>
      <Text style={styles.emptySubtitle}>
        Track your progress by logging your first meal or workout for today.
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={() => router.push("/(main)/plus")}
      >
        <Add01Icon size={20} color="white" />
        <Text style={styles.addButtonText}>Start Tracking</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Recent Activity</Text>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Today's Timeline</Text>
        </View>
        {activities.length > 0 && (
          <TouchableOpacity className="bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {activities.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.activityList}>
          {activities.map((item, index) => renderActivityItem(item, index))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 36,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#F0FDF4',
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  itemIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  iconAccent: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    flex: 1,
    marginRight: 8,
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    marginLeft: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: '600',
  },
  itemRight: {
    marginLeft: 10,
  },
  itemTime: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  valueTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
