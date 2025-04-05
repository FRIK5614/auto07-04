
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
  const [logs, setLogs] = useState<string[]>([]);
  const [blockedSources, setBlockedSources] = useState<string[]>([]);

  const fetchCatalogData = async ({ url }: FetchCatalogDataParams) => {
    setLoading(true);
    setError(null);
    setLogs([]);

    try {
      console.log(`Отправка запроса к tmcavto-catalog с URL: ${url}`);
      
      const { data, error } = await supabase.functions.invoke('tmcavto-catalog', {
        body: { url },
      });

      console.log('Ответ от функции:', data, error);

      if (error) {
        const errorMessage = error.message || 'Ошибка при получении данных';
        console.error('Ошибка API:', errorMessage);
        setError(errorMessage);
        
        // Проверяем, связана ли ошибка с блокировкой доступа
        if (errorMessage.includes('блокирует') || 
            errorMessage.includes('запрещен') || 
            errorMessage.includes('Access Denied')) {
          
          // Добавляем источник в список заблокированных
          if (url.includes('/china')) {
            setBlockedSources(prev => prev.includes('china') ? prev : [...prev, 'china']);
          } else if (url.includes('/japan')) {
            setBlockedSources(prev => prev.includes('japan') ? prev : [...prev, 'japan']);
          } else if (url.includes('/korea')) {
            setBlockedSources(prev => prev.includes('korea') ? prev : [...prev, 'korea']);
          }
          
          toast({
            title: 'Доступ заблокирован',
            description: 'Сайт блокирует парсинг данных. Попробуйте позже или используйте другой источник.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Ошибка',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        
        if (onError) onError(errorMessage);
        return null;
      }

      if (!data) {
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

      // Сохраняем логи, если они есть
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }

      // Если ответ содержит данные об автомобилях
      if (data.data && Array.isArray(data.data)) {
        console.log(`Получено ${data.data.length} автомобилей`);
        setCars(data.data);
        
        if (data.data.length === 0) {
          toast({
            title: 'Данные получены',
            description: 'Не найдено автомобилей в этом разделе',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Данные получены',
            description: `Получено ${data.data.length} автомобилей`,
            variant: 'default',
          });
        }
        
        return data.data;
      } else {
        console.log('Получены данные не в формате массива');
        toast({
          title: 'Внимание',
          description: 'Получены данные в неизвестном формате',
          variant: 'default',
        });
        return data.data;
      }
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
    setLogs([]);

    try {
      console.log('Начинаем импорт всех автомобилей...');
      
      toast({
        title: 'Импорт запущен',
        description: 'Начинаем импорт автомобилей. Это может занять некоторое время.',
      });
      
      const { data, error } = await supabase.functions.invoke('tmcavto-catalog', {
        body: { action: 'import' },
      });

      console.log('Ответ от функции импорта:', data, error);

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

      if (!data) {
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

      // Обработка логов если они есть
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
        
        // Проверяем логи на наличие заблокированных источников
        data.logs.forEach((log: string) => {
          if ((log.includes('Ошибка при импорте из Китай') || log.includes('блокирует') && log.includes('Китай'))) {
            setBlockedSources(prev => prev.includes('china') ? prev : [...prev, 'china']);
          }
          if ((log.includes('Ошибка при импорте из Япония') || log.includes('блокирует') && log.includes('Япония'))) {
            setBlockedSources(prev => prev.includes('japan') ? prev : [...prev, 'japan']);
          }
          if ((log.includes('Ошибка при импорте из Корея') || log.includes('блокирует') && log.includes('Корея'))) {
            setBlockedSources(prev => prev.includes('korea') ? prev : [...prev, 'korea']);
          }
        });
      }

      // Проверяем, что данные содержат массив автомобилей
      if (data.data && Array.isArray(data.data)) {
        console.log(`Импортировано ${data.data.length} автомобилей`);
        setCars(data.data);
        
        if (data.data.length === 0) {
          toast({
            title: 'Импорт завершен',
            description: 'Не удалось импортировать автомобили. Проверьте логи для получения дополнительной информации.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Импорт завершен',
            description: `Импортировано ${data.total || data.data.length} автомобилей`,
          });
        }

        if (onSuccess) {
          onSuccess(data.data);
        }

        return data.data;
      } else {
        const errorMessage = 'Данные не содержат список автомобилей';
        console.error(errorMessage, data);
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        if (onError) onError(errorMessage);
        return null;
      }
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
    cars,
    logs,
    blockedSources
  };
};
