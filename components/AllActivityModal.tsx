import { useTheme } from "@/context/ThemeContext";
import {
    Activity01Icon,
    Cancel01Icon,
    Dumbbell01Icon,
    FireIcon,
    MenuRestaurantIcon,
    Yoga01Icon
} from "hugeicons-react-native";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity } from "./RecentActivity";

interface AllActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  activities: Activity[];
}

export default function AllActivityModal({ isVisible, onClose, activities }: AllActivityModalProps) {
  const { colors, isDark } = useTheme();

  const getIcon = (type: string, exerciseType?: string) => {
    if (type === 'meal') return MenuRestaurantIcon;
    if (type === 'water') return Activity01Icon;
    if (exerciseType === 'Run') return Activity01Icon;
    if (exerciseType === 'Weight Lifting') return Dumbbell01Icon;
    if (exerciseType === 'Yoga') return Yoga01Icon;
    return Activity01Icon;
  };

  const getIconColor = (type: string) => {
    if (type === 'meal') return colors.primary;
    if (type === 'water') return '#0EA5E9';
    return '#3B82F6';
  };

  const getIconBg = (type: string) => {
    if (type === 'meal') return isDark ? 'rgba(41, 143, 80, 0.15)' : '#EAF6ED';
    if (type === 'water') return isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF';
    return isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF';
  };

  const renderActivityItem = (activity: Activity, index: number) => {
    const isExercise = activity.type === 'exercise';
    const IconComponent = getIcon(activity.type, activity.exerciseType) || Activity01Icon;
    const iconBg = getIconBg(activity.type);
    const iconColor = getIconColor(activity.type);

    return (
      <Animated.View 
        key={activity.id}
        entering={FadeInDown.delay(index * 50).springify()}
        style={[
          styles.activityItem,
          { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }
        ]}
      >
        <View style={[styles.itemIconContainer, { backgroundColor: iconBg }]}>
          <IconComponent size={22} color={iconColor} variant="stroke" />
        </View>

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{activity.title}</Text>
            <Text style={styles.itemTime}>{activity.time}</Text>
          </View>
          
          <View style={styles.itemDetails}>
            {isExercise ? (
              <View style={[styles.caloriesPill, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED' }]}>
                <FireIcon size={12} color="#F97316" variant="stroke" />
                <Text style={styles.caloriesText}>{activity.calories} kcal</Text>
              </View>
            ) : (
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{activity.subtitle}</Text>
            )}
            
            <View style={[
              styles.valueTag,
              { 
                backgroundColor: isExercise 
                  ? (isDark ? 'rgba(234, 88, 12, 0.15)' : '#FFF4ED') 
                  : activity.type === 'water' 
                    ? (isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF')
                    : (isDark ? 'rgba(41, 143, 80, 0.15)' : '#F0FDF4')
              }
            ]}>
              <Text style={[
                styles.valueText,
                { 
                  color: isExercise 
                    ? '#EA580C' 
                    : activity.type === 'water' 
                      ? (isDark ? '#38BDF8' : '#0369A1')
                      : (isDark ? colors.primary : '#166534')
                }
              ]}>
                {isExercise ? `-${activity.calories}` : 
                 activity.type === 'water' ? `+${activity.amount}` : `+${activity.calories}`}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <Animated.View 
            entering={FadeInUp.springify()} 
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Activity Timeline</Text>
              <Text style={styles.modalSubtitle}>All logs for today</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]}
            >
              <Cancel01Icon size={24} color={colors.textSecondary} variant="stroke" />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activities.length > 0 ? (
              activities.map((item, index) => renderActivityItem(item, index))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No activities recorded yet.</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
  valueTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

