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

export default function TermsConditionsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft01Icon size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)}>
                    <Text style={styles.lastUpdated}>Last Updated: February 20, 2026</Text>

                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.text}>
                        By accessing and using the AI-Cal-Tracker app, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
                    </Text>

                    <Text style={styles.sectionTitle}>2. App Description</Text>
                    <Text style={styles.text}>
                        AI-Cal-Tracker is a health and fitness tool designed to help users track their nutrition, water intake, and exercise. It uses AI technology to provide insights and analysis based on user-provided data.
                    </Text>

                    <Text style={styles.sectionTitle}>3. User Accounts</Text>
                    <Text style={styles.text}>
                        User accounts are managed through Clerk. You are responsible for maintaining the confidentiality of your account information. We reserve the right to terminate accounts that violate our community guidelines.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Accuracy</Text>
                    <Text style={styles.text}>
                        While we strive for accuracy in our AI analysis and calorie tracking, the data provided should be used for informational purposes only. Always consult with a healthcare professional before making significant changes to your diet or exercise routine.
                    </Text>

                    <Text style={styles.sectionTitle}>5. User Content</Text>
                    <Text style={styles.text}>
                        Users may contribute to the app via Feature Requests. You retain ownership of your suggestions, but by submitting them, you grant us a non-exclusive license to implement and use these ideas within the app.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                    <Text style={styles.text}>
                        AI-Cal-Tracker and its developers shall not be held liable for any health issues, data loss, or other damages resulting from the use of the app.
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
