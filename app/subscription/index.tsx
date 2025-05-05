import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_FAMILIES, BORDER_RADIUS, EFFECTS } from '@/app/core/constants/theme';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate subscription details
  const monthlyPrice = 7.99;
  const yearlyMonthlyPrice = 5.00;
  const yearlyPrice = yearlyMonthlyPrice * 12;
  const annualSavings = (monthlyPrice * 12) - yearlyPrice;
  const annualSavingsPercentage = Math.round((annualSavings / (monthlyPrice * 12)) * 100);

  // Handle subscription purchase
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // In a real app, call your payment processor
      // await purchaseSubscription(selectedPlan);
      
      // Mock purchase flow
      setTimeout(() => {
        Alert.alert(
          'Subscription Successful!',
          `Thank you for upgrading to CircohBack Premium ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} plan. Enjoy your enhanced experience!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
      setIsLoading(false);
    }
  };

  // Toggle plan selection
  const togglePlan = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
  };

  // Render feature row
  const renderFeature = (feature: string, isAvailable: boolean, isPremium: boolean = false) => (
    <View style={styles.featureRow}>
      <Ionicons 
        name={isAvailable ? "checkmark-circle" : "close-circle"} 
        size={20} 
        color={isAvailable ? (isPremium ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY) : COLORS.ERROR} 
      />
      <Text style={[
        styles.featureText, 
        !isAvailable && styles.featureUnavailable,
        isPremium && isAvailable && styles.premiumFeature
      ]}>
        {feature}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.title}>Premium Upgrade</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.premiumIcon}>
            <Ionicons name="diamond" size={40} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.heroTitle}>Unlock CircohBack Premium</Text>
          <Text style={styles.heroSubtitle}>
            Enhance your relationship management with advanced features
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.planSelector}>
          <TouchableOpacity 
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.selectedPlan
            ]}
            onPress={() => togglePlan('monthly')}
          >
            <Text style={[
              styles.planTitle,
              selectedPlan === 'monthly' && styles.selectedPlanTitle
            ]}>
              Monthly
            </Text>
            <Text style={[
              styles.planPrice,
              selectedPlan === 'monthly' && styles.selectedPlanTitle
            ]}>
              ${monthlyPrice.toFixed(2)}
            </Text>
            <Text style={[
              styles.planPriceSubtext,
              selectedPlan === 'monthly' && styles.selectedPlanTitle
            ]}>
              per month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.planOption,
              selectedPlan === 'yearly' && styles.selectedPlan,
              styles.yearlyPlan
            ]}
            onPress={() => togglePlan('yearly')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={[
              styles.planTitle,
              selectedPlan === 'yearly' && styles.selectedPlanTitle
            ]}>
              Annual
            </Text>
            <Text style={[
              styles.planPrice,
              selectedPlan === 'yearly' && styles.selectedPlanTitle
            ]}>
              ${yearlyMonthlyPrice.toFixed(2)}
            </Text>
            <Text style={[
              styles.planPriceSubtext,
              selectedPlan === 'yearly' && styles.selectedPlanTitle
            ]}>
              per month
            </Text>
            <Text style={styles.savingsText}>
              Save {annualSavingsPercentage}% (2 months free)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.summaryText}>
          {selectedPlan === 'monthly' 
            ? `$${monthlyPrice.toFixed(2)} will be charged monthly`
            : `$${yearlyPrice.toFixed(2)} will be charged annually (save $${annualSavings.toFixed(2)})`
          }
        </Text>

        {/* Features Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Features Comparison</Text>

          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonHeaderText}>Feature</Text>
            <Text style={styles.comparisonHeaderText}>Free</Text>
            <Text style={styles.comparisonHeaderText}>Premium</Text>
          </View>

          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Contact Import</Text>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Limited (50)</Text>
              </View>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Unlimited</Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Reminders</Text>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Basic</Text>
              </View>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Advanced</Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>AI Message Generation</Text>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>5/month</Text>
              </View>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Unlimited</Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Custom Categories</Text>
              <View style={styles.featureCell}>
                <Ionicons name="close" size={20} color={COLORS.ERROR} />
              </View>
              <View style={styles.featureCell}>
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Reminder Frequency</Text>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Basic</Text>
              </View>
              <View style={styles.featureCell}>
                <Text style={styles.featureCellText}>Custom</Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Detailed Analytics</Text>
              <View style={styles.featureCell}>
                <Ionicons name="close" size={20} color={COLORS.ERROR} />
              </View>
              <View style={styles.featureCell}>
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>CSV Export</Text>
              <View style={styles.featureCell}>
                <Ionicons name="close" size={20} color={COLORS.ERROR} />
              </View>
              <View style={styles.featureCell}>
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.featureLabel}>Interactive Timeline</Text>
              <View style={styles.featureCell}>
                <Ionicons name="close" size={20} color={COLORS.ERROR} />
              </View>
              <View style={styles.featureCell}>
                <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
              </View>
            </View>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity 
          style={[styles.subscribeButton, isLoading && styles.disabledButton]} 
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.BLACK} />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {`Subscribe to Premium ${selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms & Restoration */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service. Your subscription will auto-renew until canceled.
          </Text>
          <TouchableOpacity onPress={() => Alert.alert('Restore Purchases', 'If you previously purchased a subscription, tap OK to restore your purchase.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => console.log('Restore purchases') }
          ])}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
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
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.LARGE,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.CARD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    ...EFFECTS.GLOW_PRIMARY,
  },
  heroTitle: {
    fontSize: FONT_SIZES.XXXL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
  },
  planSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.LARGE,
  },
  planOption: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    marginHorizontal: SPACING.TINY,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: 'rgba(50, 255, 165, 0.1)', // Semi-transparent primary color
  },
  yearlyPlan: {
    position: 'relative',
    paddingTop: SPACING.XLARGE, // Extra space for the best value badge
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  bestValueText: {
    color: COLORS.BLACK,
    fontSize: FONT_SIZES.XS,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  selectedPlanTitle: {
    color: COLORS.PRIMARY,
  },
  planPrice: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  planPriceSubtext: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  savingsText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  summaryText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  comparisonSection: {
    marginBottom: SPACING.LARGE,
  },
  comparisonTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  comparisonHeaderText: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    flex: 1,
    textAlign: 'center',
  },
  comparisonTable: {
    marginTop: SPACING.SMALL,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  featureLabel: {
    flex: 2,
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT,
    paddingRight: SPACING.SMALL,
  },
  featureCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCellText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  featureSection: {
    marginBottom: SPACING.LARGE,
  },
  featureTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  featureText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT,
    marginLeft: SPACING.SMALL,
  },
  featureUnavailable: {
    color: COLORS.TEXT_DISABLED,
    textDecorationLine: 'line-through',
  },
  premiumFeature: {
    color: COLORS.PRIMARY,
  },
  subscribeButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.SMALL,
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  subscribeButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.MEDIUM,
  },
  disabledButton: {
    opacity: 0.5,
  },
  termsSection: {
    marginBottom: SPACING.XLARGE,
    alignItems: 'center',
  },
  termsText: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  restoreText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
}); 