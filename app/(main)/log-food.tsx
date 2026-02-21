import AppLoader from "@/components/ui/AppLoader";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Calendar01Icon,
    Clock01Icon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogFoodScreen() {
    const params = useLocalSearchParams();
    const foodId = params.foodId;
    const name = params.name || "Unknown Food";
    const initialCalories = params.calories;
    const protein = params.protein || "0";
    const carbs = params.carbs || "0";
    const fats = params.fats || "0";
    const unit = params.unit || "serving";
    
    const router = useRouter();
    const { user } = useUser();
    const { colors, isDark } = useTheme();

    const [quantity, setQuantity] = useState("1");
    const [servingSize, setServingSize] = useState(unit as string);
    const [mealType, setMealType] = useState("Breakfast");
    const [loading, setLoading] = useState(false);

    const calories = initialCalories ? Math.round(Number(initialCalories) * Number(quantity || 0)) : 0;

    const handleLogFood = async () => {
        setLoading(true);
        // Simulate logging
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", `${name} has been logged!`, [
                { text: "OK", onPress: () => router.replace("/(main)") }
            ]);
        }, 1000);
    };

    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <BackButton />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Log Food</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)}>
                    <View style={[styles.foodInfoCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                        <Text style={[styles.foodName, { color: colors.text }]}>{name}</Text>
                        <View style={styles.calorieRow}>
                            <Text style={[styles.calorieValue, { color: colors.primary }]}>{calories}</Text>
                            <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>Total Calories (kcal)</Text>
                        </View>

                        <View style={styles.macroGrid}>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.text }]}>{Math.round(Number(protein) * Number(quantity || 0))}g</Text>
                                <Text style={[styles.macroLab, { color: colors.textMuted }]}>Protein</Text>
                                <View style={[styles.macroBar, { backgroundColor: '#3B82F6' }]} />
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.text }]}>{Math.round(Number(carbs) * Number(quantity || 0))}g</Text>
                                <Text style={[styles.macroLab, { color: colors.textMuted }]}>Carbs</Text>
                                <View style={[styles.macroBar, { backgroundColor: '#10B981' }]} />
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: colors.text }]}>{Math.round(Number(fats) * Number(quantity || 0))}g</Text>
                                <Text style={[styles.macroLab, { color: colors.textMuted }]}>Fats</Text>
                                <View style={[styles.macroBar, { backgroundColor: '#F59E0B' }]} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>How much did you have?</Text>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
                                <TextInput 
                                    style={[styles.input, { backgroundColor: isDark ? colors.surface : '#F1F5F9', borderColor: colors.border, color: colors.text }]}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 2 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Serving Size</Text>
                                <View style={[styles.input, styles.readOnlyInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderColor: colors.border }]}>
                                    <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{servingSize}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Meal Type</Text>
                        <View style={styles.mealTypeGrid}>
                            {mealTypes.map((type) => (
                                <TouchableOpacity 
                                    key={type}
                                    onPress={() => setMealType(type)}
                                    style={[
                                        styles.mealTypeButton,
                                        { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border },
                                        mealType === type && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4', borderColor: colors.primary }
                                    ]}
                                >
                                    <Text style={[
                                        styles.mealTypeText,
                                        { color: colors.textSecondary },
                                        mealType === type && { color: isDark ? '#10B981' : colors.primary, fontWeight: '700' }
                                    ]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.dateTimeRow}>
                            <View style={[styles.dateTimeItem, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}>
                                <Calendar01Icon size={20} color={colors.textSecondary} />
                                <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>Today</Text>
                            </View>
                            <View style={[styles.dateTimeItem, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}>
                                <Clock01Icon size={20} color={colors.textSecondary} />
                                <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>12:30 PM</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footerSpacer} />
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity 
                    style={[styles.logButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                    onPress={handleLogFood}
                    disabled={loading}
                >
                    {loading ? (
                        <AppLoader size={30} />
                    ) : (
                        <>
                            <Tick02Icon size={20} color="white" variant="stroke" />
                            <Text style={styles.logButtonText}>Log this meal</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 24,
    },
    foodInfoCard: {
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    foodName: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center',
    },
    calorieRow: {
        alignItems: 'center',
        marginBottom: 24,
    },
    calorieValue: {
        fontSize: 48,
        fontWeight: '900',
    },
    calorieLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: -4,
    },
    macroGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroVal: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    macroLab: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    macroBar: {
        width: 32,
        height: 4,
        borderRadius: 2,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    readOnlyInput: {
        justifyContent: 'center',
        borderStyle: 'dashed',
    },
    mealTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    mealTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        minWidth: '47%',
        alignItems: 'center',
    },
    mealTypeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    dateTimeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerSpacer: {
        height: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
    },
    logButton: {
        flexDirection: 'row',
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
