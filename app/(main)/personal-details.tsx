import AppLoader from "@/components/ui/AppLoader";
import BackButton from "@/components/ui/BackButton";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
    Activity01Icon,
    DropletIcon,
    FireIcon,
    MenuRestaurantIcon,
    Tick02Icon,
    ZapIcon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
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

export default function PersonalDetailsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [dailyCalories, setDailyCalories] = useState("2000");
    const [protein, setProtein] = useState("150");
    const [carbs, setCarbs] = useState("250");
    const [fats, setFats] = useState("70");
    const [waterIntake, setWaterIntake] = useState("2.5");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                const userRef = doc(db, "users", user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setDailyCalories(data.dailyCalories?.toString() || "2000");
                    setProtein(data.protein?.toFixed(1) || "150.0");
                    setCarbs(data.carbs?.toFixed(1) || "250.0");
                    setFats(data.fats?.toFixed(1) || "70.0");
                    setWaterIntake(data.waterIntake?.toFixed(1) || "2.5");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        
        setSaving(true);
        try {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                dailyCalories: parseInt(dailyCalories),
                protein: parseFloat(protein),
                carbs: parseFloat(carbs),
                fats: parseFloat(fats),
                waterIntake: parseFloat(waterIntake),
                updatedAt: serverTimestamp()
            });

            Alert.alert("Success", "Your goals have been updated successfully!");
            router.back();
        } catch (error) {
            console.error("Error updating goals:", error);
            Alert.alert("Error", "Failed to update goals. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <AppLoader label="Loading your goals..." />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <BackButton />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                            Set your daily nutrition and hydration goals. These will be used to track your progress and provide personalized AI insights.
                        </Text>
                    </Animated.View>

                    <View style={styles.form}>
                        {/* Daily Calories */}
                        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={[styles.inputCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED' }]}>
                                <Activity01Icon size={24} color="#F97316" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Daily Calorie Goal</Text>
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    value={dailyCalories}
                                    onChangeText={setDailyCalories}
                                    keyboardType="decimal-pad"
                                    placeholder="2000"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.unitText, { color: colors.textSecondary }]}>kcal</Text>
                        </Animated.View>

                        {/* Protein */}
                        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={[styles.inputCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
                                <ZapIcon size={24} color="#3B82F6" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Protein Goal</Text>
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    value={protein}
                                    onChangeText={setProtein}
                                    keyboardType="decimal-pad"
                                    placeholder="150"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.unitText, { color: colors.textSecondary }]}>g</Text>
                        </Animated.View>

                        {/* Carbs */}
                        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={[styles.inputCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
                                <MenuRestaurantIcon size={24} color="#10B981" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Carbs Goal</Text>
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    value={carbs}
                                    onChangeText={setCarbs}
                                    keyboardType="decimal-pad"
                                    placeholder="250"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.unitText, { color: colors.textSecondary }]}>g</Text>
                        </Animated.View>

                        {/* Fat */}
                        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={[styles.inputCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                <FireIcon size={24} color="#EF4444" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Fat Goal</Text>
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    value={fats}
                                    onChangeText={setFats}
                                    keyboardType="decimal-pad"
                                    placeholder="70"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.unitText, { color: colors.textSecondary }]}>g</Text>
                        </Animated.View>

                        {/* Water Intake */}
                        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={[styles.inputCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF' }]}>
                                <DropletIcon size={24} color="#8B5CF6" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Water Intake Goal</Text>
                                <TextInput 
                                    style={[styles.input, { color: colors.text }]}
                                    value={waterIntake}
                                    onChangeText={setWaterIntake}
                                    keyboardType="decimal-pad"
                                    placeholder="2.5"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <Text style={[styles.unitText, { color: colors.textSecondary }]}>L</Text>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        { backgroundColor: colors.primary, shadowColor: colors.primary },
                        saving && styles.disabledButton
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <AppLoader size={24} />
                    ) : (
                        <>
                            <Tick02Icon size={20} color="white" variant="stroke" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionDescription: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 32,
        fontWeight: '500',
    },
    form: {
        gap: 16,
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputWrapper: {
        flex: 1,
        marginLeft: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    input: {
        fontSize: 18,
        fontWeight: '700',
        padding: 0,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
    },
    saveButton: {
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
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
