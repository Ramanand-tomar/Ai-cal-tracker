
import { useTheme } from "@/context/ThemeContext";
import { Activity01Icon, Cancel01Icon, FireIcon, MenuRestaurantIcon } from "hugeicons-react-native";
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface EditMacrosModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: { total: number; proteinGoal: number; carbsGoal: number; fatGoal: number }) => void;
  initialValues: {
    total: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  };
}

export default function EditMacrosModal({ isVisible, onClose, onSave, initialValues }: EditMacrosModalProps) {
  const { colors, isDark } = useTheme();
  const [total, setTotal] = useState(initialValues.total.toString());
  const [proteinGoal, setProteinGoal] = useState(initialValues.proteinGoal.toFixed(1));
  const [carbsGoal, setCarbsGoal] = useState(initialValues.carbsGoal.toFixed(1));
  const [fatGoal, setFatGoal] = useState(initialValues.fatGoal.toFixed(1));

  const handleSave = () => {
    onSave({
      total: parseInt(total) || 0,
      proteinGoal: parseFloat(proteinGoal) || 0,
      carbsGoal: parseFloat(carbsGoal) || 0,
      fatGoal: parseFloat(fatGoal) || 0,
    });
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Goals</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: isDark ? colors.surface : '#f9fafb' }]}>
                <Cancel01Icon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* Calories */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : '#EFF6FF' }]}>
                  <Activity01Icon size={20} color={colors.primary} />
                </View>
                <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Calorie Goal</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={total}
                    onChangeText={setTotal}
                    keyboardType="numeric"
                    placeholder="2000"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Protein */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff' }]}>
                  <Activity01Icon size={20} color="#3b82f6" />
                </View>
                <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Protein Goal (g)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={proteinGoal}
                    onChangeText={setProteinGoal}
                    keyboardType="numeric"
                    placeholder="150"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed' }]}>
                  <MenuRestaurantIcon size={20} color="#f97316" />
                </View>
                <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Carbs Goal (g)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={carbsGoal}
                    onChangeText={setCarbsGoal}
                    keyboardType="numeric"
                    placeholder="250"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Fat */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8' }]}>
                  <FireIcon size={20} color="#eab308" />
                </View>
                <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Fat Goal (g)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={fatGoal}
                    onChangeText={setFatGoal}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 0,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
