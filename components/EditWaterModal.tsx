
import { useTheme } from "@/context/ThemeContext";
import { Cancel01Icon, DropletIcon, RainDropIcon } from "hugeicons-react-native";
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface EditWaterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: { waterGoal: number; waterConsumed: number }) => void;
  initialValues: {
    waterGoal: number;
    waterConsumed: number;
  };
}

export default function EditWaterModal({ isVisible, onClose, onSave, initialValues }: EditWaterModalProps) {
  const { colors, isDark } = useTheme();
  const [waterGoal, setWaterGoal] = useState(initialValues.waterGoal.toFixed(1));
  const [waterConsumed, setWaterConsumed] = useState(initialValues.waterConsumed.toFixed(1));

  const handleSave = () => {
    onSave({
      waterGoal: parseFloat(waterGoal) || 0,
      waterConsumed: parseFloat(waterConsumed) || 0,
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
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Edit Water Intake</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Set your daily goal and track progress</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Cancel01Icon size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Daily Goal (Liters)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.surface : "#F3F4F6" }]}>
                  <DropletIcon size={20} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={waterGoal}
                    onChangeText={setWaterGoal}
                    keyboardType="numeric"
                    placeholder="e.g. 2.5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Consumed Today (Liters)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.surface : "#F3F4F6" }]}>
                  <RainDropIcon size={20} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={waterConsumed}
                    onChangeText={setWaterConsumed}
                    keyboardType="numeric"
                    placeholder="e.g. 1.2"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Update Water</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  inputsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
