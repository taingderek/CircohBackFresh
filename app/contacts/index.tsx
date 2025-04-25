import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  RefreshControl
} from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getContacts, Contact } from '../../services/api';
import ContactCard from '../../components/ContactCard';
import EmptyState from '../../components/EmptyState';

export default function ContactsScreen() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allContacts = await getContacts(user.id);
      // Sort contacts by name
      allContacts.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(allContacts);
      setFilteredContacts(allContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(query) || 
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.phone && contact.phone.toLowerCase().includes(query))
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const handleNewContact = () => {
    router.push('/contacts/new' as any);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Contacts',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleNewContact}
            >
              <FontAwesome name="plus" size={22} color="#2196F3" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          {searchQuery ? (
            <EmptyState
              icon="search"
              title="No Results Found"
              message="Try a different search term or add a new contact."
              actionLabel="Add a contact"
              actionLink={"/contacts/new" as any}
            />
          ) : (
            <EmptyState
              icon="address-book-o"
              title="No Contacts Yet"
              message="Add your first contact to get started."
              actionLabel="Add your first contact"
              actionLink={"/contacts/new" as any}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              showActions={false}
              onPress={() => router.push({
                pathname: '/contact/[id]',
                params: { id: item.id }
              } as any)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <Text style={styles.contactCount}>
              {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={handleNewContact}
      >
        <FontAwesome name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginRight: 16,
  },
  contactCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
}); 