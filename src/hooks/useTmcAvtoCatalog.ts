
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseTmcAvtoCatalogProps {
  onError?: (error: string) => void;
}

interface FetchCatalogDataParams {
  url: string;
}

interface ImportCarsParams {
  onSuccess?: (data: any) => void;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  country: string;
  imageUrl: string;
  detailUrl: string;
}

export const useTmcAvtoCatalog = ({ onError }: UseTmcAvtoCatalogProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);

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

      // Если ответ содержит данные об автомобилях
      if (Array.isArray(data.data)) {
        setCars(data.data);
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

  const importAllCars = async ({ onSuccess }: ImportCarsParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('tmcavto-catalog', {
        body: { action: 'import' },
      });

      if (error) {
        const errorMessage = error.message || 'Ошибка при импорте данных';
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

      setCars(data.data);
      
      toast({
        title: 'Импорт завершен',
        description: `Импортировано ${data.total || data.data.length} автомобилей`,
      });

      if (onSuccess) {
        onSuccess(data.data);
      }

      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла неизвестная ошибка';
      console.error('Ошибка импорта:', errorMessage);
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
    importAllCars,
    loading,
    error,
    cars
  };
};
