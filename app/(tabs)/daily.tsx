import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../core/store/hooks';
import { COLORS, SPACING, FONT_SIZES, EFFECTS } from '../core/constants/theme';
import ContactCard from '../shared/components/contactStack/ContactCard';
import { Contact } from '../core/services/ContactService';
import { 
  fetchContacts, 
  selectFilteredContacts, 
  markContactedThunk,
  selectContactsLoading
} from '../core/store/slices/contactsSlice';
import {
  fetchDueReminders,
  selectDueReminders,
  completeReminder,
  snoozeReminder,
  selectRemindersLoading
} from '../core/store/slices/remindersSlice';

export default function DailyScreen() {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector(selectFilteredContacts);
  const dueReminders = useAppSelector(selectDueReminders);
  const contactsLoading = useAppSelector(selectContactsLoading);
  const remindersLoading = useAppSelector(selectRemindersLoading);
  const [dueContacts, setDueContacts] = useState<Contact[]>([]);
  const [currentProgress, setCurrentProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0
  });

  // Load contacts and reminders on mount
  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchDueReminders());
  }, [dispatch]);

  // Prepare due contacts when reminders or contacts change
  useEffect(() => {
    if (contacts.length > 0 && dueReminders.length > 0) {
      // Map due reminders to their contacts
      const dueContactsMap = new Map<string, Contact>();
      
      dueReminders.forEach(reminder => {
        const contact = contacts.find(c => c.id === reminder.contact_id);
        if (contact) {
          dueContactsMap.set(contact.id, contact);
        }
      });
      
      // Convert map to array
      const dueContactsArray = Array.from(dueContactsMap.values());
      
      setDueContacts(dueContactsArray);
      setCurrentProgress({
        completed: 0,
        total: dueContactsArray.length
      });
    } else {
      setDueContacts([]);
      setCurrentProgress({ completed: 0, total: 0 });
    }
  }, [contacts, dueReminders]);

  // Handle card swipe
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down', contact: Contact) => {
    const reminder = dueReminders.find(r => r.contact_id === contact.id);
    
    if (!reminder) {
      return;
    }
    
    switch (direction) {
      case 'left':
        // Snooze for 1 day
        dispatch(snoozeReminder({ id: reminder.id, days: 1 }));
        Alert.alert('Contact Snoozed', `${contact.name} has been snoozed for 1 day.`);
        break;
        
      case 'right':
        // Message (would open message composer)
        Alert.alert(
          'Message',
          `You're about to message ${contact.name}. This would open a message composer in a real app.`
        );
        break;
        
      case 'up':
        // Mark as contacted
        dispatch(markContactedThunk(contact.id));
        dispatch(completeReminder(reminder.id));
        
        setCurrentProgress(prev => ({
          ...prev,
          completed: prev.completed + 1
        }));
        
        Alert.alert('Contacted', `${contact.name} has been marked as contacted.`);
        break;
        
      case 'down':
        // Adjust frequency
        Alert.alert(
          'Adjust Frequency',
          `How often would you like to be reminded to contact ${contact.name}?`,
          [
            { text: 'Weekly', onPress: () => updateFrequency(contact.id, 7) },
            { text: 'Bi-weekly', onPress: () => updateFrequency(contact.id, 14) },
            { text: 'Monthly', onPress: () => updateFrequency(contact.id, 30) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        break;
    }
  };

  // Update contact reminder frequency
  const updateFrequency = (contactId: string, days: number) => {
    // This would update the contact's reminder frequency
    Alert.alert('Frequency Updated', `Reminder frequency has been updated to ${days} days.`);
  };

  // Calculate progress percentage
  const progressPercentage = currentProgress.total > 0
    ? (currentProgress.completed / currentProgress.total) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Stack</Text>
        <Text style={styles.subtitle}>Swipe to connect with your contacts</Text>
      </View>
      
      <View style={styles.cardContainer}>
        {contactsLoading || remindersLoading ? (
          <View style={[styles.emptyCard, styles.loadingCard]}>
            <Text style={styles.emptyCardText}>Loading...</Text>
          </View>
        ) : dueContacts.length > 0 ? (
          dueContacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onSwiped={handleSwipe}
              isFirst={index === 0}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.SUCCESS} />
            <Text style={styles.emptyCardText}>All caught up!</Text>
            <Text style={styles.emptyCardSubtext}>You don't have any due contacts today.</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.snoozeButton]}
          onPress={() => dueContacts.length > 0 && handleSwipe('left', dueContacts[0])}
        >
          <Ionicons name="time-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => dueContacts.length > 0 && handleSwipe('right', dueContacts[0])}
        >
          <Ionicons name="chatbubble-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => dueContacts.length > 0 && handleSwipe('up', dueContacts[0])}
        >
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentProgress.completed} of {currentProgress.total} Today
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  header: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    fontFamily: 'MontserratBold',
  },
  subtitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.TINY,
    fontFamily: 'MontserratRegular',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: SPACING.LARGE,
    alignItems: 'center',
    justifyContent: 'center',
    ...EFFECTS.SHADOW_MEDIUM,
  },
  loadingCard: {
    backgroundColor: COLORS.CARD,
  },
  emptyCardText: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginTop: SPACING.MEDIUM,
    fontFamily: 'MontserratBold',
  },
  emptyCardSubtext: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
    textAlign: 'center',
    fontFamily: 'MontserratRegular',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeButton: {
    backgroundColor: COLORS.ACCENT,
    ...EFFECTS.GLOW_ACCENT,
  },
  messageButton: {
    backgroundColor: COLORS.PRIMARY,
    ...EFFECTS.GLOW_PRIMARY,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  completeButton: {
    backgroundColor: COLORS.SUCCESS,
    ...EFFECTS.GLOW_PRIMARY,
  },
  progressContainer: {
    marginBottom: SPACING.LARGE,
  },
  progressText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
    fontFamily: 'MontserratMedium',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.GRAY_DARK,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
}); 