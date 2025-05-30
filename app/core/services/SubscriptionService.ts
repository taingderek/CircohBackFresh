import { supabase } from '../services/supabaseClient';
import { store } from '../store';
import { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } from '@env';

// Types
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: 'FREE' | 'PREMIUM';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanDetails {
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

class SubscriptionServiceClass {
  private API_URL = 'https://api.stripe.com/v1';
  
  // Available plans
  public plans: Record<string, PlanDetails> = {
    'premium_monthly': {
      name: 'Premium Monthly',
      price: 7.99,
      interval: 'month',
      features: [
        'Unlimited contacts',
        'Unlimited messaging',
        'All AI tones',
        'Advanced analytics',
        'Historical data'
      ]
    },
    'premium_yearly': {
      name: 'Premium Yearly',
      price: 59.99,
      interval: 'year',
      features: [
        'Unlimited contacts',
        'Unlimited messaging',
        'All AI tones',
        'Advanced analytics',
        'Historical data',
        '37% savings compared to monthly'
      ]
    }
  };
  
  // Get current user's subscription
  public async getCurrentSubscription(): Promise<Subscription | null> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    // Transform data to match interface
    return this.transformSubscriptionData(data);
  }
  
  // Transform database subscription data to interface format
  private transformSubscriptionData(data: any): Subscription {
    return {
      id: data.id,
      userId: data.user_id,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      plan: data.plan,
      status: data.status,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  // Check if user has active premium subscription
  public async hasPremiumSubscription(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    
    if (!subscription) {
      return false;
    }
    
    return (
      subscription.plan === 'PREMIUM' && 
      (subscription.status === 'active' || subscription.status === 'trialing')
    );
  }
  
  // Check if feature is available for current user
  public async isFeatureAvailable(feature: 'unlimited_contacts' | 'all_tones' | 'unlimited_messaging' | 'advanced_analytics'): Promise<boolean> {
    // These features are only available for premium subscribers
    const premiumOnly = [
      'unlimited_contacts',
      'all_tones', 
      'unlimited_messaging', 
      'advanced_analytics'
    ];
    
    if (premiumOnly.includes(feature)) {
      return this.hasPremiumSubscription();
    }
    
    // If not in premium-only list, feature is available for all users
    return true;
  }
  
  // Start free trial
  public async startFreeTrial(): Promise<boolean> {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if user already has a subscription
    const existingSubscription = await this.getCurrentSubscription();
    if (existingSubscription) {
      console.error('User already has a subscription');
      return false;
    }
    
    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    // Create subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: 'PREMIUM',
        status: 'trialing',
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString()
      })
      .select('*')
      .single();
    
    if (error || !data) {
      console.error('Error starting free trial:', error);
      return false;
    }
    
    // Also update user profile
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'PREMIUM',
        trial_end: trialEndDate.toISOString()
      })
      .eq('id', userId);
    
    return true;
  }
  
  // Create payment session with Stripe
  public async createCheckoutSession(planId: 'premium_monthly' | 'premium_yearly'): Promise<string | null> {
    const state = store.getState();
    const user = state.auth.user;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Here you would implement the actual Stripe integration
    // For now, we'll just simulate the process
    
    try {
      // In a real implementation, you would make API calls to your backend
      // which would then create a Stripe Checkout session
      
      console.log(`Created checkout session for plan: ${planId}`);
      
      // This would return the Stripe Checkout URL
      return `https://checkout.stripe.com/c/pay/${planId}_${Date.now()}`;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }
  
  // Cancel subscription
  public async cancelSubscription(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      console.error('No active subscription to cancel');
      return false;
    }
    
    try {
      // Here you would implement the actual Stripe cancellation
      // For now, we'll just update the database
      
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (error) {
        console.error('Error canceling subscription in database:', error);
        return false;
      }
      
      // Also update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'FREE'
        })
        .eq('id', subscription.userId);
      
      if (profileError) {
        console.error('Error updating profile subscription status:', profileError);
      }
      
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }
  
  // Check if contact limit would be exceeded
  public async wouldExceedContactLimit(additionalContacts = 1): Promise<boolean> {
    const isPremium = await this.hasPremiumSubscription();
    
    // Premium users have unlimited contacts
    if (isPremium) {
      return false;
    }
    
    // Free users are limited to 25 contacts
    const FREE_CONTACT_LIMIT = 25;
    
    // Count current contacts
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', store.getState().auth.user?.id);
    
    if (error) {
      console.error('Error counting contacts:', error);
      return true; // Assume limit would be exceeded if there's an error
    }
    
    // Check if adding more contacts would exceed the limit
    return (count || 0) + additionalContacts > FREE_CONTACT_LIMIT;
  }
  
  // Handle webhook event from Stripe
  public async handleWebhookEvent(event: any): Promise<boolean> {
    // This would be implemented on your backend to handle Stripe webhook events
    // For completeness, here's what it would look like
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          break;
          
        case 'customer.subscription.updated':
          // Handle subscription updates
          break;
          
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return false;
    }
  }
}

export const SubscriptionService = new SubscriptionServiceClass();
export default SubscriptionService; 