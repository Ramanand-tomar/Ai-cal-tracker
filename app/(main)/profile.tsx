import ProfileCard from '@/components/profile/ProfileCard';
import ProfileOption from '@/components/profile/ProfileOption';
import TrialCard from '@/components/profile/TrialCard';
import AppLoader from '@/components/ui/AppLoader';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useUserData } from '@/context/UserContext';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
    CustomerService01Icon,
    DocumentAttachmentIcon,
    Logout01Icon,
    Moon02Icon,
    Settings01Icon,
    Settings02Icon,
    Shield01Icon,
    Sun01Icon,
    UserCircleIcon,
    ZapIcon
} from 'hugeicons-react-native';
import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme, isDark, colors, setTheme } = useTheme();
  const { userData, loading: userLoading } = useUserData();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => signOut(),
          style: "destructive"
        }
      ]
    );
  };

  const toggleTheme = () => {
    Alert.alert(
      "Appearance",
      "Choose your preferred theme",
      [
        { text: "Light", onPress: () => setTheme('light') },
        { text: "Dark", onPress: () => setTheme('dark') },
        { text: "System", onPress: () => setTheme('system') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Settings01Icon size={20} color={colors.textSecondary} variant="stroke" />;
    return isDark ? 
      <Moon02Icon size={20} color="#818CF8" variant="stroke" /> : 
      <Sun01Icon size={20} color="#F59E0B" variant="stroke" />;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

        {/* User Info Card */}
        <View style={[styles.userInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {userLoading ? (
            <AppLoader size={40} />
          ) : (
            <>
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: userData?.imageUrl || 'https://avatar.iran.liara.run/public/30' }} 
                  style={[styles.avatar, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]} 
                />
                <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                  <UserCircleIcon size={12} color="white" variant="stroke" />
                </View>
              </View>
              <View style={styles.userTextContent}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {userData?.fullName || userData?.firstName || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {userData?.email || 'No email provided'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Free Trial Section */}
        <TrialCard onPress={() => {}} />

        {/* Account Section */}
        <ProfileCard title="Account">
          <ProfileOption 
            icon={<UserCircleIcon size={20} color="#6366F1" variant="stroke" />} 
            label="Personal Details" 
            onPress={() => router.push('/(main)/personal-details')}
          />
          <ProfileOption 
            icon={getThemeIcon()} 
            label={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`} 
            onPress={toggleTheme}
          />
          <ProfileOption 
            icon={<Settings02Icon size={20} color={isDark ? colors.textMuted : "#64748B"} variant="stroke" />} 
            label="Preferences" 
            onPress={() => router.push('/(main)/preferences')}
          />
          <ProfileOption 
            icon={<ZapIcon size={20} color="#F59E0B" variant="stroke" />} 
            label="Upgrade to Premium Features" 
            isLast={true}
            onPress={() => {}}
          />
        </ProfileCard>

        {/* Support Section */}
        <ProfileCard title="Support">
          <ProfileOption 
            icon={<ZapIcon size={20} color="#10B981" variant="stroke" />} 
            label="Request new features" 
            onPress={() => router.push('/(main)/feature-requests')}
          />
          <ProfileOption 
            icon={<CustomerService01Icon size={20} color="#3B82F6" variant="stroke" />} 
            label="Contact Us" 
            onPress={() => Linking.openURL('mailto:ramanandtomar1234@gmail.com?subject=Calorify AI Support&body=Hello Support Team,')}
          />
          <ProfileOption  
            icon={<DocumentAttachmentIcon size={20} color={isDark ? colors.textMuted : "#64748B"} variant="stroke" />} 
            label="Terms and condition" 
            onPress={() => router.push('/(main)/terms-conditions')}
          />
          <ProfileOption 
            icon={<Shield01Icon size={20} color={isDark ? colors.textMuted : "#64748B"} variant="stroke" />} 
            label="Privacy Policy" 
            isLast={true}
            onPress={() => router.push('/(main)/privacy-policy')}
          />
        </ProfileCard>

        {/* Logout Button */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}
          onPress={handleLogout}
        >
          <View style={[styles.logoutIconBg, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
            <Logout01Icon size={20} color="#EF4444" variant="stroke" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          Version 1.0.0 (created By Ramanand Tomar)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 140,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 32,
    letterSpacing: -1,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextContent: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    marginTop: 8,
  },
  logoutIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
});
