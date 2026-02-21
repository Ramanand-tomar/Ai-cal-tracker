import AppLoader from "@/components/ui/AppLoader";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/context/ThemeContext";
import {
    cancelAllNotifications,
    requestNotificationPermissions,
    scheduleReminders
} from "@/utils/notifications";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
    ArrowLeft01Icon,
    MoonIcon,
    Notification01Icon,
    Settings02Icon,
    Sun01Icon,
    Tick02Icon
} from "hugeicons-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type ThemeType = 'light' | 'dark' | 'system';

export default function PreferencesScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { colors, isDark, theme: currentTheme, setTheme: setAppTheme } = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Preference States
    const [themePreference, setThemePreference] = useState<ThemeType>('light');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!user?.id) return;
            try {
                const userRef = doc(db, "users", user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const savedTheme = (data.theme as ThemeType) || 'light';
                    setThemePreference(savedTheme);
                    setNotificationsEnabled(data.notificationsEnabled !== false);
                    setIsSubscribed(data.isSubscribed || false);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        
        setSaving(true);
        try {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                theme: themePreference,
                notificationsEnabled,
                updatedAt: serverTimestamp()
            });

            // Update app theme locally using context
            setAppTheme(themePreference);

            // Handle Notifications Scheduling
            if (notificationsEnabled) {
                const hasPermission = await requestNotificationPermissions();
                if (hasPermission) {
                    await scheduleReminders(isSubscribed);
                } else {
                    Alert.alert(
                        "Permission Required", 
                        "Please enable notification permissions in your system settings to receive reminders."
                    );
                }
            } else {
                await cancelAllNotifications();
            }

            Alert.alert("Success", "Preferences saved successfully!");
            router.back();
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save preferences. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <AppLoader label="Loading preferences..." />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? colors.surface : '#F8FAFC' }]}>
                    <ArrowLeft01Icon size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Preferences</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Theme Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Settings02Icon size={20} color={colors.textMuted} />
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>App Theme</Text>
                    </View>
                    
                    <View style={styles.themeContainer}>
                        <ThemeOption 
                            label="Light" 
                            isActive={themePreference === 'light'} 
                            onPress={() => setThemePreference('light')}
                            icon={<Sun01Icon size={24} color={themePreference === 'light' ? 'white' : (isDark ? colors.textMuted : "#64748B")} />}
                            colors={colors}
                            isDark={isDark}
                        />
                        <ThemeOption 
                            label="Dark" 
                            isActive={themePreference === 'dark'} 
                            onPress={() => setThemePreference('dark')}
                            icon={<MoonIcon size={24} color={themePreference === 'dark' ? 'white' : (isDark ? colors.textMuted : "#64748B")} />}
                            colors={colors}
                            isDark={isDark}
                        />
                        <ThemeOption 
                            label="System" 
                            isActive={themePreference === 'system'} 
                            onPress={() => setThemePreference('system')}
                            icon={<Settings02Icon size={24} color={themePreference === 'system' ? 'white' : (isDark ? colors.textMuted : "#64748B")} />}
                            colors={colors}
                            isDark={isDark}
                        />
                    </View>
                    <Text style={[styles.hintText, { color: colors.textMuted }]}>Select how you want the app to look.</Text>
                </Animated.View>

                {/* Notifications */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Notification01Icon size={20} color={colors.textMuted} />
                        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
                    </View>
                    
                    <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.toggleInfo}>
                            <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Notifications</Text>
                            <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>Receive daily reminders and insights.</Text>
                        </View>
                        <Switch 
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: isDark ? colors.background : "#E2E8F0", true: isDark ? "rgba(34, 197, 94, 0.4)" : "#DCFCE7" }}
                            thumbColor={notificationsEnabled ? colors.primary : (isDark ? colors.textMuted : "#94A3B8")}
                        />
                    </View>
                </Animated.View>
            </View>

            <View style={[styles.footer, { backgroundColor: isDark ? colors.surface : 'white', borderTopColor: colors.border }]}>
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
                            <Text style={styles.saveButtonText}>Save Preferences</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

interface ThemeOptionProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    icon: React.ReactNode;
    colors: any;
    isDark: boolean;
}

const ThemeOption = ({ label, isActive, onPress, icon, colors, isDark }: ThemeOptionProps) => (
    <TouchableOpacity 
        onPress={onPress}
        style={[
            styles.themeOption, 
            { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border },
            isActive && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4' }
        ]}
        activeOpacity={0.7}
    >
        <View style={[
            styles.themeIconWrapper, 
            { backgroundColor: isDark ? colors.background : '#F8FAFC' },
            isActive && { backgroundColor: colors.primary }
        ]}>
            {icon}
        </View>
        <Text style={[
            styles.themeLabel, 
            { color: colors.textMuted },
            isActive && { color: colors.primary }
        ]}>{label}</Text>
    </TouchableOpacity>
);

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
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    section: {
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    themeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    themeIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    themeLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    hintText: {
        fontSize: 13,
        marginTop: 12,
        fontWeight: '500',
    },
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    toggleInfo: {
        flex: 1,
        paddingRight: 16,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 13,
        fontWeight: '500',
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
