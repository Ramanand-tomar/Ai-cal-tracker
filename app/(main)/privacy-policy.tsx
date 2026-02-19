import { useRouter } from "expo-router";
import { ArrowLeft01Icon } from "hugeicons-react-native";
import React from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft01Icon size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)}>
                    <Text style={styles.lastUpdated}>Last Updated: February 20, 2026</Text>

                    <Text style={styles.sectionTitle}>1. Data Collection</Text>
                    <Text style={styles.text}>
                        We collect minimal personal data to provide our services. This includes your name, email address, and profile picture managed via Clerk. We also store the health metrics you voluntarily provide, such as daily calories, macros, and exercise logs.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Use of Data</Text>
                    <Text style={styles.text}>
                        Your data is used solely to calculate your daily goals, provide AI-powered health insights, and allow you to track your progress over time. We do not sell your personal data to third parties.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Feature Requests</Text>
                    <Text style={styles.text}>
                        When you submit a feature request, your username is displayed alongside the request to allow the community to upvote it. This is the only public-facing aspect of your profile.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Security</Text>
                    <Text style={styles.text}>
                        We use industry-standard security practices. Authentication is handled by Clerk, and your data is stored securely in Firebase Firestore.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
                    <Text style={styles.text}>
                        We use Google's Generative AI to provide insights. Any data sent to this service is anonymized and used only for the purpose of generating your health analysis.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Your Rights</Text>
                    <Text style={styles.text}>
                        You have the right to access, update, or delete your data at any time. Since accounts are tied to Clerk, you can manage your profile directly through their secure portal.
                    </Text>

                    <View style={styles.footerSpacer} />
                </Animated.View>
            </ScrollView>
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
        backgroundColor: 'white',
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
        padding: 24,
        paddingTop: 10,
    },
    lastUpdated: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 24,
        fontWeight: '500',
    },
    footerSpacer: {
        height: 60,
    },
});
