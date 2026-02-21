import { useTheme } from "@/context/ThemeContext";
import { addDays, format, isSameDay, startOfToday, startOfWeek, subDays } from "date-fns";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const PADDING = 24;
const ITEM_WIDTH = (width - (PADDING * 2)) / 7;

interface WeeklyCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function WeeklyCalendar({ onDateSelect, selectedDate }: WeeklyCalendarProps) {
  const { colors, isDark } = useTheme();
  const today = startOfToday();
  
  // State for the start of the week being displayed (Monday as start)
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  
  // Generate the 7 days for the current displayed week
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    setDays(weekDays);
  }, [weekStart]);

  const goToPreviousWeek = () => {
    setWeekStart(prev => subDays(prev, 7));
  };

  const goToNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const renderDay = (item: Date) => {
    const isToday = isSameDay(item, today);
    const isSelected = isSameDay(item, selectedDate);

    return (
      <TouchableOpacity
        key={item.toISOString()}
        onPress={() => onDateSelect(item)}
        activeOpacity={0.7}
        style={{ width: ITEM_WIDTH }}
        className="items-center justify-center py-2"
      >
        <Text 
          style={{ color: isSelected ? colors.primary : colors.textMuted }}
          className="text-[10px] font-bold uppercase mb-2"
        >
          {format(item, "EEE")}
        </Text>
        
        <View 
          style={[
            styles.dayCircle,
            { 
              borderColor: isSelected ? colors.primary : 'transparent',
              backgroundColor: isSelected ? (isDark ? 'rgba(41, 143, 80, 0.2)' : colors.primaryLight) : 'transparent'
            }
          ]}
        >
          <Text 
            style={{ color: isSelected ? (isDark ? colors.text : colors.primaryDark) : colors.text }}
            className="text-base font-bold"
          >
            {format(item, "d")}
          </Text>
          
          {isToday && !isSelected && (
            <View style={{ backgroundColor: colors.primary }} className="absolute bottom-1.5 w-1 h-1 rounded-full" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="pt-1 pb-3">
      {/* Calendar Header */}
      <View className="flex-row items-center justify-between px-6 mb-2">
        <Text style={{ color: colors.text }} className="text-lg font-bold">
          {format(weekStart, "MMMM yyyy")}
        </Text>
        
        <View className="flex-row space-x-4">
          <TouchableOpacity 
            onPress={goToPreviousWeek}
            style={{ backgroundColor: isDark ? colors.surface : colors.border, borderColor: colors.border }}
            className="p-2 rounded-xl border"
          >
            <ArrowLeft01Icon size={20} color={colors.text} />
          </TouchableOpacity>
          <View className="w-2" />
          <TouchableOpacity 
            onPress={goToNextWeek}
            style={{ backgroundColor: isDark ? colors.surface : colors.border, borderColor: colors.border }}
            className="p-2 rounded-xl border"
          >
            <ArrowRight01Icon size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Grid */}
      <View className="flex-row px-6 justify-between">
        {days.map(renderDay)}
      </View>

      {/* Subtle separator */}
      <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', height: 1, marginHorizontal: 24, marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

