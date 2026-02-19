import ProfileCard from '@/components/profile/ProfileCard';
import ProfileOption from '@/components/profile/ProfileOption';
import TrialCard from '@/components/profile/TrialCard';
import Colors from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  CustomerService01Icon,
  DocumentAttachmentIcon,
  Logout01Icon,
  Settings02Icon,
  Shield01Icon,
  UserCircleIcon,
  ZapIcon
} from 'hugeicons-react-native';
import React from 'react';
import { Alert, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();

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
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://avatar.iran.liara.run/public/30' }} 
              style={styles.avatar} 
            />
            <View style={styles.editBadge}>
               <UserCircleIcon size={12} color="white" variant="stroke" />
            </View>
          </View>
          <View style={styles.userTextContent}>
            <Text style={styles.userName}>Ramanand Tomar</Text>
            <Text style={styles.userEmail}>ramanand@example.com</Text>
          </View>
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
            icon={<Settings02Icon size={20} color="#64748B" variant="stroke" />} 
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
            onPress={() => Linking.openURL('mailto:ramanandtomar1234@gmail.com?subject=AI Cal Tracker Support&body=Hello Support Team,')}
          />
          <ProfileOption  
            icon={<DocumentAttachmentIcon size={20} color="#64748B" variant="stroke" />} 
            label="Terms and condition" 
            onPress={() => router.push('/(main)/terms-conditions')}
          />
          <ProfileOption 
            icon={<Shield01Icon size={20} color="#64748B" variant="stroke" />} 
            label="Privacy Policy" 
            isLast={true}
            onPress={() => router.push('/(main)/privacy-policy')}
          />
        </ProfileCard>

        {/* Logout Button */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconBg}>
            <Logout01Icon size={20} color="#EF4444" variant="stroke" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0 (Build 124)</Text>
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
