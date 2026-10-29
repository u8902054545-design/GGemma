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

export const RESTRICTED_MODELS = [
  'Gemini 3.1 Pro Preview',
  'google/gemini-3.1-pro-preview',
  'Gemini 4 Argon',
  'google/gemini-4-argon'
];

export const DEFAULT_QUOTAS: QuotaItem[] = [
  {
    id: 1,
    model_name: 'Gemini 3.1 Pro Preview',
    model_id: 'google/gemini-3.1-pro-preview',
    is_paid: true,
    daily_limit: 100,
    tier: 'paid',
    description: 'Flagship reasoning model with advanced capabilities. Available exclusively to Premium users.'
  },
  {
    id: 2,
    model_name: 'Gemini 4 Argon',
    model_id: 'google/gemini-4-argon',
    is_paid: true,
    daily_limit: 80,
    tier: 'paid',
    description: 'Next-generation high-precision model. Available exclusively to Premium users.'
  },
  {
    id: 3,
    model_name: 'Gemma 4 31B',
    model_id: 'google/gemma-4-31b-it',
    is_paid: false,
    daily_limit: 5,
    tier: 'free',
    description: 'Most powerful model for complex reasoning and logic.'
  },
  {
    id: 4,
    model_name: 'Gemma 4 26B A4B',
    model_id: 'google/gemma-4-26b-a4b-it',
    is_paid: false,
    daily_limit: 10,
    tier: 'free',
    description: 'High performance, great balance of speed and capability.'
  },
  {
    id: 5,
    model_name: 'Gemma 4 12B',
    model_id: 'google/gemma-4-12B-it',
    is_paid: false,
    daily_limit: 30,
    tier: 'free',
    description: 'Compact 4th gen model with high efficiency.'
  },
  {
    id: 6,
    model_name: 'DiffusionGemma 26B A4B IT',
    model_id: 'google/diffusiongemma-26b-a4b-it',
    is_paid: false,
    daily_limit: 15,
    tier: 'free',
    description: 'Diffusion-based thinking model for advanced reasoning.'
  },
  {
    id: 7,
    model_name: 'Gemma 3 27B',
    model_id: 'google/gemma-3-27b-it',
    is_paid: false,
    daily_limit: 50,
    tier: 'free',
    description: 'Powerful 3rd gen model with strong reasoning.'
  },
  {
    id: 8,
    model_name: 'Gemma 3 12B',
    model_id: 'google/gemma-3-12b-it',
    is_paid: false,
    daily_limit: 100,
    tier: 'free',
    description: 'Versatile mid-range model for everyday tasks.'
  },
  {
    id: 9,
    model_name: 'Gemma 3 4B',
    model_id: 'google/gemma-3-4b-it',
    is_paid: false,
    daily_limit: 150,
    tier: 'free',
    description: 'Lightweight model optimized for speed.'
  },
  {
    id: 10,
    model_name: 'Gemma 2 27B',
    model_id: 'google/gemma-2-27b-it',
    is_paid: false,
    daily_limit: 50,
    tier: 'free',
    description: 'Legacy 2nd generation model.'
  },
  {
    id: 11,
    model_name: 'Gemini 3.8 Flash',
    model_id: 'google/gemini-3.8-flash',
    is_paid: false,
    daily_limit: 50,
    tier: 'free',
    description: 'Latest ultra-fast Flash 3.8 model.'
  },
  {
    id: 12,
    model_name: 'Gemini 3.7 Flash',
    model_id: 'google/gemini-3.7-flash',
    is_paid: false,
    daily_limit: 50,
    tier: 'free',
    description: 'Fast and precise Flash 3.7 model.'
  },
  {
    id: 13,
    model_name: 'Gemini 3.6 Flash',
    model_id: 'google/gemini-3.6-flash',
    is_paid: false,
    daily_limit: 60,
    tier: 'free',
    description: 'Stable and performant Flash 3.6.'
  },
  {
    id: 14,
    model_name: 'Gemini 3.5 Flash',
    model_id: 'google/gemini-3.5-flash',
    is_paid: false,
    daily_limit: 60,
    tier: 'free',
    description: 'Standard Flash 3.5 model.'
  },
  {
    id: 15,
    model_name: 'Gemini 3.5 Flash Lite',
    model_id: 'google/gemini-3.5-flash-lite',
    is_paid: false,
    daily_limit: 80,
    tier: 'free',
    description: 'Lightweight Flash Lite 3.5.'
  },
  {
    id: 16,
    model_name: 'Gemini 3 Flash Preview',
    model_id: 'google/gemini-3-flash-preview',
    is_paid: false,
    daily_limit: 50,
    tier: 'free',
    description: 'Preview release of Gemini 3 Flash.'
  },
  {
    id: 17,
    model_name: 'Gemini 3.1 Flash Lite',
    model_id: 'google/gemini-3.1-flash-lite',
    is_paid: false,
    daily_limit: 80,
    tier: 'free',
    description: 'Efficient Flash Lite 3.1.'
  },
  {
    id: 18,
    model_name: 'Gemini 3.1 Flash Lite Preview',
    model_id: 'google/gemini-3.1-flash-lite-preview',
    is_paid: false,
    daily_limit: 80,
    tier: 'free',
    description: 'Preview version of Flash Lite 3.1.'
  },
  {
    id: 19,
    model_name: 'Gemini 2.5 Flash',
    model_id: 'google/gemini-2.5-flash',
    is_paid: false,
    daily_limit: 70,
    tier: 'free',
    description: 'Balanced speed and quality for multimodal tasks.'
  },
  {
    id: 20,
    model_name: 'Gemini 2.5 Flash Lite',
    model_id: 'google/gemini-2.5-flash-lite',
    is_paid: false,
    daily_limit: 100,
    tier: 'free',
    description: 'Efficient and fast model for general tasks.'
  },
  {
    id: 21,
    model_name: 'Gemini 2.5 Pro',
    model_id: 'google/gemini-2.5-pro',
    is_paid: false,
    daily_limit: 40,
    tier: 'free',
    description: 'Advanced Gemini 2.5 Pro model.'
  }
];

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumUserRecord, setPremiumUserRecord] = useState<PremiumUserRecord | null>(null);
  const [quotas, setQuotas] = useState<QuotaItem[]>(DEFAULT_QUOTAS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotaAndPremiumData = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError(null);

    try {
      if (user) {
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
      } else {
        setIsPremium(false);
        setPremiumUserRecord(null);
      }

      let quotasData: any[] | null = null;
      let quotasError: any = null;

      const res1 = await supabase
        .from('Quotas')
        .select('*');

      if (!res1.error && res1.data && res1.data.length > 0) {
        quotasData = res1.data;
      } else {
        quotasError = res1.error;
        const res2 = await supabase
          .from('quotas')
          .select('*');
        if (!res2.error && res2.data && res2.data.length > 0) {
          quotasData = res2.data;
          quotasError = null;
        } else if (res1.data && Array.isArray(res1.data)) {
          quotasData = res1.data;
        }
      }

      if (quotasError) {
        console.warn('Could not query Quotas table:', quotasError.message);
      }

      if (quotasData && Array.isArray(quotasData) && quotasData.length > 0) {
        const dbItems: QuotaItem[] = quotasData.map((q: any, idx: number) => {
          const isPaidBool = q.is_paid === true || String(q.is_paid).toLowerCase() === 'true' || q.is_paid === 1;
          const matchedDefault = DEFAULT_QUOTAS.find(
            d => d.model_name.toLowerCase() === (q.model_name || '').toLowerCase()
          );

          return {
            id: q.id ?? idx + 1,
            model_name: q.model_name || `Model ${idx + 1}`,
            model_id: q.model_id || matchedDefault?.model_id || q.model_name,
            is_paid: isPaidBool,
            daily_limit: q.daily_limit !== undefined && q.daily_limit !== null
              ? Number(q.daily_limit)
              : (matchedDefault?.daily_limit || (isPaidBool ? 100 : 50)),
            tier: q.tier || (isPaidBool ? 'paid' : 'free'),
            description: q.description || matchedDefault?.description || ''
          };
        });

        setQuotas(dbItems);
      } else {
        setQuotas(DEFAULT_QUOTAS);
      }
    } catch (err: any) {
      console.error('Error in usePremium hook:', err);
      setQuotas(prev => (prev && prev.length > 0 ? prev : DEFAULT_QUOTAS));
      if (!isBackground) {
        setError(err.message || 'Failed to fetch premium and quota data');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchQuotaAndPremiumData(false);

    const interval = setInterval(() => {
      fetchQuotaAndPremiumData(true);
    }, 20000);

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

  const isModelPaid = useCallback((modelIdOrName: string): boolean => {
    if (!modelIdOrName) return false;
    const target = modelIdOrName.trim().toLowerCase();

    for (const model of RESTRICTED_MODELS) {
      if (model.toLowerCase() === target) {
        return true;
      }
    }

    const quotaMatch = quotas.find(q => {
      const qName = (q.model_name || '').trim().toLowerCase();
      const qId = (q.model_id || '').trim().toLowerCase();
      return qName === target || qId === target;
    });

    if (quotaMatch) {
      const val = quotaMatch.is_paid ?? quotaMatch.paid ?? quotaMatch.is_premium;
      if (val === false || String(val).toLowerCase() === 'false' || val === 0) {
        return false;
      }
      if (val === true || String(val).toLowerCase() === 'true' || val === 1) {
        return true;
      }
      const tierVal = (quotaMatch.tier || '').toLowerCase();
      if (tierVal === 'free') return false;
      if (tierVal === 'paid' || tierVal === 'premium') return true;
    }

    return false;
  }, [quotas]);

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
