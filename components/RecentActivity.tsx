import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
    Activity01Icon,
    Add01Icon,
    Dumbbell01Icon,
    FireIcon,
    RestaurantIcon,
    RunningIcon,
    Yoga01Icon
} from "hugeicons-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Activity {
  id: string;
  type: 'meal' | 'exercise';
  exerciseType?: string; // Run, Weight Lifting, Manual, etc.
  title: string;
  subtitle: string;
  value: string; // Calories string "500 kcal"
  calories?: number;
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
    if (type === 'meal') return RestaurantIcon;
    if (exerciseType === 'Run') return RunningIcon;
    if (exerciseType === 'Weight Lifting') return Dumbbell01Icon;
    if (exerciseType === 'Yoga') return Yoga01Icon;
    return Activity01Icon;
  };

  const getIconColor = (type: string) => {
    if (type === 'meal') return Colors.light.primary;
    return '#3B82F6'; // Blue for exercises
  };

  const getIconBg = (type: string) => {
    if (type === 'meal') return '#EAF6ED';
    return '#EFF6FF'; // Light blue for exercises
  };

  const renderActivityItem = (activity: Activity) => {
    const isExercise = activity.type === 'exercise';
    const Icon = getIcon(activity.type, activity.exerciseType);
    const iconBg = getIconBg(activity.type);
    const iconColor = getIconColor(activity.type);

    return (
      <TouchableOpacity 
        key={activity.id}
        style={styles.activityItem}
        activeOpacity={0.7}
      >
        {/* Left Icon */}
        <View style={[styles.itemIconContainer, { backgroundColor: iconBg }]}>
          <Icon size={24} color={iconColor} variant="solid" />
        </View>

        {/* Middle Content */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{activity.title}</Text>
          
          {isExercise ? (
            <View>
              {/* Calories Row */}
              <View style={styles.caloriesRow}>
                <FireIcon size={14} color="#F97316" variant="solid" />
                <Text style={styles.caloriesText}>
                  {activity.calories || 0} kcal
                </Text>
              </View>
              
              {/* Details Row */}
              {(activity.intensity || activity.duration) && (
                <Text style={styles.itemSubtitle}>
                  {activity.intensity ? `${activity.intensity} • ` : ''}
                  {activity.duration ? `${activity.duration} min` : ''}
                </Text>
              )}
            </View>
          ) : (
             <Text style={styles.itemSubtitle}>{activity.subtitle}</Text>
          )}
        </View>

        {/* Right Content */}
        <View style={styles.itemRight}>
           <Text style={styles.itemTime}>{activity.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconContainer}>
        <Activity01Icon size={40} color={Colors.light.primary} />
      </View>
      <Text style={styles.emptyTitle}>No activity yet</Text>
      <Text style={styles.emptySubtitle}>
        Log your first meal or exercise to start tracking your daily progress.
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={() => router.push("/(main)/plus")}
      >
        <Add01Icon size={20} color="white" />
        <Text style={styles.addButtonText}>Add Activity</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        {activities.length > 0 && (
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {activities.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.activityList}>
          {activities.map(renderActivityItem)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  viewAll: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: '500',
  },
  itemRight: {
    alignItems: "flex-end",
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  itemTime: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: '500',
  },
});
