import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';

type FrequencyOption = {
  days: number;
  label: string;
  description: string;
  isPremium: boolean;
};

type FrequencyAdjustModalProps = {
  visible: boolean;
  currentFrequency: number;
  isPremium: boolean;
  onClose: () => void;
  onSave: (frequency: number) => void;
  contactName: string;
};

export default function FrequencyAdjustModal({
  visible,
  currentFrequency,
  isPremium,
  onClose,
  onSave,
  contactName,
}: FrequencyAdjustModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState(currentFrequency);
  
  // Define frequency options
  const frequencyOptions: FrequencyOption[] = [
    { 
      days: 1, 
      label: 'Daily', 
      description: 'Get reminded every day',
      isPremium: true 
    },
    { 
      days: 3, 
      label: 'Every 3 days', 
      description: 'Maintain frequent contact',
      isPremium: true 
    },
    { 
      days: 7, 
      label: 'Weekly', 
      description: 'Regular weekly check-ins',
      isPremium: false 
    },
    { 
      days: 14, 
      label: 'Every 2 weeks', 
      description: 'Standard bi-weekly reminders',
      isPremium: false 
    },
    { 
      days: 30, 
      label: 'Monthly', 
      description: 'Once a month reminders',
      isPremium: false 
    },
    { 
      days: 90, 
      label: 'Quarterly', 
      description: 'For less frequent connections',
      isPremium: true 
    },
  ];
  
  // Handle saving the selected frequency
  const handleSave = () => {
    onSave(selectedFrequency);
    onClose();
  };
  
  // Render a frequency option button
  const renderFrequencyOption = (option: FrequencyOption) => {
    const isSelected = selectedFrequency === option.days;
    
    // For premium options
    if (option.isPremium && !isPremium) {
      return (
        <PremiumFeatureGate 
          key={option.days} 
          feature="unlimited_contacts"
          fallback={
            <TouchableOpacity 
              style={[styles.optionButton, styles.premiumOptionButton]}
              disabled={true}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="lock-closed" size={20} color="#32FFA5" />
            </TouchableOpacity>
          }
        >
          <TouchableOpacity 
            style={[
              styles.optionButton, 
              isSelected && styles.selectedOption
            ]}
            onPress={() => setSelectedFrequency(option.days)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionLabel, 
                isSelected && styles.selectedText
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionDescription, 
                isSelected && styles.selectedText
              ]}>
                {option.description}
              </Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </PremiumFeatureGate>
      );
    }
    
    // For regular options
    return (
      <TouchableOpacity 
        key={option.days}
        style={[
          styles.optionButton, 
          isSelected && styles.selectedOption
        ]}
        onPress={() => setSelectedFrequency(option.days)}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel, 
            isSelected && styles.selectedText
          ]}>
            {option.label}
          </Text>
          <Text style={[
            styles.optionDescription, 
            isSelected && styles.selectedText
          ]}>
            {option.description}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Reminder Frequency</Text>
                <Text style={styles.subtitle}>
                  How often would you like to be reminded to contact {contactName}?
                </Text>
              </View>
              
              <View style={styles.optionsContainer}>
                {frequencyOptions.map(option => renderFrequencyOption(option))}
              </View>
              
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#32FFA5',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  selectedText: {
    color: '#121212',
  },
  premiumOptionButton: {
    borderWidth: 1,
    borderColor: '#32FFA5',
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    flex: 1,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#32FFA5',
    flex: 1,
  },
  saveButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
}); 