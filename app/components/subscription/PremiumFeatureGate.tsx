import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../core/store';
import { createCheckoutSession, clearCheckoutUrl } from '../../core/store/slices/subscriptionSlice';
import { Linking } from 'react-native';

type PremiumFeatureGateProps = {
  children: React.ReactNode;
  feature: 'unlimited_contacts' | 'all_tones' | 'unlimited_messaging' | 'advanced_analytics';
  fallback?: React.ReactNode;
};

export default function PremiumFeatureGate({ 
  children, 
  feature,
  fallback
}: PremiumFeatureGateProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const isPremium = useSelector((state: RootState) => state.subscription.isPremium);
  const isLoading = useSelector((state: RootState) => state.subscription.isLoading);
  const checkoutUrl = useSelector((state: RootState) => state.subscription.checkoutUrl);
  const plans = useSelector((state: RootState) => state.subscription.availablePlans);
  
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  
  // Handle checkout URL when it's available
  useEffect(() => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl).catch((err) => {
        console.error('Error opening checkout URL:', err);
      });
      
      // Clear the URL after opening it
      dispatch(clearCheckoutUrl());
    }
  }, [checkoutUrl, dispatch]);
  
  // If user is premium, just render the children
  if (isPremium) {
    return <>{children}</>;
  }
  
  // If a fallback is provided, render that instead for non-premium users
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Otherwise show upgrade prompt and modal
  const handleUpgradePress = () => {
    setUpgradeModalVisible(true);
  };
  
  const handlePlanSelect = (planId: 'premium_monthly' | 'premium_yearly') => {
    dispatch(createCheckoutSession(planId));
    setUpgradeModalVisible(false);
  };
  
  // Get feature title and description
  const getFeatureInfo = () => {
    switch (feature) {
      case 'unlimited_contacts':
        return {
          title: 'Unlimited Contacts',
          description: 'Premium users can add unlimited contacts. Upgrade to remove the 25 contact limit!'
        };
      case 'all_tones':
        return {
          title: 'Premium Message Tones',
          description: 'Upgrade to access all message tones: Celebratory, Empathetic, Romantic, Professional, and Custom.'
        };
      case 'unlimited_messaging':
        return {
          title: 'Unlimited AI Messages',
          description: 'Premium users can generate unlimited AI messages without weekly quotas.'
        };
      case 'advanced_analytics':
        return {
          title: 'Advanced Analytics',
          description: 'Upgrade to see detailed insights about your relationship maintenance patterns.'
        };
      default:
        return {
          title: 'Premium Feature',
          description: 'This feature is only available to premium subscribers.'
        };
    }
  };
  
  const featureInfo = getFeatureInfo();
  
  return (
    <View style={styles.container}>
      <View style={styles.upgradeContainer}>
        <Text style={styles.featureTitle}>{featureInfo.title}</Text>
        <Text style={styles.featureDescription}>{featureInfo.description}</Text>
        
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={handleUpgradePress}
          disabled={isLoading}
        >
          <Text style={styles.upgradeButtonText}>
            {isLoading ? 'Loading...' : 'Upgrade to Premium'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Subscription Plan Modal */}
      <Modal
        visible={upgradeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose a Plan</Text>
            
            <View style={styles.planContainer}>
              <TouchableOpacity 
                style={styles.planCard}
                onPress={() => handlePlanSelect('premium_monthly')}
              >
                <Text style={styles.planName}>{plans.premium_monthly.name}</Text>
                <Text style={styles.planPrice}>${plans.premium_monthly.price}/month</Text>
                <View style={styles.planFeatures}>
                  {plans.premium_monthly.features.map((feature, index) => (
                    <Text key={index} style={styles.planFeatureItem}>• {feature}</Text>
                  ))}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.planCard, styles.bestValueCard]}
                onPress={() => handlePlanSelect('premium_yearly')}
              >
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>Best Value</Text>
                </View>
                <Text style={styles.planName}>{plans.premium_yearly.name}</Text>
                <Text style={styles.planPrice}>${plans.premium_yearly.price}/year</Text>
                <View style={styles.planFeatures}>
                  {plans.premium_yearly.features.map((feature, index) => (
                    <Text key={index} style={styles.planFeatureItem}>• {feature}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setUpgradeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  upgradeContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(50, 255, 165, 0.3)',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#32FFA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  planContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 176, 176, 0.2)',
  },
  bestValueCard: {
    borderColor: '#32FFA5',
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#32FFA5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  bestValueText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    color: '#32FFA5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planFeatures: {
    marginTop: 8,
  },
  planFeatureItem: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 6,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#B0B0B0',
    fontSize: 16,
  },
}); 