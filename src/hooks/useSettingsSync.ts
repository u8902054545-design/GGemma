import { useEffect } from 'react';
import { supabase, SUPABASE_ENDPOINT } from '../config';

interface SettingsSyncProps {
  user: any;
  selectedModelId: string;
  language: string;
  theme: string;
  setSelectedModel: (model: { id: string; name: string }) => void;
  setLanguage: (lang: any) => void;
  setTheme: (theme: any) => void;
}

export const useSettingsSync = ({
  user,
  selectedModelId,
  language,
  theme,
  setSelectedModel,
  setLanguage,
  setTheme
}: SettingsSyncProps) => {
  useEffect(() => {
    const syncSettings = async () => {
      if (!user) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${SUPABASE_ENDPOINT}?type=settings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await response.json();
        
        if (data) {
          if (data.selected_model_id && data.selected_model_id !== selectedModelId) {
            setSelectedModel({ id: data.selected_model_id, name: data.selected_model_name || data.selected_model_id });
          }
          if (data.selected_language && data.selected_language !== language) {
            setLanguage(data.selected_language);
          }
          if (data.selected_theme && data.selected_theme !== theme) {
            setTheme(data.selected_theme);
          }
        }
      } catch (err) { 
        console.error('Settings sync error:', err); 
      }
    };
    syncSettings();
  }, [user]);
};
