import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'free' | 'pro';

export interface FeatureLimits {
  careerAnalysis: number; // -1 for unlimited
  projectIdeas: number;
  canEditRoadmaps: boolean;
  canExport: boolean;
  canUseAdvancedJobs: boolean;
  canEnhanceResume: boolean;
  canUseMindMaps: boolean;
  canUseAISearch: boolean;
}

const FREE_LIMITS: FeatureLimits = {
  careerAnalysis: 3,
  projectIdeas: 10,
  canEditRoadmaps: false,
  canExport: false,
  canUseAdvancedJobs: false,
  canEnhanceResume: false,
  canUseMindMaps: false,
  canUseAISearch: false,
};

const PRO_LIMITS: FeatureLimits = {
  careerAnalysis: -1, // unlimited
  projectIdeas: -1, // unlimited
  canEditRoadmaps: true,
  canExport: true,
  canUseAdvancedJobs: true,
  canEnhanceResume: true,
  canUseMindMaps: true,
  canUseAISearch: true,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState<Record<string, number>>({});

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setTier('free');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Check if subscription is still valid
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setTier('free');
        } else {
          setTier(data.tier as SubscriptionTier);
        }
      } else {
        // Create default free subscription if it doesn't exist
        await supabase
          .from('user_subscriptions')
          .insert({ user_id: user.id, tier: 'free' });
        setTier('free');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setTier('free');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUsageCount = useCallback(async (feature: string) => {
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('date_bucket', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      
      const currentCount = count || 0;
      setUsageCount(prev => ({ ...prev, [feature]: currentCount }));
      return currentCount;
    } catch (error) {
      console.error('Error fetching usage count:', error);
      return 0;
    }
  }, [user]);

  const recordUsage = useCallback(async (feature: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          feature,
          date_bucket: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
      
      // Update local count
      setUsageCount(prev => ({
        ...prev,
        [feature]: (prev[feature] || 0) + 1,
      }));
      
      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      return false;
    }
  }, [user]);

  const checkFeatureAccess = useCallback(async (
    feature: keyof FeatureLimits,
    featureName?: string
  ): Promise<{ allowed: boolean; remaining?: number; message?: string }> => {
    const limits = tier === 'pro' ? PRO_LIMITS : FREE_LIMITS;
    const limit = limits[feature];

    // Boolean features
    if (typeof limit === 'boolean') {
      if (!limit) {
        return {
          allowed: false,
          message: `${featureName || feature} is a Pro feature. Upgrade to access!`,
        };
      }
      return { allowed: true };
    }

    // Numeric limits
    if (limit === -1) {
      return { allowed: true }; // Unlimited
    }

    const currentUsage = await fetchUsageCount(featureName || feature);
    
    if (currentUsage >= limit) {
      return {
        allowed: false,
        remaining: 0,
        message: `You've reached your daily limit of ${limit} ${featureName || feature}. Upgrade to Pro for unlimited access!`,
      };
    }

    return {
      allowed: true,
      remaining: limit - currentUsage,
    };
  }, [tier, fetchUsageCount]);

  const isPro = tier === 'pro';
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    tier,
    isPro,
    loading,
    limits,
    usageCount,
    checkFeatureAccess,
    recordUsage,
    fetchUsageCount,
    refetch: fetchSubscription,
  };
};
