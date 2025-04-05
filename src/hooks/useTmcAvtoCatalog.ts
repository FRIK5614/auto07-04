
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseTmcAvtoCatalogProps {
  onError?: (error: string) => void;
}

interface FetchCatalogDataParams {
  url: string;
}

export const useTmcAvtoCatalog = ({ onError }: UseTmcAvtoCatalogProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogData = async ({ url }: FetchCatalogDataParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('tmcavto-catalog', {
        body: { url },
      });

      if (error) {
        const errorMessage = error.message || 'Ошибка при получении данных';
        console.error('Ошибка API:', errorMessage);
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        if (onError) onError(errorMessage);
        return null;
      }

      if (!data || !data.data) {
        const errorMessage = 'Получен пустой ответ от сервера';
        console.error(errorMessage);
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        if (onError) onError(errorMessage);
        return null;
      }

      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла неизвестная ошибка';
      console.error('Ошибка запроса:', errorMessage);
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      if (onError) onError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCatalogData,
    loading,
    error,
  };
};
