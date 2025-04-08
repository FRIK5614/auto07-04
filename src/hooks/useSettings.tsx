
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Определяем базовый URL для API
const API_BASE_URL = 'https://metallika29.ru/public/api';

export interface SiteSetting {
  key: string;
  value: string | number | boolean;
  group?: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'color';
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async (group?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = group 
        ? `${API_BASE_URL}/settings/get_settings.php?group=${encodeURIComponent(group)}`
        : `${API_BASE_URL}/settings/get_settings.php`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data || {});
      } else {
        setError(result.message || 'Не удалось загрузить настройки');
        console.error('Ошибка получения настроек:', result.message);
        
        toast({
          variant: "destructive",
          title: "Ошибка загрузки настроек",
          description: result.message || 'Не удалось загрузить настройки'
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      console.error('Ошибка при запросе настроек:', err);
      
      toast({
        variant: "destructive",
        title: "Ошибка при запросе настроек",
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (setting: SiteSetting): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/update_setting.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: setting.key,
          value: String(setting.value),
          group: setting.group,
          type: setting.type
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Обновляем локальный state
        setSettings(prev => ({
          ...prev,
          [setting.key]: setting.value
        }));
        
        toast({
          title: "Настройка обновлена",
          description: `Настройка "${setting.key}" успешно обновлена`
        });
        
        return true;
      } else {
        console.error('Ошибка обновления настройки:', result.message);
        
        toast({
          variant: "destructive",
          title: "Ошибка обновления настройки",
          description: result.message || 'Не удалось обновить настройку'
        });
        
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка при запросе обновления настройки:', err);
      
      toast({
        variant: "destructive",
        title: "Ошибка обновления настройки",
        description: message
      });
      
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting
  };
};
