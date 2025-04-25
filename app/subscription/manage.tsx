import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { cancelSubscription } from '../../services/api';

export default function ManageSubscriptionScreen() {
  const { user } = useAuth();
  const { userData, subscription, refreshUserData } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Mock data - in a real app, this would come from your backend
  const subscriptionDetails = {
    planName: subscription?.plan_id === 'yearly_premium' ? 'Yearly Premium' : 'Monthly Premium',
    price: subscription?.plan_id === 'yearly_premium' ? '$49.99/year' : '$4.99/month',
    startDate: subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'Unknown',
    renewDate: subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Unknown',
    status: subscription?.status || 'active',
    autoRenew: subscription?.auto_renew || true
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: confirmCancellation }
      ]
    );
  };

  const confirmCancellation = async () => {
    if (!user || !subscription) return;
    
    try {
      setLoading(true);
      await cancelSubscription(user.id);
      await refreshUserData();
      
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription has been cancelled. You will have access to premium features until the end of your current billing period.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!user || !subscription) return;
    
    try {
      setLoading(true);
      
      // In a real app, this would call your backend API
      // For now, we'll just show an alert
      Alert.alert(
        'Auto-Renew Updated',
        `Auto-renewal has been ${subscriptionDetails.autoRenew ? 'disabled' : 'enabled'}.`,
        [{ text: 'OK' }]
      );
      
      await refreshUserData();
    } catch (error) {
      console.error('Error updating auto-renew:', error);
      Alert.alert('Error', 'Failed to update auto-renewal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Manage Subscription' }} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{subscriptionDetails.planName}</Text>
              <Text style={styles.planPrice}>{subscriptionDetails.price}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{subscriptionDetails.startDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing Date</Text>
            <Text style={styles.detailValue}>{subscriptionDetails.renewDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>•••• 4242</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Auto-Renew</Text>
            <View style={styles.toggleContainer}>
              <Text style={subscriptionDetails.autoRenew ? styles.enabledText : styles.disabledText}>
                {subscriptionDetails.autoRenew ? 'Enabled' : 'Disabled'}
              </Text>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={handleToggleAutoRenew}
              >
                <Text style={styles.toggleButtonText}>
                  {subscriptionDetails.autoRenew ? 'Turn Off' : 'Turn On'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Benefits</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Unlimited contacts</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Custom reminder schedules</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Contact categories & prioritization</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Relationship health insights</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <FontAwesome name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Contact history & notes</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert(
              'Update Payment Method', 
              'This feature is not available in the demo version.'
            )}
          >
            <FontAwesome name="credit-card" size={16} color="#2196F3" style={styles.actionIcon} />
            <Text style={styles.actionText}>Update Payment Method</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/contact-support' as any)}
          >
            <FontAwesome name="life-ring" size={16} color="#2196F3" style={styles.actionIcon} />
            <Text style={styles.actionText}>Get Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelSubscription}
          >
            <FontAwesome name="times-circle" size={16} color="#F44336" style={styles.actionIcon} />
            <Text style={[styles.actionText, styles.cancelText]}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enabledText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 8,
  },
  disabledText: {
    color: '#F44336',
    fontWeight: '500',
    marginRight: 8,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  toggleButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionIcon: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    borderBottomWidth: 0,
  },
  cancelText: {
    color: '#F44336',
  },
}); 