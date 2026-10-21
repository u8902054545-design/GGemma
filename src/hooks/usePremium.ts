import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config';
import { useAuth } from './useAuth';

export interface QuotaItem {
  id: number | string;
  model_name: string;
  model_id?: string;
  is_paid?: boolean;
  daily_limit?: number;
  description?: string;
  created_at?: string;
  [key: string]: any;
}

export interface PremiumUserRecord {
  id?: string;
  user_id: string;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Built-in restricted models per user requirement
export const RESTRICTED_MODELS = [
  'Gemini 3.1 Pro Preview',
  'google/gemini-3.1-pro-preview',
  'Gemini 4 Argon',
  'google/gemini-4-argon'
];

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumUserRecord, setPremiumUserRecord] = useState<PremiumUserRecord | null>(null);
  const [quotas, setQuotas] = useState<QuotaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotaAndPremiumData = useCallback(async (isBackground: boolean = false) => {
    if (!user) {
      setIsPremium(false);
      setPremiumUserRecord(null);
      setQuotas([]);
      setLoading(false);
      return;
    }

    if (!isBackground) {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Load from "Premium_User" table
      let premiumData: any = null;
      const { data: pData1, error: pErr1 } = await supabase
        .from('Premium_User')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pData1) {
        premiumData = pData1;
      } else if (pErr1) {
        const { data: pData2 } = await supabase
          .from('Premium_User')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (pData2) premiumData = pData2;
      }

      if (premiumData) {
        setPremiumUserRecord(premiumData);
        const val = premiumData.is_premium ?? premiumData.status ?? premiumData.premium ?? premiumData.value;
        const premiumFlag = val === true || String(val).toLowerCase() === 'true' || val === 1 || String(val).toLowerCase() === 'premium';
        setIsPremium(premiumFlag);
      } else {
        setIsPremium(false);
        setPremiumUserRecord(null);
      }

      // 2. Load from "Quotas" table
      const { data: quotasData, error: quotasError } = await supabase
        .from('Quotas')
        .select('*');

      if (quotasError) {
        console.warn('Could not query Quotas table:', quotasError.message);
      }

      if (quotasData && Array.isArray(quotasData)) {
        const sorted = [...quotasData].sort((a, b) => {
          if (a.id !== undefined && b.id !== undefined) {
            return Number(a.id) - Number(b.id);
          }
          return 0;
        });
        setQuotas(sorted);
      } else {
        setQuotas([]);
      }
    } catch (err: any) {
      console.error('Error in usePremium hook:', err);
      if (!isBackground) {
        setError(err.message || 'Failed to fetch premium and quota data');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [user]);

  // Initial fetch and automatic background synchronization
  useEffect(() => {
    fetchQuotaAndPremiumData(false);

    // Background auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchQuotaAndPremiumData(true);
    }, 20000);

    // Background refresh on tab focus / document visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchQuotaAndPremiumData(true);
      }
    };
    const handleFocus = () => {
      fetchQuotaAndPremiumData(true);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Realtime Supabase channel synchronization
    let channel: any = null;
    try {
      channel = supabase
        .channel('realtime_premium_quotas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Premium_User' }, () => {
          fetchQuotaAndPremiumData(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Quotas' }, () => {
          fetchQuotaAndPremiumData(true);
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel error:', e);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchQuotaAndPremiumData]);

  /**
   * Checks whether a model is restricted (paid).
   * Checks hardcoded requirement (Gemini 3.1 Pro Preview, Gemini 4 Argon)
   * as well as the dynamic Quotas table.
   */
  const isModelPaid = useCallback((modelIdOrName: string): boolean => {
    if (!modelIdOrName) return false;
    const target = modelIdOrName.trim().toLowerCase();

    // Check hardcoded restricted models
    for (const model of RESTRICTED_MODELS) {
      if (model.toLowerCase() === target) {
        return true;
      }
    }

    // Check in loaded Quotas table
    const quotaMatch = quotas.find(q => {
      const qName = (q.model_name || '').trim().toLowerCase();
      const qId = (q.model_id || '').trim().toLowerCase();
      return qName === target || qId === target;
    });

    if (quotaMatch) {
      const val = quotaMatch.is_paid ?? quotaMatch.paid ?? quotaMatch.is_premium;
      const tierVal = (quotaMatch.tier || '').toLowerCase();
      return val === true || String(val).toLowerCase() === 'true' || tierVal === 'paid' || tierVal === 'premium';
    }

    return false;
  }, [quotas]);

  /**
   * Checks whether the current user is restricted from using this model.
   * If model is paid and user is not premium -> restricted (true).
   */
  const isModelRestricted = useCallback((modelIdOrName: string): boolean => {
    if (isPremium) return false;
    return isModelPaid(modelIdOrName);
  }, [isPremium, isModelPaid]);

  return {
    isPremium,
    premiumUserRecord,
    quotas,
    loading,
    error,
    refresh: fetchQuotaAndPremiumData,
    isModelPaid,
    isModelRestricted
  };
}
