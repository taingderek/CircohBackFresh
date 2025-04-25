import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Contact } from '../services/api';
import moment from 'moment';

interface ContactCardProps {
  contact: Contact;
  showActions?: boolean;
  onMarkContacted?: () => void;
  onPress?: () => void;
}

export default function ContactCard({ contact, showActions = false, onMarkContacted, onPress }: ContactCardProps) {
  const { id, name, next_contact_date, last_contacted } = contact;
  
  // Format the dates for display
  const formattedNextDate = moment(next_contact_date).format('MMM D, YYYY');
  const daysSinceLastContact = last_contacted 
    ? moment().diff(moment(last_contacted), 'days')
    : null;

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer 
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nextDate}>Due: {formattedNextDate}</Text>
          {last_contacted && (
            <Text style={styles.lastContacted}>
              Last contacted: {daysSinceLastContact === 0 
                ? 'Today' 
                : `${daysSinceLastContact} day${daysSinceLastContact !== 1 ? 's' : ''} ago`}
            </Text>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onMarkContacted}
          >
            <FontAwesome name="check" size={18} color="#4CAF50" />
            <Text style={styles.actionText}>Mark Contacted</Text>
          </TouchableOpacity>
          
          <Link href={{
            pathname: '/contact/[id]',
            params: { id }
          } as any} asChild>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="pencil" size={18} color="#2196F3" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  lastContacted: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
}); 