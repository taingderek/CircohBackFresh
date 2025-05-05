import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS } from '@/app/core/constants/theme';

// Support ticket issue categories
const ISSUE_CATEGORIES = [
  { label: 'Account Issues', value: 'account' },
  { label: 'Subscription Problems', value: 'subscription' },
  { label: 'App Performance', value: 'performance' },
  { label: 'Contact Management', value: 'contacts' },
  { label: 'Reminders Not Working', value: 'reminders' },
  { label: 'AI Message Generation', value: 'ai_messages' },
  { label: 'Data Sync Issues', value: 'sync' },
  { label: 'Feature Request', value: 'feature_request' },
  { label: 'Other', value: 'other' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [issue, setIssue] = useState('');
  const [message, setMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle support ticket submission
  const handleSubmitTicket = async () => {
    // Validate inputs
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select an issue category');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, call your API to send the support ticket
      // await sendSupportTicket({
      //   category: selectedCategory,
      //   message: message,
      //   // You'd include user info here
      // });
      
      // Mock successful submission
      setTimeout(() => {
        Alert.alert(
          'Ticket Submitted',
          'Thank you for contacting support. We\'ll get back to you as soon as possible.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit support ticket. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle FAQ press
  const handleFAQPress = (question: string, answer: string) => {
    Alert.alert(question, answer);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Submit a Ticket Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.sectionDescription}>
            If you're experiencing issues or have questions, our support team is here to help.
            Please fill out the form below and we'll get back to you as soon as possible.
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Issue Category</Text>
            <DropDownPicker
              open={dropdownOpen}
              value={selectedCategory}
              items={ISSUE_CATEGORIES}
              setOpen={setDropdownOpen}
              setValue={setSelectedCategory}
              placeholder="Select a category"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.placeholderText}
              listItemLabelStyle={styles.listItemLabel}
              theme="DARK"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Describe Your Issue</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Please provide as much detail as possible..."
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]} 
            onPress={handleSubmitTicket}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.BLACK} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Ticket</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.supportEmailText}>
            You can also email us directly at:{' '}
            <Text style={styles.emailLink}>support@circohback.com</Text>
          </Text>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleFAQPress(
              'How do I create a reminder?',
              'To create a reminder, navigate to a contact\'s profile, tap on "Add Reminder", then select a frequency and optional message. The app will remind you to reach out according to your settings.'
            )}
          >
            <Text style={styles.faqQuestion}>How do I create a reminder?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleFAQPress(
              'How does the AI message generation work?',
              'Our AI message generation feature helps you create personalized messages for your contacts. Navigate to a contact, tap "Generate Message", select a tone and occasion, and our AI will craft a customized message that you can edit and send.'
            )}
          >
            <Text style={styles.faqQuestion}>How does the AI message generation work?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleFAQPress(
              'How do I cancel my subscription?',
              'To cancel your subscription, go to your device\'s subscription management settings. For iOS, go to Settings > Your Apple ID > Subscriptions. For Android, open the Google Play Store, tap your profile icon, and select Payments & subscriptions.'
            )}
          >
            <Text style={styles.faqQuestion}>How do I cancel my subscription?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleFAQPress(
              'Can I export my contacts?',
              'Yes, premium users can export their contacts and interaction history as a CSV file. Go to Settings > Data Export and tap "Export Contacts" to generate and download your data.'
            )}
          >
            <Text style={styles.faqQuestion}>Can I export my contacts?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleFAQPress(
              'Is my data secure?',
              'We take your privacy seriously. All data is encrypted both in transit and at rest. We do not sell your personal information or contact data to third parties. You can review our complete privacy policy in the app settings.'
            )}
          >
            <Text style={styles.faqQuestion}>Is my data secure?</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        {/* Help Center */}
        <TouchableOpacity 
          style={styles.helpCenterButton}
          onPress={() => Alert.alert(
            'Knowledge Base',
            'Our full knowledge base is coming soon. In the meantime, please contact support if you need assistance.'
          )}
        >
          <Ionicons name="book-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.helpCenterText}>Visit Knowledge Base</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SPACING.MEDIUM,
  },
  section: {
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
  },
  formGroup: {
    marginBottom: SPACING.MEDIUM,
  },
  label: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  dropdown: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.SMALL,
    marginBottom: dropdownOpen ? 120 : 0, // Add space when dropdown is open
  },
  dropdownContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderColor: COLORS.BORDER,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
  },
  placeholderText: {
    color: COLORS.GRAY,
  },
  listItemLabel: {
    color: COLORS.TEXT,
  },
  messageInput: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    color: COLORS.TEXT,
    fontSize: FONT_SIZES.MEDIUM,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    alignItems: 'center',
    marginVertical: SPACING.MEDIUM,
  },
  submitButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
  disabledButton: {
    opacity: 0.5,
  },
  supportEmailText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  emailLink: {
    color: COLORS.PRIMARY,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    flex: 1,
    paddingRight: SPACING.SMALL,
  },
  helpCenterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XLARGE,
  },
  helpCenterText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    marginLeft: SPACING.SMALL,
  },
}); 