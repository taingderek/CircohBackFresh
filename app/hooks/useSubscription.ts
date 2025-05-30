import { useState, useEffect } from 'react';
import { supabase } from '../core/services/supabaseClient';
import { useAuth } from './useAuth';

export interface SubscriptionState {
  isPremium: boolean;
  planId: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    planId: null,
    expiresAt: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setState({
        isPremium: false,
        planId: null,
        expiresAt: null,
        loading: false,
        error: null
      });
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const now = new Date();
          const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
          const isActive = expiresAt ? expiresAt > now : false;

          setState({
            isPremium: isActive && data.status === 'active',
            planId: data.plan_id,
            expiresAt: data.expires_at,
            loading: false,
            error: null
          });
        } else {
          setState({
            isPremium: false,
            planId: null,
            expiresAt: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        setState({
          isPremium: false,
          planId: null,
          expiresAt: null,
          loading: false,
          error: error.message
        });
      }
    };

    fetchSubscription();
  }, [user]);

  return {
    isPremium: state.isPremium,
    planId: state.planId,
    expiresAt: state.expiresAt,
    loading: state.loading,
    error: state.error
  };
}; 