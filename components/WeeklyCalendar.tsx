import { addDays, format, isSameDay, startOfToday, startOfWeek, subDays } from "date-fns";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const PADDING = 24;
const ITEM_WIDTH = (width - (PADDING * 2)) / 7;

interface WeeklyCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function WeeklyCalendar({ onDateSelect, selectedDate }: WeeklyCalendarProps) {
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
        <Text className={`text-[10px] font-bold uppercase mb-2 ${
          isSelected ? "text-primary" : "text-gray-400"
        }`}>
          {format(item, "EEE")}
        </Text>
        
        <View 
          className={`w-11 h-11 rounded-2xl items-center justify-center border-2 ${
            isSelected ? "border-primary bg-primary-50" : "border-transparent"
          }`}
        >
          <Text className={`text-base font-bold ${
            isSelected ? "text-primary-900" : "text-gray-900"
          }`}>
            {format(item, "d")}
          </Text>
          
          {isToday && !isSelected && (
            <View className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="py-2 bg-white">
      {/* Calendar Header */}
      <View className="flex-row items-center justify-between px-6 mb-4">
        <Text className="text-lg font-bold text-gray-900">
          {format(weekStart, "MMMM yyyy")}
        </Text>
        
        <View className="flex-row space-x-4">
          <TouchableOpacity 
            onPress={goToPreviousWeek}
            className="p-2 rounded-xl bg-gray-50 border border-gray-100"
          >
            <ArrowLeft01Icon size={20} color="#374151" />
          </TouchableOpacity>
          <View className="w-2" />
          <TouchableOpacity 
            onPress={goToNextWeek}
            className="p-2 rounded-xl bg-gray-50 border border-gray-100"
          >
            <ArrowRight01Icon size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Grid */}
      <View className="flex-row px-6 justify-between">
        {days.map(renderDay)}
      </View>
    </View>
  );
}
