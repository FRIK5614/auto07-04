
import { useState, useEffect } from "react";
import { apiAdapter } from "@/services/adapter";
import { Car } from "@/types/car";
import { useToast } from "@/hooks/use-toast";

export function useHotDeals() {
  const [hotDeals, setHotDeals] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHotDeals();
  }, []);

  const loadHotDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем автомобили со скидками (горячие предложения)
      const allCars = await apiAdapter.getCars();
      
      // Определяем горячие предложения как автомобили со скидкой и опубликованные
      const dealsWithDiscount = allCars.filter(car => 
        car.price && 
        car.price.discount && 
        car.price.discount > 0 && 
        car.status === 'published'
      );
      
      // Берем только первые 3 для отображения
      setHotDeals(dealsWithDiscount.slice(0, 3));
    } catch (error) {
      console.error("Ошибка при загрузке горячих предложений:", error);
      setError("Не удалось загрузить горячие предложения");
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить горячие предложения"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewHotDeal = async (carId: string) => {
    try {
      await apiAdapter.viewCar(carId);
    } catch (error) {
      console.error(`Ошибка при регистрации просмотра автомобиля ${carId}:`, error);
    }
  };

  return {
    hotDeals,
    loading,
    error,
    loadHotDeals,
    viewHotDeal
  };
}
