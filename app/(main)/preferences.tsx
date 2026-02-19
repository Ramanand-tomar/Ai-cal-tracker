import { db } from "@/config/firebaseConfig";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
    ArrowLeft01Icon,
    Sun01Icon,
    MoonIcon,
    Notification01Icon,
    Settings02Icon,
    Tick02Icon
} from "hugeicons-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type ThemeType = 'light' | 'dark' | 'system';

export default function PreferencesScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { setColorScheme } = useColorScheme();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Preference States
    const [theme, setTheme] = useState<ThemeType>('light');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!user?.id) return;
            try {
                const userRef = doc(db, "users", user.id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const savedTheme = (data.theme as ThemeType) || 'light';
                    setTheme(savedTheme);
                    setNotificationsEnabled(data.notificationsEnabled !== false);
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
                theme,
                notificationsEnabled,
                updatedAt: serverTimestamp()
            });

            // Update app theme locally
            setColorScheme(theme);

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
                <Text style={styles.headerTitle}>Preferences</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Theme Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Settings02Icon size={20} color="#64748B" />
                        <Text style={styles.sectionTitle}>App Theme</Text>
                    </View>
                    
                    <View style={styles.themeContainer}>
                        <ThemeOption 
                            label="Light" 
                            isActive={theme === 'light'} 
                            onPress={() => setTheme('light')}
                            icon={<Sun01Icon size={24} color={theme === 'light' ? 'white' : '#64748B'} />}
                        />
                        <ThemeOption 
                            label="Dark" 
                            isActive={theme === 'dark'} 
                            onPress={() => setTheme('dark')}
                            icon={<MoonIcon size={24} color={theme === 'dark' ? 'white' : '#64748B'} />}
                        />
                        <ThemeOption 
                            label="System" 
                            isActive={theme === 'system'} 
                            onPress={() => setTheme('system')}
                            icon={<Settings02Icon size={24} color={theme === 'system' ? 'white' : '#64748B'} />}
                        />
                    </View>
                    <Text style={styles.hintText}>Select how you want the app to look.</Text>
                </Animated.View>

                {/* Notifications */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Notification01Icon size={20} color="#64748B" />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    
                    <View style={styles.toggleCard}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Enable Notifications</Text>
                            <Text style={styles.toggleDescription}>Receive daily reminders and insights.</Text>
                        </View>
                        <Switch 
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: "#E2E8F0", true: "#DCFCE7" }}
                            thumbColor={notificationsEnabled ? Colors.light.primary : "#94A3B8"}
                        />
                    </View>
                </Animated.View>
            </View>

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
}

const ThemeOption = ({ label, isActive, onPress, icon }: ThemeOptionProps) => (
    <TouchableOpacity 
        onPress={onPress}
        style={[styles.themeOption, isActive && styles.activeThemeOption]}
        activeOpacity={0.7}
    >
        <View style={[styles.themeIconWrapper, isActive && styles.activeThemeIconWrapper]}>
            {icon}
        </View>
        <Text style={[styles.themeLabel, isActive && styles.activeThemeLabel]}>{label}</Text>
    </TouchableOpacity>
);

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
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    themeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    activeThemeOption: {
        borderColor: Colors.light.primary,
        backgroundColor: '#F0FDF4',
    },
    themeIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    activeThemeIconWrapper: {
        backgroundColor: Colors.light.primary,
    },
    themeLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    activeThemeLabel: {
        color: Colors.light.primary,
    },
    hintText: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 12,
        fontWeight: '500',
    },
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
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
        color: '#0F172A',
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
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
