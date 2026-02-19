import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
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
    ArrowLeft01Icon,
    Cancel01Icon,
    PlusSignIcon,
    ThumbsUpIcon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
                style={styles.featureCard}
            >
                <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureDescription}>{item.description}</Text>
                    <Text style={styles.featureAuthor}>Requested by {item.userName}</Text>
                </View>
                
                <TouchableOpacity 
                    onPress={() => handleUpvote(item.id, item.upvotes)}
                    style={[styles.upvoteButton, hasUpvoted && styles.upvotedButton]}
                    activeOpacity={0.7}
                >
                    <ThumbsUpIcon size={20} color={hasUpvoted ? "white" : "#64748B"} variant={hasUpvoted ? "stroke" : "stroke"} />
                    <Text style={[styles.upvoteCount, hasUpvoted && styles.upvotedCount]}>{upvoteCount}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft01Icon size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feature Requests</Text>
                <TouchableOpacity 
                    onPress={() => setIsModalVisible(true)} 
                    style={styles.addButton}
                >
                    <PlusSignIcon size={24} color={Colors.light.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            ) : features.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyTitle}>No requests yet</Text>
                    <Text style={styles.emptySubtitle}>Be the first to suggest a new feature!</Text>
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
                        style={styles.modalView}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Suggest Feature</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                                <Cancel01Icon size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>What's the feature?</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="e.g. Barcode Scanner"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tell us more</Text>
                                <TextInput 
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Briefly describe how this feature would help you..."
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitButton, submitting && styles.disabledButton]}
                            onPress={handleSubmitFeature}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0FDF4',
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
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
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
        color: '#0F172A',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 12,
    },
    featureAuthor: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    upvoteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 54,
        alignSelf: 'center',
    },
    upvotedButton: {
        backgroundColor: Colors.light.primary,
    },
    upvoteCount: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 4,
    },
    upvotedCount: {
        color: 'white',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: 'white',
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
        color: '#0F172A',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
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
        color: '#64748B',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    textArea: {
        height: 120,
    },
    submitButton: {
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
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
});
