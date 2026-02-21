import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditionsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <BackButton />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600)}>
                    <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last Updated: February 20, 2026</Text>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                        By accessing and using the Calorify AI app, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>2. App Description</Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                        Calorify AI is a health and fitness tool designed to help users track their nutrition, water intake, and exercise. It uses AI technology to provide insights and analysis based on user-provided data.
                    </Text>
[... many lines ...]
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Limitation of Liability</Text>
                    <Text style={[styles.text, { color: colors.textSecondary }]}>
                        Calorify AI and its developers shall not be held liable for any health issues, data loss, or other damages resulting from the use of the app.
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
        paddingTop: 10,
    },
    lastUpdated: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
    },
    footerSpacer: {
        height: 60,
    },
});
