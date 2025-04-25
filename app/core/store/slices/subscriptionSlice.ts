import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionService, Subscription, PlanDetails } from '../../services/SubscriptionService';

// Types
interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  availablePlans: Record<string, PlanDetails>;
  isPremium: boolean;
  checkoutUrl: string | null;
  contactLimitReached: boolean;
}

// Async thunks
export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const subscription = await SubscriptionService.getCurrentSubscription();
      return subscription;
    } catch (error) {
      return rejectWithValue('Failed to fetch subscription');
    }
  }
);

export const startFreeTrial = createAsyncThunk(
  'subscription/startFreeTrial',
  async (_, { rejectWithValue }) => {
    try {
      const success = await SubscriptionService.startFreeTrial();
      
      if (!success) {
        return rejectWithValue('Failed to start free trial');
      }
      
      return await SubscriptionService.getCurrentSubscription();
    } catch (error) {
      return rejectWithValue('Failed to start free trial');
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckoutSession',
  async (planId: 'premium_monthly' | 'premium_yearly', { rejectWithValue }) => {
    try {
      const checkoutUrl = await SubscriptionService.createCheckoutSession(planId);
      
      if (!checkoutUrl) {
        return rejectWithValue('Failed to create checkout session');
      }
      
      return checkoutUrl;
    } catch (error) {
      return rejectWithValue('Failed to create checkout session');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const success = await SubscriptionService.cancelSubscription();
      
      if (!success) {
        return rejectWithValue('Failed to cancel subscription');
      }
      
      return await SubscriptionService.getCurrentSubscription();
    } catch (error) {
      return rejectWithValue('Failed to cancel subscription');
    }
  }
);

export const checkContactLimit = createAsyncThunk(
  'subscription/checkContactLimit',
  async (additionalContacts = 1, { rejectWithValue }) => {
    try {
      const wouldExceed = await SubscriptionService.wouldExceedContactLimit(additionalContacts);
      return wouldExceed;
    } catch (error) {
      return rejectWithValue('Failed to check contact limit');
    }
  }
);

// Initial state
const initialState: SubscriptionState = {
  subscription: null,
  isLoading: false,
  error: null,
  availablePlans: SubscriptionService.plans,
  isPremium: false,
  checkoutUrl: null,
  contactLimitReached: false
};

// Slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearCheckoutUrl: (state) => {
      state.checkoutUrl = null;
    },
    resetContactLimitFlag: (state) => {
      state.contactLimitReached = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
        
        // Update premium status
        if (action.payload) {
          state.isPremium = (
            action.payload.plan === 'PREMIUM' && 
            (action.payload.status === 'active' || action.payload.status === 'trialing')
          );
        } else {
          state.isPremium = false;
        }
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Start free trial
      .addCase(startFreeTrial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startFreeTrial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
        state.isPremium = true;
      })
      .addCase(startFreeTrial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkoutUrl = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
        state.isPremium = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Check contact limit
      .addCase(checkContactLimit.fulfilled, (state, action) => {
        state.contactLimitReached = action.payload;
      });
  }
});

export const { clearCheckoutUrl, resetContactLimitFlag } = subscriptionSlice.actions;

export default subscriptionSlice.reducer; 