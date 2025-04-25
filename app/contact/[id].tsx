import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getContact, updateContact, deleteContact, Contact } from '../../services/api';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    frequency: 7, // Default to weekly
  });

  useEffect(() => {
    if (!user || !id) return;

    const fetchContact = async () => {
      try {
        setLoading(true);
        const contactData = await getContact(id as string);
        setContact(contactData);
        setFormData({
          name: contactData.name || '',
          email: contactData.email || '',
          phone: contactData.phone || '',
          notes: contactData.notes || '',
          frequency: contactData.frequency || 7,
        });
      } catch (error) {
        console.error('Error fetching contact:', error);
        Alert.alert('Error', 'Failed to load contact details');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id, user]);

  const handleSave = async () => {
    if (!contact || !id) return;

    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Name is required');
        setSaving(false);
        return;
      }

      // Update contact
      await updateContact(id as string, {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        frequency: formData.frequency,
      });

      Alert.alert('Success', 'Contact updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this contact? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(id as string);
              Alert.alert('Success', 'Contact deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const frequencyOptions = [
    { value: 1, label: 'Daily' },
    { value: 3, label: 'Every 3 days' },
    { value: 7, label: 'Weekly' },
    { value: 14, label: 'Every 2 weeks' },
    { value: 30, label: 'Monthly' },
    { value: 90, label: 'Quarterly' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: contact?.name || 'Contact Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <FontAwesome name="trash" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Contact name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Email address"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reminder Frequency</Text>
          <View style={styles.frequencyOptions}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  formData.frequency === option.value && styles.selectedFrequency,
                ]}
                onPress={() => setFormData({ ...formData, frequency: option.value })}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    formData.frequency === option.value && styles.selectedFrequencyText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add notes about this contact"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {contact?.last_contacted && (
          <View style={styles.infoBox}>
            <FontAwesome name="info-circle" size={18} color="#2196F3" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Last contacted: {new Date(contact.last_contacted).toLocaleDateString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  frequencyOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    backgroundColor: 'white',
  },
  selectedFrequency: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  frequencyText: {
    color: '#333',
    fontSize: 14,
  },
  selectedFrequencyText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    color: '#0d47a1',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  savingButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
}); 