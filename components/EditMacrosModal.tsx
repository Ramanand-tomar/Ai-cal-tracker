
import { Colors } from "@/constants/Colors";
import { Activity01Icon, Bread01Icon, Cancel01Icon, NaturalFoodIcon, OrganicFoodIcon } from "hugeicons-react-native";
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
  const [total, setTotal] = useState(initialValues.total.toString());
  const [proteinGoal, setProteinGoal] = useState(initialValues.proteinGoal.toString());
  const [carbsGoal, setCarbsGoal] = useState(initialValues.carbsGoal.toString());
  const [fatGoal, setFatGoal] = useState(initialValues.fatGoal.toString());

  const handleSave = () => {
    onSave({
      total: parseInt(total) || 0,
      proteinGoal: parseInt(proteinGoal) || 0,
      carbsGoal: parseInt(carbsGoal) || 0,
      fatGoal: parseInt(fatGoal) || 0,
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
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Goals</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Cancel01Icon size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* Calories */}
              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <Activity01Icon size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Calorie Goal</Text>
                  <TextInput
                    style={styles.input}
                    value={total}
                    onChangeText={setTotal}
                    keyboardType="numeric"
                    placeholder="2000"
                  />
                </View>
              </View>

              {/* Protein */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: '#eff6ff' }]}>
                  <NaturalFoodIcon size={20} color="#3b82f6" />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Protein Goal (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={proteinGoal}
                    onChangeText={setProteinGoal}
                    keyboardType="numeric"
                    placeholder="150"
                  />
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: '#fff7ed' }]}>
                  <Bread01Icon size={20} color="#f97316" />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Carbs Goal (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={carbsGoal}
                    onChangeText={setCarbsGoal}
                    keyboardType="numeric"
                    placeholder="250"
                  />
                </View>
              </View>

              {/* Fat */}
              <View style={styles.inputContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: '#fefce8' }]}>
                  <OrganicFoodIcon size={20} color="#eab308" />
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Fat Goal (g)</Text>
                  <TextInput
                    style={styles.input}
                    value={fatGoal}
                    onChangeText={setFatGoal}
                    keyboardType="numeric"
                    placeholder="70"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
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
    backgroundColor: '#fff',
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
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f9fafb',
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
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    padding: 0,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
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
