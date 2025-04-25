import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

type ContactCardProps = {
  contact: {
    id: string;
    name: string;
    category: string;
    lastContacted?: string;
    notes?: string;
    avatar_url?: string;
    reminder_frequency: number;
  };
  onAction: (action: 'message' | 'snooze' | 'contacted' | 'adjust', contactId: string) => void;
};

export default function ContactCard({ contact, onAction }: ContactCardProps) {
  // Format the time since last contact
  const getLastContactedText = () => {
    if (!contact.lastContacted) {
      return 'Never contacted';
    }
    
    return `Last contacted ${formatDistanceToNow(new Date(contact.lastContacted), { addSuffix: true })}`;
  };
  
  // Get appropriate icon for contact category
  const getCategoryIcon = () => {
    switch (contact.category) {
      case 'friend':
        return 'people-outline';
      case 'family':
        return 'heart-outline';
      case 'colleague':
        return 'briefcase-outline';
      default:
        return 'person-outline';
    }
  };
  
  // Format reminder frequency to readable text
  const getReminderFrequencyText = () => {
    if (contact.reminder_frequency === 1) {
      return 'Every day';
    } else if (contact.reminder_frequency === 7) {
      return 'Weekly';
    } else if (contact.reminder_frequency === 14) {
      return 'Every two weeks';
    } else if (contact.reminder_frequency === 30) {
      return 'Monthly';
    } else {
      return `Every ${contact.reminder_frequency} days`;
    }
  };
  
  // Get initials from name for avatar fallback
  const getInitials = () => {
    return contact.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {contact.avatar_url ? (
            <Image source={{ uri: contact.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.initialsText}>{getInitials()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{contact.name}</Text>
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon()} size={12} color="#FFFFFF" />
            <Text style={styles.categoryText}>
              {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={18} color="#B0B0B0" />
          <Text style={styles.infoText}>{getLastContactedText()}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={18} color="#B0B0B0" />
          <Text style={styles.infoText}>{getReminderFrequencyText()}</Text>
        </View>
        
        {contact.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{contact.notes}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.swipeHintText}>
          <Ionicons name="swap-horizontal" size={16} color="#B0B0B0" /> Swipe for actions
        </Text>
      </View>
      
      {/* Action buttons (visible in non-swipe mode) */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.snoozeButton]}
          onPress={() => onAction('snooze', contact.id)}
        >
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Snooze</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onAction('message', contact.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.contactedButton]}
          onPress={() => onAction('contacted', contact.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Contacted</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.adjustButton]}
          onPress={() => onAction('adjust', contact.id)}
        >
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Adjust</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2A2A',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#32FFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#121212',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#B0B0B0',
    fontSize: 14,
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  notesLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  swipeHintText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  snoozeButton: {
    backgroundColor: '#BE93FD', // Lavender
  },
  messageButton: {
    backgroundColor: '#32FFA5', // Mint green
  },
  contactedButton: {
    backgroundColor: '#93FDFD', // Cyan
  },
  adjustButton: {
    backgroundColor: '#FF93B9', // Pink
  },
}); 