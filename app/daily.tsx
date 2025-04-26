import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from './contexts/UserContext';

import SwipeStack from './components/daily/SwipeStack';
import FrequencyAdjustModal from './components/daily/FrequencyAdjustModal';
import { getDailyContacts, updateContactLastContacted, updateContactFrequency } from '../services/api';
import { useRouter } from 'expo-router';

// Define Contact interface
interface Contact {
  id: string;
  name: string;
  category: string;
  lastContacted?: string;
  notes?: string;
  avatar_url?: string;
  reminder_frequency: number;
}

export default function DailyScreen() {
  const { user } = useAuth();
  const { isPremium } = useUser();
  const router = useRouter();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Fetch daily contacts
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const dailyContacts = await getDailyContacts(user.id);
        setContacts(dailyContacts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching daily contacts:', err);
        setError('Failed to load your daily contacts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [user]);
  
  // Handler for message action (swipe right)
  const handleMessage = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      router.push({
        pathname: '/messages',
        params: { contactId: contactId }
      });
    }
  };
  
  // Handler for snooze action (swipe left)
  const handleSnooze = async (contactId: string) => {
    try {
      // For now, just mark as contacted which will push the next contact date
      await updateContactLastContacted(contactId, new Date().toISOString());
      
      // Remove the contact from the local state
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (err) {
      console.error('Error snoozing contact:', err);
      setError('Failed to snooze contact. Please try again.');
    }
  };
  
  // Handler for contacted action (swipe up)
  const handleContacted = async (contactId: string) => {
    try {
      await updateContactLastContacted(contactId, new Date().toISOString());
      
      // Remove the contact from the local state
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (err) {
      console.error('Error marking contact as contacted:', err);
      setError('Failed to update contact. Please try again.');
    }
  };
  
  // Handler for adjust frequency action (swipe down)
  const handleAdjustFrequency = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setShowFrequencyModal(true);
    }
  };
  
  // Handler for saving new frequency
  const handleSaveFrequency = async (frequency: number) => {
    if (!selectedContact) return;
    
    try {
      await updateContactFrequency(selectedContact.id, frequency);
      
      // Update the local state
      const updatedContacts = contacts.map(c => 
        c.id === selectedContact.id 
          ? { ...c, reminder_frequency: frequency }
          : c
      );
      
      setContacts(updatedContacts);
      setSelectedContact(null);
    } catch (err) {
      console.error('Error updating contact frequency:', err);
      setError('Failed to update contact frequency. Please try again.');
    }
  };
  
  // Handler for when the stack ends
  const handleStackEnd = () => {
    // Could show a congratulatory message or prompt to add more contacts
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32FFA5" />
        <Text style={styles.loadingText}>Loading your daily contacts...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            if (user) {
              getDailyContacts(user.id)
                .then(dailyContacts => {
                  setContacts(dailyContacts);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error retrying fetch:', err);
                  setError('Failed to load your daily contacts. Please try again later.');
                  setLoading(false);
                });
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Check-ins</Text>
        <Text style={styles.subtitle}>
          {contacts.length > 0 
            ? `${contacts.length} contacts due today`
            : 'No contacts due today'}
        </Text>
      </View>
      
      <SwipeStack 
        contacts={contacts}
        isPremium={isPremium}
        onSwipeRight={handleMessage}
        onSwipeLeft={handleSnooze}
        onSwipeUp={handleContacted}
        onSwipeDown={handleAdjustFrequency}
        onStackEnd={handleStackEnd}
        dailyLimit={5} // Free user daily limit
      />
      
      {selectedContact && (
        <FrequencyAdjustModal
          visible={showFrequencyModal}
          currentFrequency={selectedContact.reminder_frequency}
          isPremium={isPremium}
          onClose={() => {
            setShowFrequencyModal(false);
            setSelectedContact(null);
          }}
          onSave={handleSaveFrequency}
          contactName={selectedContact.name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#32FFA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 