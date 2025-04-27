import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { addSubscription } from '../../services/api';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const { isPremium } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  // Plans details
  const plans = {
    monthly: { 
      id: 'monthly_premium', 
      name: 'Monthly Premium', 
      price: '$4.99', 
      period: 'month', 
      features: [
        'Unlimited contacts',
        'Daily reminder frequency',
        'Contact categories',
        'Export and backup',
        'Premium support'
      ]
    },
    yearly: { 
      id: 'yearly_premium', 
      name: 'Yearly Premium', 
      price: '$49.99', 
      period: 'year',
      discount: 'Save 16%',
      features: [
        'All monthly features',
        'Priority support',
        'Advanced analytics',
        'Early access to new features'
      ]
    }
  };

  // Handle subscription purchase
  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // In a real app, this would integrate with your payment processor
      // For now, we'll simulate a successful subscription
      const plan = plans[selectedPlan];
      
      // Mock subscription data
      const subscriptionData = {
        plan_id: plan.id,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        auto_renew: true
      };
      
      await addSubscription(user.id, subscriptionData);
      
      Alert.alert(
        'Subscription Activated',
        `You are now subscribed to ${plan.name}. Thank you for your support!`,
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/settings/' as any) 
          }
        ]
      );
    } catch (error) {
      console.error('Error processing subscription:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // If user is already premium, redirect to manage subscription
  if (isPremium) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Premium Subscription' }} />
        
        <View style={styles.centeredContainer}>
          <FontAwesome name="check-circle" size={60} color="#4CAF50" style={styles.premiumIcon} />
          <Text style={styles.premiumTitle}>You're a Premium Member!</Text>
          <Text style={styles.premiumMessage}>
            You already have an active premium subscription with all features unlocked.
          </Text>
          
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => router.push('/subscription/manage' as any)}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Upgrade to Premium' }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Unlock All Features</Text>
          <Text style={styles.headerSubtitle}>
            Choose a plan to get unlimited contacts and premium features
          </Text>
        </View>
        
        <View style={styles.plansContainer}>
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={[
              styles.planCard, 
              selectedPlan === 'monthly' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plans.monthly.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plans.monthly.price}</Text>
                <Text style={styles.planPeriod}>/{plans.monthly.period}</Text>
              </View>
            </View>
            
            <View style={styles.featuresContainer}>
              {plans.monthly.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <FontAwesome name="check" size={14} color="#4CAF50" style={styles.featureIcon} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            {selectedPlan === 'monthly' && (
              <View style={styles.selectedIndicator}>
                <FontAwesome name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
          
          {/* Yearly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard, 
              selectedPlan === 'yearly' && styles.selectedPlan,
              styles.bestValuePlan
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plans.yearly.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plans.yearly.price}</Text>
                <Text style={styles.planPeriod}>/{plans.yearly.period}</Text>
              </View>
              <Text style={styles.discountText}>{plans.yearly.discount}</Text>
            </View>
            
            <View style={styles.featuresContainer}>
              {plans.yearly.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <FontAwesome name="check" size={14} color="#4CAF50" style={styles.featureIcon} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            {selectedPlan === 'yearly' && (
              <View style={styles.selectedIndicator}>
                <FontAwesome name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.loadingButton]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              Subscribe Now
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Subscriptions automatically renew until canceled.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPlan: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  bestValuePlan: {
    position: 'relative',
    paddingTop: 32,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  bestValueText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  planPeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
  discountText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 4,
  },
  featuresContainer: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  loadingButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  premiumIcon: {
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  manageButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  manageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
}); 