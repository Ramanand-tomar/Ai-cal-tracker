import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import {
  Camera01Icon,
  Cancel01Icon,
  CrownIcon,
  DropletIcon,
  Dumbbell01Icon,
  MenuRestaurantIcon
} from 'hugeicons-react-native';
import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface QuickActionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const ITEM_SIZE = 80;
const GAP = 32;

export default function QuickActionModal({ isVisible, onClose }: QuickActionModalProps) {
  const router = useRouter();

  const handleAction = (route: string) => {
    onClose();
    if (route === '/(main)/log-exercise' || route === '/(main)/plus') {
        router.push(route);
    } else {
        console.log(`Navigating to: ${route}`);
    }
  };

  const ActionButton = ({ 
    title, 
    icon: Icon, 
    color, 
    bgColor, 
    isPremium = false,
    onPress 
  }: { 
    title: string; 
    icon: any; 
    color: string; 
    bgColor: string; 
    isPremium?: boolean;
    onPress: () => void;
  }) => (
    <View style={styles.actionItem}>
      <TouchableOpacity 
        style={[styles.circle, { backgroundColor: bgColor }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Icon size={28} color={color} />
        {isPremium && (
          <View style={styles.premiumBadge}>
            <CrownIcon size={10} color="white" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.actionLabel}>{title}</Text>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.grid}>
                <View style={styles.row}>
                  <ActionButton 
                    title="Exercise"
                    icon={Dumbbell01Icon}
                    color="#3B82F6"
                    bgColor="#EFF6FF"
                    onPress={() => handleAction('/(main)/log-exercise')}
                  />
                  <ActionButton 
                    title="Water"
                    icon={DropletIcon}
                    color={Colors.light.primary}
                    bgColor={Colors.light.primaryLight}
                    onPress={() => handleAction('/(main)/index')} 
                  />
                </View>
                <View style={styles.row}>
                  <ActionButton 
                    title="Food Database"
                    icon={MenuRestaurantIcon}
                    color="#F97316"
                    bgColor="#FFF7ED"
                    onPress={() => handleAction('/(main)/plus')}
                  />
                  <ActionButton 
                    title="Scan Food"
                    icon={Camera01Icon}
                    color="#8B5CF6"
                    bgColor="#F5F3FF"
                    isPremium={true}
                    onPress={() => console.log('Premium option clicked')}
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                 <View style={styles.closeIconBg}>
                   <Cancel01Icon size={24} color="#6B7280" />
                 </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 110, // Positioned above the tab bar
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  grid: {
    gap: GAP,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  actionItem: {
    alignItems: 'center',
    width: ITEM_SIZE + 20,
  },
  circle: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  actionLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5F3FF',
  },
  closeButton: {
    marginTop: 40,
  },
  closeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
