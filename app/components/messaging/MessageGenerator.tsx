import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  ScrollView,
  Keyboard,
  Share,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../core/store';
import { MessageTone } from '../../core/services/AIService';
import { generateMessage, clearGeneratedMessage, saveMessage } from '../../core/store/slices/messagingSlice';
import { fetchQuota } from '../../core/store/slices/messagingSlice';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';
import { Ionicons } from '@expo/vector-icons';

type MessageGeneratorProps = {
  contactId: string;
  contactName: string;
  lastContacted?: string;
  notes?: string;
  onClose?: () => void;
};

export default function MessageGenerator({ 
  contactId,
  contactName,
  lastContacted,
  notes,
  onClose
}: MessageGeneratorProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const isPremium = useSelector((state: RootState) => state.subscription.isPremium);
  const { 
    generateStatus, 
    currentGeneratedMessage, 
    error,
    quotaRemaining,
    quotaTotal
  } = useSelector((state: RootState) => state.messaging);
  
  const [selectedTone, setSelectedTone] = useState<MessageTone>('casual');
  const [customPrompt, setCustomPrompt] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Load quota information when component mounts
  useEffect(() => {
    dispatch(fetchQuota());
  }, [dispatch]);
  
  // Update edited message when new message is generated
  useEffect(() => {
    if (currentGeneratedMessage) {
      setEditedMessage(currentGeneratedMessage);
    }
  }, [currentGeneratedMessage]);
  
  // Define available tones and their display properties
  const tones: { id: MessageTone; label: string; icon: string; isPremium: boolean }[] = [
    { id: 'casual', label: 'Casual', icon: 'chatbubble-outline', isPremium: false },
    { id: 'caring', label: 'Caring', icon: 'heart-outline', isPremium: false },
    { id: 'celebratory', label: 'Celebratory', icon: 'gift-outline', isPremium: true },
    { id: 'empathetic', label: 'Empathetic', icon: 'people-outline', isPremium: true },
    { id: 'romantic', label: 'Romantic', icon: 'rose-outline', isPremium: true },
    { id: 'professional', label: 'Professional', icon: 'briefcase-outline', isPremium: true },
    { id: 'custom', label: 'Custom', icon: 'create-outline', isPremium: true },
  ];
  
  // Handle tone selection
  const handleToneSelect = (tone: MessageTone) => {
    // Check if tone is premium and user is not premium
    if (tones.find(t => t.id === tone)?.isPremium && !isPremium) {
      // Don't select the tone, premium gate will handle showing upgrade UI
      return;
    }
    setSelectedTone(tone);
    // Clear custom prompt if not custom tone
    if (tone !== 'custom') {
      setCustomPrompt('');
    }
  };
  
  // Generate message
  const handleGenerateMessage = () => {
    Keyboard.dismiss();
    
    dispatch(generateMessage({
      contactId,
      contactName,
      lastContacted,
      notes,
      tone: selectedTone,
      customPrompt: selectedTone === 'custom' ? customPrompt : undefined
    }));
  };
  
  // Copy message to clipboard
  const handleCopyMessage = async () => {
    try {
      await Share.share({
        message: editedMessage
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error sharing message');
    }
  };
  
  // Save message
  const handleSaveMessage = () => {
    if (!editedMessage.trim()) return;
    
    dispatch(saveMessage({
      contactId,
      content: editedMessage,
      tone: selectedTone,
      generated: true,
      sent: false
    }));
    
    // Show confirmation and close
    Alert.alert('Message saved');
    
    if (onClose) {
      onClose();
    }
  };
  
  // Reset message generation
  const handleReset = () => {
    dispatch(clearGeneratedMessage());
    setEditedMessage('');
  };
  
  // Render tone selection button
  const renderToneButton = (tone: { id: MessageTone; label: string; icon: string; isPremium: boolean }) => {
    const isSelected = selectedTone === tone.id;
    
    // For premium tones, wrap in PremiumFeatureGate
    if (tone.isPremium) {
      return (
        <PremiumFeatureGate
          key={tone.id}
          feature="all_tones"
          fallback={
            <TouchableOpacity 
              style={[styles.toneButton, styles.premiumToneButton]} 
              onPress={() => handleToneSelect(tone.id)}
            >
              <Ionicons name={tone.icon as any} size={18} color="#32FFA5" />
              <Text style={styles.toneButtonText}>{tone.label}</Text>
              <Ionicons name="lock-closed" size={14} color="#32FFA5" />
            </TouchableOpacity>
          }
        >
          <TouchableOpacity 
            style={[
              styles.toneButton, 
              isSelected && styles.selectedToneButton
            ]} 
            onPress={() => handleToneSelect(tone.id)}
          >
            <Ionicons 
              name={tone.icon as any} 
              size={18} 
              color={isSelected ? '#121212' : '#FFFFFF'} 
            />
            <Text 
              style={[
                styles.toneButtonText, 
                isSelected && styles.selectedToneButtonText
              ]}
            >
              {tone.label}
            </Text>
          </TouchableOpacity>
        </PremiumFeatureGate>
      );
    }
    
    // For free tones, no gate needed
    return (
      <TouchableOpacity 
        key={tone.id}
        style={[
          styles.toneButton, 
          isSelected && styles.selectedToneButton
        ]} 
        onPress={() => handleToneSelect(tone.id)}
      >
        <Ionicons 
          name={tone.icon as any} 
          size={18} 
          color={isSelected ? '#121212' : '#FFFFFF'} 
        />
        <Text 
          style={[
            styles.toneButtonText, 
            isSelected && styles.selectedToneButtonText
          ]}
        >
          {tone.label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Message Generator</Text>
        <Text style={styles.subtitle}>Create a message for {contactName}</Text>
      </View>
      
      {/* Tone Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Tone</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tonesContainer}
        >
          {tones.map(tone => renderToneButton(tone))}
        </ScrollView>
      </View>
      
      {/* Custom Prompt (only shown for custom tone) */}
      {selectedTone === 'custom' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Instructions</Text>
          <TextInput
            style={styles.customPromptInput}
            placeholder="E.g., Write a message asking to reschedule our coffee meeting"
            placeholderTextColor="#707070"
            value={customPrompt}
            onChangeText={setCustomPrompt}
            multiline
          />
        </View>
      )}
      
      {/* Quota Information */}
      {!isPremium && quotaRemaining !== null && (
        <View style={styles.quotaContainer}>
          <Text style={styles.quotaText}>
            {quotaRemaining} of {quotaTotal} messages remaining this week
          </Text>
          <TouchableOpacity>
            <Text style={styles.upgradeText}>Upgrade for unlimited</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Generate Button */}
      <View style={styles.generateButtonContainer}>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateMessage}
          disabled={generateStatus === 'loading' || (selectedTone === 'custom' && !customPrompt.trim())}
        >
          {generateStatus === 'loading' ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Message</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Generated Message */}
      {currentGeneratedMessage && (
        <View style={styles.messageContainer}>
          <TextInput
            style={styles.messageInput}
            value={editedMessage}
            onChangeText={setEditedMessage}
            multiline
            placeholder="Your message will appear here..."
            placeholderTextColor="#707070"
          />
          
          <View style={styles.messageActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color="#B0B0B0" />
              <Text style={styles.actionButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCopyMessage}
            >
              <Ionicons name="share-outline" size={20} color="#B0B0B0" />
              <Text style={styles.actionButtonText}>
                {isCopied ? 'Copied!' : 'Share'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveMessage}
            >
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Close Button */}
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tonesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  toneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedToneButton: {
    backgroundColor: '#32FFA5',
  },
  premiumToneButton: {
    borderWidth: 1,
    borderColor: '#32FFA5',
    backgroundColor: 'transparent',
  },
  toneButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    marginRight: 2,
  },
  selectedToneButtonText: {
    color: '#121212',
    fontWeight: '600',
  },
  customPromptInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quotaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(190, 147, 253, 0.1)',
    borderRadius: 8,
    margin: 16,
  },
  quotaText: {
    color: '#BE93FD',
    fontSize: 14,
  },
  upgradeText: {
    color: '#32FFA5',
    fontSize: 14,
    fontWeight: '600',
  },
  generateButtonContainer: {
    padding: 16,
  },
  generateButton: {
    backgroundColor: '#32FFA5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 85, 0.3)',
  },
  errorText: {
    color: '#FF5555',
    fontSize: 14,
  },
  messageContainer: {
    margin: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageInput: {
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  messageActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    padding: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#B0B0B0',
    marginLeft: 4,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2A2A2A',
    marginLeft: 'auto',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginVertical: 16,
  },
  closeButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
  },
}); 