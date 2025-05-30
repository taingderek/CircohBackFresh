import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';
import { Contact } from '@/app/core/types';
import { requestFeedback } from '@/app/features/quality-rating/service';
import { FeedbackRequestInput } from '@/app/features/quality-rating/types';

interface RequestFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: Contact[];
  isPremium: boolean;
}

const RequestFeedbackModal: React.FC<RequestFeedbackModalProps> = ({
  visible,
  onClose,
  contacts,
  isPremium,
}) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string>(
    'I value your opinion! Please take a moment to rate the quality of our interactions.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expirationDays, setExpirationDays] = useState<number>(14);
  
  // Toggle contact selection
  const toggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      // For free users, limit to 5 contacts per request
      if (!isPremium && selectedContactIds.length >= 5) {
        Alert.alert(
          'Selection Limit',
          'Free accounts can only request feedback from up to 5 contacts at once. Upgrade to premium for unlimited selections.',
          [{ text: 'OK' }]
        );
        return;
      }
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };
  
  // Handle submission
  const handleSubmit = async () => {
    if (selectedContactIds.length === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to request feedback from.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestData: FeedbackRequestInput = {
        contactIds: selectedContactIds,
        message: message,
        expirationDays: expirationDays,
      };
      
      await requestFeedback(requestData);
      
      Alert.alert(
        'Feedback Requested',
        `Your request has been sent to ${selectedContactIds.length} contact${selectedContactIds.length > 1 ? 's' : ''}.`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Error requesting feedback:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send feedback request. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset and close
  const handleClose = () => {
    setSelectedContactIds([]);
    setMessage('I value your opinion! Please take a moment to rate the quality of our interactions.');
    setExpirationDays(14);
    onClose();
  };
  
  // Format explanation message about anonymous feedback
  const getInfoMessage = () => (
    <Text style={styles.infoText}>
      Ratings are anonymous by default. Recipients can choose to reveal their identity.
      {!isPremium && ' Free accounts are limited to 3 requests per month and 5 contacts per request.'}
    </Text>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Request Connection Feedback</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {/* Info Message */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={24} color={COLORS.INFO} style={styles.infoIcon} />
              {getInfoMessage()}
            </View>
            
            {/* Message Input */}
            <Text style={styles.sectionTitle}>Customize your message (optional)</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter a personal message..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              multiline
              maxLength={250}
            />
            <Text style={styles.charCount}>{message.length}/250</Text>
            
            {/* Expiration Selector */}
            <Text style={styles.sectionTitle}>Request expires after</Text>
            <View style={styles.expirationOptions}>
              {[7, 14, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.expirationOption,
                    expirationDays === days && styles.selectedExpirationOption
                  ]}
                  onPress={() => setExpirationDays(days)}
                >
                  <Text 
                    style={[
                      styles.expirationText,
                      expirationDays === days && styles.selectedExpirationText
                    ]}
                  >
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Contact Selection */}
            <Text style={styles.sectionTitle}>
              Select contacts {!isPremium && `(${selectedContactIds.length}/5)`}
            </Text>
            {contacts.length === 0 ? (
              <Text style={styles.noContactsText}>No contacts available</Text>
            ) : (
              <View style={styles.contactsList}>
                {contacts.map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={[
                      styles.contactItem,
                      selectedContactIds.includes(contact.id) && styles.selectedContactItem
                    ]}
                    onPress={() => toggleContact(contact.id)}
                  >
                    <View style={styles.contactInfo}>
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactInitials}>
                          {contact.contactName.charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.contactName}>{contact.contactName}</Text>
                    </View>
                    <Ionicons
                      name={selectedContactIds.includes(contact.id) ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={selectedContactIds.includes(contact.id) ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Text style={styles.selectionCount}>
              {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (selectedContactIds.length === 0 || isLoading) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={selectedContactIds.length === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
              ) : (
                <Text style={styles.submitButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.LARGE,
    ...EFFECTS.SHADOW_MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.TEXT,
  },
  content: {
    padding: SPACING.MEDIUM,
    maxHeight: '70%',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.INFO + '10',
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  infoIcon: {
    marginRight: SPACING.SMALL,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    marginTop: SPACING.MEDIUM,
  },
  messageInput: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    padding: SPACING.MEDIUM,
    color: COLORS.TEXT,
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: FONT_SIZES.MEDIUM,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
  expirationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  expirationOption: {
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedExpirationOption: {
    backgroundColor: COLORS.PRIMARY + '20',
  },
  expirationText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  selectedExpirationText: {
    color: COLORS.PRIMARY,
  },
  contactsList: {
    marginTop: SPACING.SMALL,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.SMALL,
  },
  selectedContactItem: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SMALL,
  },
  contactInitials: {
    color: COLORS.CARD,
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.BOLD,
  },
  contactName: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.MEDIUM,
    color: COLORS.TEXT,
  },
  noContactsText: {
    fontSize: FONT_SIZES.MEDIUM,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  selectionCount: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.ROUND,
  },
  disabledButton: {
    backgroundColor: COLORS.TEXT_DISABLED,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONT_FAMILIES.SEMIBOLD,
    color: COLORS.BACKGROUND,
  },
});

export default RequestFeedbackModal; 