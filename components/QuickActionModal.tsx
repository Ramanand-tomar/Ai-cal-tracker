import { useTheme } from '@/context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
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
    Alert,
    Dimensions,
    Modal,
    Platform,
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
  const { colors, isDark } = useTheme();
  const [isSelectionVisible, setIsSelectionVisible] = React.useState(false);

  const handleAction = (route: string) => {
    onClose();
    if (route === '/(main)/log-exercise' || route === '/(main)/plus' || route === '/(main)/water-intake' || route === '/(main)/food-search') {
        router.push(route);
    } else {
        console.log(`Navigating to: ${route}`);
    }
  };

  const handleScanFood = () => {
    setIsSelectionVisible(true);
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "We need camera access to scan your food.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "We need gallery access to select food photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSelectionVisible(false);
        onClose();
        router.push({
          pathname: "/(main)/ai-analysis",
          params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
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
        style={[styles.circle, { backgroundColor: isDark ? colors.surface : bgColor }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Icon size={28} color={isDark ? colors.text : color} />
        {isPremium && (
          <View style={styles.premiumBadge}>
            <CrownIcon size={10} color="white" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={[styles.actionLabel, { color: isDark ? colors.text : 'white' }]}>{title}</Text>
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
                    color={colors.primary}
                    bgColor={isDark ? colors.surface : "#e0e7ff"}
                    onPress={() => handleAction('/(main)/water-intake')} 
                  />
                </View>
                <View style={styles.row}>
                  <ActionButton 
                    title="Food Database"
                    icon={MenuRestaurantIcon}
                    color="#F97316"
                    bgColor="#FFF7ED"
                    onPress={() => handleAction('/(main)/food-search')}
                  />
                  <ActionButton 
                    title="Scan Food"
                    icon={Camera01Icon}
                    color="#8B5CF6"
                    bgColor="#F5F3FF"
                    isPremium={true}
                    onPress={handleScanFood}
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                 <View style={[styles.closeIconBg, { backgroundColor: isDark ? colors.surface : 'white' }]}>
                    <Cancel01Icon size={24} color={colors.textSecondary} />
                 </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Premium Image Selection Dialog */}
      <Modal
        visible={isSelectionVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSelectionVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSelectionVisible(false)}>
          <View style={styles.selectionOverlay}>
            <View style={[styles.selectionContent, { backgroundColor: colors.background }]}>
              <View style={styles.selectionHeader}>
                <Text style={[styles.selectionTitle, { color: colors.text }]}>Scan Food</Text>
                <Text style={[styles.selectionSubtitle, { color: colors.textSecondary }]}>Select how you want to add your photo</Text>
              </View>

              <View style={styles.selectionOptions}>
                <TouchableOpacity 
                  style={styles.selectionOption} 
                  onPress={() => pickImage(true)}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: isDark ? colors.surface : '#F5F3FF' }]}>
                    <Camera01Icon size={32} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.selectionOption} 
                  onPress={() => pickImage(false)}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: isDark ? colors.surface : '#F0F9FF' }]}>
                    <MenuRestaurantIcon size={32} color="#0EA5E9" />
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>Gallery</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.cancelBtn, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]} 
                onPress={() => setIsSelectionVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 110,
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  selectionContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
  },
  selectionHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  selectionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  selectionOption: {
    alignItems: 'center',
    gap: 12,
  },
  optionIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
