import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
    Activity01Icon,
    ArrowLeft01Icon,
    DropletIcon,
    FireIcon,
    MenuRestaurantIcon,
    Tick02Icon,
    ZapIcon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function PersonalDetailsScreen() {
    const { user } = useUser();
    const router = useRouter();
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
                    setProtein(data.protein?.toString() || "150");
                    setCarbs(data.carbs?.toString() || "250");
                    setFats(data.fats?.toString() || "70");
                    setWaterIntake(data.waterIntake?.toString() || "2.5");
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
                protein: parseInt(protein),
                carbs: parseInt(carbs),
                fats: parseInt(fats),
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft01Icon size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Details</Text>
                <View style={{ width: 40 }} />
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
                        <Text style={styles.sectionDescription}>
                            Set your daily nutrition and hydration goals. These will be used to track your progress and provide personalized AI insights.
                        </Text>
                    </Animated.View>

                    <View style={styles.form}>
                        {/* Daily Calories */}
                        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.inputCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
                                <Activity01Icon size={24} color="#F97316" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Daily Calorie Goal</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={dailyCalories}
                                    onChangeText={setDailyCalories}
                                    keyboardType="numeric"
                                    placeholder="2000"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <Text style={styles.unitText}>kcal</Text>
                        </Animated.View>

                        {/* Protein */}
                        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.inputCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                                <ZapIcon size={24} color="#3B82F6" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Protein Goal</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={protein}
                                    onChangeText={setProtein}
                                    keyboardType="numeric"
                                    placeholder="150"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <Text style={styles.unitText}>g</Text>
                        </Animated.View>

                        {/* Carbs */}
                        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.inputCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                                <MenuRestaurantIcon size={24} color="#10B981" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Carbs Goal</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={carbs}
                                    onChangeText={setCarbs}
                                    keyboardType="numeric"
                                    placeholder="250"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <Text style={styles.unitText}>g</Text>
                        </Animated.View>

                        {/* Fat */}
                        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.inputCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                                <FireIcon size={24} color="#EF4444" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Fat Goal</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={fats}
                                    onChangeText={setFats}
                                    keyboardType="numeric"
                                    placeholder="70"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <Text style={styles.unitText}>g</Text>
                        </Animated.View>

                        {/* Water Intake */}
                        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.inputCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
                                <DropletIcon size={24} color="#8B5CF6" />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Water Intake Goal</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={waterIntake}
                                    onChangeText={setWaterIntake}
                                    keyboardType="decimal-pad"
                                    placeholder="2.5"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <Text style={styles.unitText}>L</Text>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
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
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionDescription: {
        fontSize: 15,
        color: '#64748B',
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
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
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
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    input: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        padding: 0,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginLeft: 8,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        flexDirection: 'row',
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: Colors.light.primary,
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
