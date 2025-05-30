import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';
import HeaderWithBackButton from '@/app/components/navigation/HeaderWithBackButton';
import Icon from '@/app/components/common/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/core/store';
import { addReminder, updateReminder } from '@/app/core/store/slices/reminderSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

// Priority options
const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low', color: COLORS.SUCCESS },
  { label: 'Medium', value: 'medium', color: COLORS.WARNING },
  { label: 'High', value: 'high', color: COLORS.ERROR },
];

// Recurrence options
const RECURRENCE_OPTIONS = [
  { label: 'One-time', value: '' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Bi-annual', value: 'biannual' },
  { label: 'Annual', value: 'annual' },
];

export default function ReminderFormScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { reminderId } = useLocalSearchParams<{ reminderId: string }>();
  
  // Get all reminders and contacts from Redux store
  const reminders = useSelector((state: RootState) => state.reminders.items || []);
  const contacts = useSelector((state: RootState) => state.contacts.items || []);
  
  // Form state
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showContactSelector, setShowContactSelector] = useState(false);
  
  // Load reminder data if editing
  useEffect(() => {
    if (reminderId) {
      const reminderToEdit = reminders.find(r => r.id === reminderId);
      if (reminderToEdit) {
        setTitle(reminderToEdit.title);
        setContactId(reminderToEdit.contactId);
        setDate(new Date(reminderToEdit.date));
        setRecurrence(reminderToEdit.recurrence || '');
        setPriority(reminderToEdit.priority);
        setNotes(reminderToEdit.notes || '');
        setIsActive(reminderToEdit.active);
      }
    }
  }, [reminderId, reminders]);
  
  // Get selected contact name
  const getSelectedContactName = () => {
    if (!contactId) return 'Select Contact';
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Select Contact';
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a reminder title');
      return;
    }
    
    if (!contactId) {
      Alert.alert('Missing Information', 'Please select a contact');
      return;
    }
    
    // Prepare reminder data
    const reminderData = {
      id: reminderId || uuidv4(),
      title,
      contactId,
      contactName: getSelectedContactName(),
      date: date.toISOString(),
      recurrence,
      priority,
      notes,
      active: isActive,
      createdAt: reminderId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Dispatch action based on edit or add
    if (reminderId) {
      dispatch(updateReminder(reminderData));
    } else {
      dispatch(addReminder(reminderData));
    }
    
    // Navigate back
    router.back();
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Render contact selector
  const renderContactSelector = () => (
    <View style={styles.overlay}>
      <View style={styles.selectorContainer}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Select Contact</Text>
          <TouchableOpacity onPress={() => setShowContactSelector(false)}>
            <Icon name="close-outline" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.contactList}>
          {contacts.map(contact => (
            <TouchableOpacity 
              key={contact.id}
              style={[
                styles.contactItem,
                contactId === contact.id && styles.selectedContactItem
              ]}
              onPress={() => {
                setContactId(contact.id);
                setShowContactSelector(false);
              }}
            >
              <Text 
                style={[
                  styles.contactName,
                  contactId === contact.id && styles.selectedContactName
                ]}
              >
                {contact.name}
              </Text>
              {contactId === contact.id && (
                <Icon name="checkmark-outline" size={20} color={COLORS.PRIMARY} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      
      <HeaderWithBackButton 
        title={reminderId ? "Edit Reminder" : "New Reminder"} 
        onBackPress={() => router.back()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter reminder title"
            placeholderTextColor={COLORS.TEXT_MUTED}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact</Text>
          <TouchableOpacity 
            style={styles.selector}
            onPress={() => setShowContactSelector(true)}
          >
            <Text style={styles.selectorText}>{getSelectedContactName()}</Text>
            <Icon name="chevron-down-outline" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity 
            style={styles.selector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectorText}>{formatDate(date)}</Text>
            <Icon name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Recurrence</Text>
          <View style={styles.optionsContainer}>
            {RECURRENCE_OPTIONS.map(option => (
              <TouchableOpacity 
                key={option.value} 
                style={[
                  styles.optionButton,
                  recurrence === option.value && styles.selectedOption
                ]}
                onPress={() => setRecurrence(option.value)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    recurrence === option.value && styles.selectedOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {PRIORITY_OPTIONS.map(option => (
              <TouchableOpacity 
                key={option.value} 
                style={[
                  styles.priorityButton,
                  priority === option.value && { backgroundColor: `${option.color}30` }
                ]}
                onPress={() => setPriority(option.value)}
              >
                <View 
                  style={[
                    styles.priorityDot,
                    { backgroundColor: option.color }
                  ]}
                />
                <Text 
                  style={[
                    styles.priorityText,
                    priority === option.value && { color: option.color }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this reminder"
            placeholderTextColor={COLORS.TEXT_MUTED}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: COLORS.GRAY_DARK, true: `${COLORS.PRIMARY}80` }}
            thumbColor={isActive ? COLORS.PRIMARY : COLORS.GRAY_LIGHT}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {reminderId ? 'Update Reminder' : 'Create Reminder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {showContactSelector && renderContactSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.MEDIUM,
  },
  formGroup: {
    marginBottom: SPACING.LARGE,
  },
  label: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.MEDIUM,
  },
  selector: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.SMALL,
  },
  optionButton: {
    backgroundColor: COLORS.CARD,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginRight: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  selectedOption: {
    backgroundColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  selectedOptionText: {
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    flex: 1,
    marginHorizontal: SPACING.TINY,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.SMALL,
  },
  priorityText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  switchLabel: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  selectorContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    width: '100%',
    maxHeight: '80%',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  selectorTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  contactList: {
    padding: SPACING.MEDIUM,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  selectedContactItem: {
    backgroundColor: `${COLORS.PRIMARY}10`,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
  },
  selectedContactName: {
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.PRIMARY,
  },
}); 