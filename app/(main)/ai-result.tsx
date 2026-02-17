import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    AlertCircleIcon,
    ArrowLeft01Icon,
    Edit01Icon,
    FireIcon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

export default function AIResultScreen() {
    const { foodData, imageUri } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    // Parse the AI result
    const result = foodData ? JSON.parse(foodData as string) : null;

    // Editable state (initialized with AI results)
    const [foodName, setFoodName] = useState(result?.food_name || "Unknown Food");
    const [calories, setCalories] = useState(result?.calories?.toString() || "0");
    const [protein, setProtein] = useState(result?.protein?.toString() || "0");
    const [carbs, setCarbs] = useState(result?.carbs?.toString() || "0");
    const [fat, setFat] = useState(result?.fat?.toString() || "0");

    const handleLogFood = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const today = new Date().toLocaleDateString('en-CA');
            
            await addDoc(collection(db, "dailyLogs"), {
                userId: user.id,
                type: 'meal',
                title: foodName,
                calories: parseFloat(calories),
                protein: parseFloat(protein),
                carbs: parseFloat(carbs),
                fat: parseFloat(fat),
                serving_amount: "1 unit (AI detected)",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: serverTimestamp(),
                date: today,
                imageUri: imageUri || null,
                isAiGenerated: true
            });

            Alert.alert("Success", "Food logged successfully!");
            router.replace("/");
        } catch (error) {
            console.error("Error logging AI food:", error);
            Alert.alert("Error", "Failed to log food.");
        } finally {
            setLoading(false);
        }
    };

    if (!result) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft01Icon size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Review Analysis</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Image Thumbnail */}
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri as string }} style={styles.image} />
                        <View style={styles.confidenceBadge}>
                            <Text style={styles.confidenceText}>
                                {Math.round((result.confidence_score || 0.85) * 100)}% Match
                            </Text>
                        </View>
                    </View>

                    {/* Food Name Card */}
                    <View style={styles.inputCard}>
                        <View style={styles.inputHeader}>
                            <Text style={styles.inputLabel}>Food Name</Text>
                            <Edit01Icon size={16} color="#94A3B8" />
                        </View>
                        <TextInput
                            style={styles.nameInput}
                            value={foodName}
                            onChangeText={setFoodName}
                            placeholder="Food name"
                        />
                    </View>

                    {/* Macros Grid */}
                    <View style={styles.statsContainer}>
                        <View style={styles.mainStatsRow}>
                            <View style={[styles.statBox, { backgroundColor: '#FFF7ED' }]}>
                                <FireIcon size={24} color="#EA580C" variant="stroke" />
                                <View style={styles.statInfo}>
                                    <TextInput
                                        style={styles.statValue}
                                        value={calories}
                                        onChangeText={setCalories}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.statLabel}>Calories</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.macrosRow}>
                            <MacroItem 
                                label="Protein" 
                                value={protein} 
                                color="#3B82F6" 
                                bgColor="#EFF6FF" 
                                onChange={setProtein}
                            />
                            <MacroItem 
                                label="Carbs" 
                                value={carbs} 
                                color="#10B981" 
                                bgColor="#ECFDF5" 
                                onChange={setCarbs}
                            />
                            <MacroItem 
                                label="Fats" 
                                value={fat} 
                                color="#F59E0B" 
                                bgColor="#FFFBEB" 
                                onChange={setFat}
                            />
                        </View>
                    </View>

                    <View style={styles.aiNote}>
                        <AlertCircleIcon size={16} color="#64748B" />
                        <Text style={styles.aiNoteText}>
                            Gemini AI estimated these values based on the image. You can tweak them if needed.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.logButton, loading && styles.disabledButton]} 
                    onPress={handleLogFood}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Tick02Icon size={22} color="white" variant="stroke" />
                            <Text style={styles.logButtonText}>Add to Daily Log</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const MacroItem = ({ label, value, color, bgColor, onChange }: any) => (
    <View style={[styles.macroBox, { backgroundColor: bgColor }]}>
        <TextInput
            style={[styles.macroValue, { color }]}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
        />
        <Text style={styles.macroLabel}>{label} (g)</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    content: {
        paddingHorizontal: 24,
    },
    imagePreviewContainer: {
        width: '100%',
        height: 240,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        backgroundColor: '#E2E8F0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    confidenceBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    confidenceText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    inputCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        padding: 0,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    mainStatsRow: {
        width: '100%',
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
    },
    statInfo: {
        marginLeft: 16,
        flex: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0F172A',
        padding: 0,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    macrosRow: {
        flexDirection: 'row',
        gap: 12,
    },
    macroBox: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 18,
        fontWeight: '800',
        padding: 0,
        textAlign: 'center',
    },
    macroLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 4,
    },
    aiNote: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 10,
    },
    aiNoteText: {
        flex: 1,
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
        padding: 24,
        paddingBottom: 40,
    },
    logButton: {
        backgroundColor: Colors.light.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    logButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: '#94A3B8',
    },
});
