import { useState, useEffect, useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';

export interface ConnectorState {
  connected: boolean;
  provider?: string;
  scopes?: string[];
  expiresAt?: string;
}

export const useConnectors = (provider: string = 'google') => {
  const [status, setStatus] = useState<ConnectorState>({ connected: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
  }, []);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${SUPABASE_ENDPOINT}?type=connectors&provider=${encodeURIComponent(provider)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }
      const data = await response.json();
      setStatus({
        connected: !!data.connected,
        provider: data.provider || provider,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
      });
    } catch (err: any) {
      setError(err.message || 'Error checking connectors status');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, provider]);

  const connectGoogle = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${SUPABASE_ENDPOINT}?type=connectors&action=auth_url&provider=${encodeURIComponent(provider)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get auth URL');
      }
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message || 'Error initiating Google connection');
      setActionLoading(false);
    }
  }, [getAuthHeader, provider]);

  const disconnectGoogle = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${SUPABASE_ENDPOINT}?type=connectors&provider=${encodeURIComponent(provider)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ action: 'disconnect', provider }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to disconnect Google');
      }
      setStatus({ connected: false, provider });
    } catch (err: any) {
      setError(err.message || 'Error disconnecting Google');
    } finally {
      setActionLoading(false);
    }
  }, [getAuthHeader, provider]);

  const exchangeCode = useCallback(async (code: string, targetProvider?: string) => {
    setActionLoading(true);
    setError(null);
    const resolvedProvider = targetProvider || provider;
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${SUPABASE_ENDPOINT}?type=connectors&provider=${encodeURIComponent(resolvedProvider)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ action: 'exchange_code', code, provider: resolvedProvider }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to exchange authorization code');
      }
      await checkStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error during code exchange');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [getAuthHeader, checkStatus, provider]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    loading,
    actionLoading,
    error,
    checkStatus,
    connectGoogle,
    disconnectGoogle,
    exchangeCode,
  };
};
