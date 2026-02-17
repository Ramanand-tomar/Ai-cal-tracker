import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ArrowLeft01Icon, Tick02Icon } from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
                <Text style={styles.headerTitle}>Update Weight</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Animated.View 
                    entering={FadeInDown.duration(600)}
                    style={styles.infoBox}
                >
                    <Text style={styles.label}>Selected Weight</Text>
                    <View style={styles.valueRow}>
                        <Text style={styles.valueText}>{selectedWeight}</Text>
                        <Text style={styles.unitText}>kg</Text>
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
                        indicatorColor={Colors.light.primary}
                        longStepColor="#475569"
                        shortStepColor="#CBD5E1"
                        valueTextStyle={styles.rulerValueText}
                        unitTextStyle={styles.rulerUnitText}
                    />
                </View>

                <Text style={styles.hint}>
                    Swipe the ruler to adjust your weight. We'll track this over time to show your progress!
                </Text>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={[styles.updateButton, saving && styles.disabledButton]}
                    onPress={handleUpdateWeight}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
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
        paddingTop: 60,
        marginBottom: 20,
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
        color: '#64748B',
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
        color: Colors.light.primary,
    },
    unitText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#64748B',
    },
    pickerContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rulerValueText: {
        fontSize: 0, // Hide internal value text, we use our own
    },
    rulerUnitText: {
        fontSize: 0, // Hide internal unit text
    },
    hint: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 48,
        lineHeight: 20,
        marginTop: 40,
    },
    bottomContainer: {
        padding: 24,
        paddingBottom: 40,
    },
    updateButton: {
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
    updateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
