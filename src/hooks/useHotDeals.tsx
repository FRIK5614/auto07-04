
import { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { searchCars, viewCar } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useHotDeals = () => {
  const [hotDeals, setHotDeals] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка горячих предложений
  useEffect(() => {
    const fetchHotDeals = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Получаем автомобили со скидками
        const carsWithDiscount = await searchCars({ 
          isPopular: true, 
          status: 'published' 
        });
        
        if (carsWithDiscount && carsWithDiscount.length > 0) {
          console.log(`Загружено ${carsWithDiscount.length} горячих предложений`);
          setHotDeals(carsWithDiscount);
        } else {
          console.log('Горячие предложения не найдены');
          setHotDeals([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке горячих предложений:', err);
        setError('Не удалось загрузить горячие предложения');
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить горячие предложения"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHotDeals();
  }, [toast]);

  // Функция для просмотра автомобиля с горячим предложением
  const viewHotDeal = async (carId: string) => {
    try {
      // Увеличиваем счетчик просмотров автомобиля
      await viewCar(carId);
    } catch (error) {
      console.error('Ошибка при просмотре автомобиля:', error);
    }
  };

  return {
    hotDeals,
    loading,
    error,
    viewHotDeal
  };
};
