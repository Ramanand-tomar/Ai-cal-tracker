import AppLoader from "@/components/ui/AppLoader";
import BackButton from "@/components/ui/BackButton";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";
import {
    Cancel01Icon,
    PlusSignIcon,
    ThumbsUpIcon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    upvotes: string[]; // Array of user IDs
    userId: string;
    userName: string;
    createdAt: any;
}

export default function FeatureRequestsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [features, setFeatures] = useState<FeatureRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // New Feature Form State
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");

    useEffect(() => {
        const q = query(
            collection(db, "featureRequests"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedFeatures = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FeatureRequest[];
            
            // Sort by upvote count manually if needed or just keep by date
            setFeatures(fetchedFeatures.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching feature requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpvote = async (featureId: string, upvotes: string[]) => {
        if (!user?.id) return;

        const hasUpvoted = upvotes?.includes(user.id);
        const featureRef = doc(db, "featureRequests", featureId);

        try {
            await updateDoc(featureRef, {
                upvotes: hasUpvoted ? arrayRemove(user.id) : arrayUnion(user.id)
            });
        } catch (error) {
            console.error("Error updating upvote:", error);
        }
    };

    const handleSubmitFeature = async () => {
        if (!newTitle.trim() || !newDescription.trim()) {
            Alert.alert("Required", "Please fill in both title and description.");
            return;
        }

        if (!user?.id) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "featureRequests"), {
                title: newTitle.trim(),
                description: newDescription.trim(),
                userId: user.id,
                userName: user.fullName || user.username || "Anonymous",
                upvotes: [user.id], // Auto upvote by creator
                createdAt: serverTimestamp()
            });

            setIsModalVisible(false);
            setNewTitle("");
            setNewDescription("");
            Alert.alert("Success", "Feature request submitted! Community can now upvote it.");
        } catch (error) {
            console.error("Error submitting feature:", error);
            Alert.alert("Error", "Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderFeatureItem = ({ item, index }: { item: FeatureRequest, index: number }) => {
        const upvoteCount = item.upvotes?.length || 0;
        const hasUpvoted = item.upvotes?.includes(user?.id || "");

        return (
            <Animated.View 
                entering={FadeInDown.duration(400).delay(index * 100)}
                style={[styles.featureCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}
            >
                <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                    <Text style={[styles.featureAuthor, { color: colors.textMuted }]}>Requested by {item.userName}</Text>
                </View>
                
                <TouchableOpacity 
                    onPress={() => handleUpvote(item.id, item.upvotes)}
                    style={[
                        styles.upvoteButton, 
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' },
                        hasUpvoted && { backgroundColor: colors.primary }
                    ]}
                    activeOpacity={0.7}
                >
                    <ThumbsUpIcon size={20} color={hasUpvoted ? "white" : colors.textSecondary} variant={hasUpvoted ? "stroke" : "stroke"} />
                    <Text style={[styles.upvoteCount, { color: colors.text }, hasUpvoted && { color: 'white' }]}>{upvoteCount}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <BackButton />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Feature Requests</Text>
                <TouchableOpacity 
                    onPress={() => setIsModalVisible(true)} 
                    style={[styles.addButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}
                >
                    <PlusSignIcon size={24} color={isDark ? '#10B981' : colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <AppLoader label="Loading features..." />
                </View>
            ) : features.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No requests yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Be the first to suggest a new feature!</Text>
                </View>
            ) : (
                <FlatList 
                    data={features}
                    renderItem={renderFeatureItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Submit Feature Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={[styles.modalView, { backgroundColor: isDark ? colors.surface : 'white' }]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Suggest Feature</Text>
                            <TouchableOpacity 
                                onPress={() => setIsModalVisible(false)} 
                                style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                            >
                                <Cancel01Icon size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>What's the feature?</Text>
                                <TextInput 
                                    style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', color: colors.text }]}
                                    placeholder="e.g. Barcode Scanner"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Tell us more</Text>
                                <TextInput 
                                    style={[
                                        styles.input, 
                                        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', color: colors.text },
                                        styles.textArea
                                    ]}
                                    placeholder="Briefly describe how this feature would help you..."
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.submitButton, 
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                                submitting && styles.disabledButton
                            ]}
                            onPress={handleSubmitFeature}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <AppLoader size={24} />
                            ) : (
                                <>
                                    <Tick02Icon size={20} color="white" variant="stroke" />
                                    <Text style={styles.submitButtonText}>Submit Request</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 24,
        paddingTop: 10,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    featureCard: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    featureContent: {
        flex: 1,
        paddingRight: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    featureAuthor: {
        fontSize: 12,
        fontWeight: '600',
    },
    upvoteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 54,
        alignSelf: 'center',
    },
    upvoteCount: {
        fontSize: 14,
        fontWeight: '800',
        marginTop: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalView: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        gap: 24,
        marginBottom: 32,
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
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    textArea: {
        height: 120,
    },
    submitButton: {
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
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
