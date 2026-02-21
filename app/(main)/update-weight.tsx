import AppLoader from "@/components/ui/AppLoader";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ArrowLeft01Icon, Tick02Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RulerPicker } from "react-native-ruler-picker";

export default function UpdateWeightScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialWeight, setInitialWeight] = useState(70);
    const [selectedWeight, setSelectedWeight] = useState("70");

    useEffect(() => {
        const fetchCurrentWeight = async () => {
            if (!user?.id) return;
            try {
                const userRef = doc(db, "users", user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const weightVal = parseFloat(userSnap.data().weight || "70");
                    setInitialWeight(weightVal);
                    setSelectedWeight(weightVal.toString());
                }
            } catch (error) {
                console.error("Error fetching weight:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentWeight();
    }, [user?.id]);

    const handleUpdateWeight = async () => {
        if (!user?.id) return;
        
        setSaving(true);
        try {
            const dateStr = format(new Date(), "yyyy-MM-dd");
            const weightNum = parseFloat(selectedWeight);

            // 1. Update User Profile
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                weight: weightNum.toString(),
                updatedAt: serverTimestamp()
            });

            // 2. Add to weight logs for progress tracking
            const logsRef = collection(db, "weightLogs");
            await addDoc(logsRef, {
                userId: user.id,
                weight: weightNum,
                date: dateStr,
                timestamp: serverTimestamp()
            });

            Alert.alert("Success", "Weight updated successfully!");
            router.back();
        } catch (error) {
            console.error("Error updating weight:", error);
            Alert.alert("Error", "Failed to update weight. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <AppLoader size={60} label="Loading weight..." />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={[styles.backButton, { backgroundColor: isDark ? colors.surface : '#F8FAFC' }]}
                >
                    <ArrowLeft01Icon size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Update Weight</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Animated.View 
                    entering={FadeInDown.duration(600)}
                    style={styles.infoBox}
                >
                    <Text style={[styles.label, { color: colors.textMuted }]}>Selected Weight</Text>
                    <View style={styles.valueRow}>
                        <Text style={[styles.valueText, { color: colors.primary }]}>{selectedWeight}</Text>
                        <Text style={[styles.unitText, { color: colors.textMuted }]}>kg</Text>
                    </View>
                </Animated.View>

                <View style={styles.pickerContainer}>
                    <RulerPicker
                        min={30}
                        max={300}
                        step={1}
                        fractionDigits={1}
                        initialValue={initialWeight}
                        onValueChange={(val) => setSelectedWeight(val)}
                        unit="kg"
                        width={300}
                        height={120}
                        indicatorColor={colors.primary}
                        longStepColor={isDark ? colors.textSecondary : "#475569"}
                        shortStepColor={isDark ? 'rgba(255,255,255,0.1)' : "#CBD5E1"}
                        valueTextStyle={styles.rulerValueText}
                        unitTextStyle={styles.rulerUnitText}
                    />
                </View>

                <Text style={[styles.hint, { color: colors.textMuted }]}>
                    Swipe the ruler to adjust your weight. We'll track this over time to show your progress!
                </Text>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={[
                        styles.updateButton, 
                        { backgroundColor: colors.primary, shadowColor: colors.primary },
                        saving && styles.disabledButton
                    ]}
                    onPress={handleUpdateWeight}
                    disabled={saving}
                >
                    {saving ? (
                        <AppLoader size={30} />
                    ) : (
                        <>
                            <Tick02Icon size={20} color="white" variant="stroke" />
                            <Text style={styles.updateButtonText}>Update Weight</Text>
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
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    infoBox: {
        alignItems: 'center',
        marginBottom: 60,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    valueText: {
        fontSize: 64,
        fontWeight: '900',
    },
    unitText: {
        fontSize: 24,
        fontWeight: '700',
    },
    pickerContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rulerValueText: {
        fontSize: 1, // Must be positive on Android
        color: 'transparent',
    },
    rulerUnitText: {
        fontSize: 1, // Must be positive on Android
        color: 'transparent',
    },
    hint: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 48,
        lineHeight: 20,
        marginTop: 40,
    },
    bottomContainer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    updateButton: {
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
    updateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
