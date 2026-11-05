import { useState, useEffect, useCallback } from 'react';
import { SUPABASE_ENDPOINT, supabase } from '../config';

export interface ConnectorState {
  connected: boolean;
  provider?: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface ConnectorSettings {
  workspace: boolean;
  services_google: boolean;
  tools: Record<string, boolean>;
}

export const DEFAULT_CONNECTOR_SETTINGS: ConnectorSettings = {
  workspace: true,
  services_google: true,
  tools: {
    google_calendar: true,
    google_drive: true,
    google_docs: true,
    google_sheets: true,
    google_tasks: true,
    gmail: true,
    google_slides: true,
    google_forms: true,
    google_apps_script: true,
    google_chat: true,
    google_contacts: true,
    google_home: true,
  },
};

const STORAGE_KEY = 'gemma_connector_settings';

export const getLocalConnectorSettings = (): ConnectorSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONNECTOR_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      workspace: parsed.workspace ?? DEFAULT_CONNECTOR_SETTINGS.workspace,
      services_google: parsed.services_google ?? DEFAULT_CONNECTOR_SETTINGS.services_google,
      tools: {
        ...DEFAULT_CONNECTOR_SETTINGS.tools,
        ...(parsed.tools || {}),
      },
    };
  } catch {
    return DEFAULT_CONNECTOR_SETTINGS;
  }
};

export const useConnectors = (provider: string = 'google') => {
  const [status, setStatus] = useState<ConnectorState>({ connected: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConnectorSettings>(getLocalConnectorSettings);

  const getAuthHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error: fetchErr } = await supabase
        .from('user_connector_settings')
        .select('workspace, services_google, tools')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!fetchErr && data) {
        const merged: ConnectorSettings = {
          workspace: data.workspace ?? DEFAULT_CONNECTOR_SETTINGS.workspace,
          services_google: data.services_google ?? DEFAULT_CONNECTOR_SETTINGS.services_google,
          tools: {
            ...DEFAULT_CONNECTOR_SETTINGS.tools,
            ...(data.tools || {}),
          },
        };
        setSettings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (_) {}
  }, []);

  const saveSettingsToDb = useCallback(async (newSettings: ConnectorSettings) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      await supabase
        .from('user_connector_settings')
        .upsert(
          {
            user_id: session.user.id,
            workspace: newSettings.workspace,
            services_google: newSettings.services_google,
            tools: newSettings.tools,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    } catch (_) {}
  }, []);

  const updateSettings = useCallback(async (updater: ConnectorSettings | ((prev: ConnectorSettings) => ConnectorSettings)) => {
    setSettings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('gemma_connector_settings_updated'));
      saveSettingsToDb(next);
      return next;
    });
  }, [saveSettingsToDb]);

  const toggleGroup = useCallback(async (group: 'workspace' | 'services_google') => {
    await updateSettings((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  }, [updateSettings]);

  const toggleTool = useCallback(async (toolId: string) => {
    await updateSettings((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: prev.tools[toolId] === undefined ? false : !prev.tools[toolId],
      },
    }));
  }, [updateSettings]);

  const isGroupEnabled = useCallback((group: 'workspace' | 'services_google') => {
    return !!settings[group];
  }, [settings]);

  const isToolEnabled = useCallback((toolId: string) => {
    const toolVal = settings.tools[toolId];
    return toolVal !== undefined ? toolVal : true;
  }, [settings]);

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setSettings(getLocalConnectorSettings());
    };
    window.addEventListener('gemma_connector_settings_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('gemma_connector_settings_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return {
    status,
    loading,
    actionLoading,
    error,
    settings,
    updateSettings,
    toggleGroup,
    toggleTool,
    isGroupEnabled,
    isToolEnabled,
    checkStatus,
    connectGoogle,
    disconnectGoogle,
    exchangeCode,
  };
};
