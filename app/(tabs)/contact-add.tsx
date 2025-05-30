import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/app/core/constants/theme';
import { useDispatch } from 'react-redux';
import { createContact } from '@/app/core/store/slices/contactsSlice';
import { ContactCreateData } from '@/app/core/types/contact';

// Relationship options that match the RelationshipType from contacts.ts
const RELATIONSHIP_OPTIONS = [
  { value: 'friend', label: 'Friend', icon: 'heart-outline' },
  { value: 'family', label: 'Family', icon: 'home-outline' },
  { value: 'colleague', label: 'Colleague', icon: 'briefcase-outline' },
  { value: 'acquaintance', label: 'Acquaintance', icon: 'person-outline' },
  { value: 'business', label: 'Business', icon: 'business-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' }
];

// Contact frequency options in days
const FREQUENCY_OPTIONS = [
  { value: 7, label: 'Weekly' },
  { value: 14, label: 'Bi-weekly' },
  { value: 30, label: 'Monthly' },
  { value: 90, label: 'Quarterly' },
  { value: 180, label: 'Semi-annually' },
  { value: 365, label: 'Annually' }
];

export default function AddContactScreen() {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [contactData, setContactData] = useState<Partial<ContactCreateData>>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    relationship: 'friend',
    notes: '',
    contactFrequencyDays: 30,
    reminderSettings: {
      birthdayReminder: true,
      birthdayReminderDays: 7,
      travelReminder: true
    }
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle reminder settings changes
  const handleReminderSettingChange = (field: string, value: any) => {
    setContactData(prev => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        [field]: value
      }
    }));
  };

  // Handle relationship selection
  const handleRelationshipSelect = (relationshipType: string) => {
    handleInputChange('relationship', relationshipType);
  };

  // Handle frequency selection
  const handleFrequencySelect = (frequencyDays: number) => {
    handleInputChange('contactFrequencyDays', frequencyDays);
  };

  // Submit the form
  const handleSubmit = async () => {
    // Validate required fields
    if (!contactData.contactName?.trim()) {
      Alert.alert('Error', 'Contact name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create the contact object
      const newContactData: ContactCreateData = {
        contactName: contactData.contactName!,
        contactEmail: contactData.contactEmail || null,
        contactPhone: contactData.contactPhone || null,
        relationship: contactData.relationship || null,
        notes: contactData.notes || null,
        contactFrequencyDays: contactData.contactFrequencyDays || 30,
        reminderSettings: contactData.reminderSettings
      };

      // Dispatch the create contact action
      await dispatch(createContact(newContactData) as any);
      
      // Show success message and navigate back
      Alert.alert(
        'Success', 
        'Contact added successfully', 
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating contact:', error);
      Alert.alert('Error', 'Failed to create contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add New Contact',
          headerTitleStyle: styles.headerTitle
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Contact Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              value={contactData.contactName}
              onChangeText={(text) => handleInputChange('contactName', text)}
              placeholderTextColor={COLORS.TEXT_DISABLED}
            />
          </View>

          {/* Contact Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              keyboardType="email-address"
              value={contactData.contactEmail || ''}
              onChangeText={(text) => handleInputChange('contactEmail', text)}
              placeholderTextColor={COLORS.TEXT_DISABLED}
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={contactData.contactPhone || ''}
              onChangeText={(text) => handleInputChange('contactPhone', text)}
              placeholderTextColor={COLORS.TEXT_DISABLED}
            />
          </View>

          {/* Relationship Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship</Text>
            <View style={styles.optionsGrid}>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    contactData.relationship === option.value && styles.selectedOption
                  ]}
                  onPress={() => handleRelationshipSelect(option.value)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={contactData.relationship === option.value ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY} 
                  />
                  <Text 
                    style={[
                      styles.optionText,
                      contactData.relationship === option.value && styles.selectedOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Frequency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>How often to stay in touch?</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.frequencyContainer}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    contactData.contactFrequencyDays === option.value && styles.selectedFrequency
                  ]}
                  onPress={() => handleFrequencySelect(option.value)}
                >
                  <Text 
                    style={[
                      styles.frequencyText,
                      contactData.contactFrequencyDays === option.value && styles.selectedFrequencyText
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes about this contact"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={contactData.notes || ''}
              onChangeText={(text) => handleInputChange('notes', text)}
              placeholderTextColor={COLORS.TEXT_DISABLED}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Contact</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerTitle: {
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.LARGE,
  },
  form: {
    padding: SPACING.MEDIUM,
  },
  inputGroup: {
    marginBottom: SPACING.MEDIUM,
  },
  label: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.TINY,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.SMALL,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.TINY,
  },
  optionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '33%',
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.SMALL,
  },
  selectedOption: {
    backgroundColor: `${COLORS.SECONDARY}20`,
  },
  optionText: {
    marginTop: SPACING.TINY,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  frequencyContainer: {
    paddingVertical: SPACING.SMALL,
  },
  frequencyOption: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.CARD,
    marginRight: SPACING.SMALL,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedFrequency: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: `${COLORS.PRIMARY}20`,
  },
  frequencyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
  },
  selectedFrequencyText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
    marginTop: SPACING.LARGE,
  },
  submitButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
  },
}); 