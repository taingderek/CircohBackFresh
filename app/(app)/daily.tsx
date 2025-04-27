import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { getDailyContacts, updateContactLastContacted, Contact } from '../../services/api';
import ContactCard from '../../components/ContactCard';
import EmptyState from '../../components/EmptyState';
import { FontAwesome } from '@expo/vector-icons';

export default function DailyScreen() {
  const { user } = useAuth();
  const { isPremium } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailyContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dailyContacts = await getDailyContacts(user.id);
      setContacts(dailyContacts);
    } catch (error) {
      console.error('Error fetching daily contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyContacts();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDailyContacts();
    setRefreshing(false);
  };

  const markAsContacted = async (contactId: string) => {
    try {
      const now = new Date().toISOString();
      await updateContactLastContacted(contactId, now);
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.filter(contact => contact.id !== contactId)
      );
    } catch (error) {
      console.error('Error marking contact as contacted:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Today\'s Contacts',
          headerRight: () => (
            <Link href={'/settings/' as any} asChild>
              <TouchableOpacity style={styles.settingsButton}>
                <FontAwesome name="gear" size={24} color="black" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={contacts.length === 0 ? styles.emptyScrollContent : styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {contacts.length === 0 ? (
          <EmptyState
            icon="smile-o"
            title="You're all caught up!"
            message="No contacts scheduled for today. Check back tomorrow or add new contacts to stay in touch."
            actionLabel="Add a contact"
            actionLink={'/contacts/new' as any}
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} to reach out to today
            </Text>
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onMarkContacted={() => markAsContacted(contact.id)}
                showActions
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyScrollContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  settingsButton: {
    marginRight: 15,
    padding: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 