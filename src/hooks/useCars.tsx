
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";
import { apiAdapter } from "@/services/adapter";
import { Car } from "@/types/car";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useCars = () => {
  const carManagement = useCarManagement();
  const favoritesAndCompare = useFavoritesAndCompare();
  const carImages = useCarImages();
  const orderManagement = useOrderManagement();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cars, filteredCars } = carManagement;
  
  // Apply saved images to all cars
  const carsWithImages = cars.map(car => carImages.applySavedImagesToCar(car));
  const filteredCarsWithImages = filteredCars.map(car => carImages.applySavedImagesToCar(car));

  // Create a loadCars convenience method that calls the API
  const loadCars = useCallback(async () => {
    console.log('Loading cars from API via useCars hook');
    setIsLoading(true);
    setError(null);
    
    try {
      // Получаем данные с API с защитой от ошибок
      const carsData = await apiAdapter.getCars();
      console.log('API returned cars:', carsData.length);
      
      if (carsData.length > 0) {
        // Обновляем состояние в carManagement
        carManagement.setCars(carsData); 
        
        toast({
          title: "Загрузка успешна",
          description: `Загружено ${carsData.length} автомобилей`
        });
      } else {
        toast({
          variant: "warning",
          title: "Нет данных",
          description: "API не вернул ни одного автомобиля"
        });
      }
      
      return carsData;
    } catch (err) {
      console.error('Ошибка при загрузке автомобилей:', err);
      setError('Ошибка при загрузке автомобилей. Пожалуйста, попробуйте позже.');
      
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные автомобилей"
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast, carManagement]);
  
  // Загружаем автомобили при первом рендере
  useEffect(() => {
    loadCars().catch(err => {
      console.error("Failed to load cars on initial render:", err);
    });
  }, [loadCars]);
  
  // Make sure exportCarsData returns Car[]
  const exportCarsData = (): Car[] => {
    return carManagement.exportCarsData();
  };
  
  // Import cars data with proper typing
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    return carManagement.importCarsData(data);
  };
  
  // Функция для добавления нового автомобиля
  const addCar = async (car: Car) => {
    setIsLoading(true);
    try {
      console.log('Adding new car:', car);
      
      // Убедимся, что статус установлен
      if (!car.status) {
        car.status = 'published';
      }
      
      // Вызываем API для добавления автомобиля в БД
      const addedCar = await apiAdapter.addCar(car);
      
      // Вызываем функцию из carManagement
      carManagement.addCar(addedCar);
      
      // Показываем уведомление об успешном добавлении
      toast({
        title: "Автомобиль добавлен",
        description: `${addedCar.brand} ${addedCar.model} успешно добавлен в базу`
      });
      
      // Перезагружаем список автомобилей
      await loadCars();
      
      return addedCar;
    } catch (error) {
      console.error('Ошибка при добавлении автомобиля:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка добавления",
        description: `Не удалось добавить автомобиль: ${(error as Error).message}`
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для обновления автомобиля
  const updateCar = async (car: Car) => {
    setIsLoading(true);
    try {
      console.log('Updating car:', car);
      
      // Убедимся, что статус установлен
      if (!car.status) {
        car.status = 'published';
      }
      
      // Вызываем API для обновления автомобиля в БД
      const updatedCar = await apiAdapter.updateCar(car);
      
      // Вызываем функцию из carManagement
      carManagement.updateCar(updatedCar);
      
      // Показываем уведомление об успешном обновлении
      toast({
        title: "Автомобиль обновлен",
        description: `${updatedCar.brand} ${updatedCar.model} успешно обновлен`
      });
      
      // Перезагружаем список автомобилей для синхронизации с БД
      await loadCars();
      
      return updatedCar;
    } catch (error) {
      console.error('Ошибка при обновлении автомобиля:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: `Не удалось обновить автомобиль: ${(error as Error).message}`
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для удаления автомобиля
  const deleteCar = async (carId: string) => {
    setIsLoading(true);
    try {
      console.log('Deleting car with ID:', carId);
      
      // Вызываем API для удаления автомобиля из БД
      const result = await apiAdapter.deleteCar(carId);
      
      if (result) {
        // Вызываем функцию из carManagement
        carManagement.deleteCar(carId);
        
        // Показываем уведомление об успешном удалении
        toast({
          title: "Автомобиль удален",
          description: `Автомобиль успешно удален из базы`
        });
        
        // Перезагружаем список автомобилей
        await loadCars();
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка при удалении автомобиля:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: `Не удалось удалить автомобиль: ${(error as Error).message}`
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract these methods from orderManagement to ensure they're properly typed
  const { createOrder, syncOrders, processOrder, deleteOrder, orders, loading: orderLoading } = orderManagement;
  
  // Explicitly extract key methods from carManagement
  const { 
    getCarById,
    viewCar,
    setCars
  } = carManagement;

  return {
    // Car management
    ...carManagement,
    setCars,
    // Overwrite cars with image-enhanced versions
    cars: carsWithImages,
    filteredCars: filteredCarsWithImages,
    loadCars,
    exportCarsData,
    importCarsData,
    updateCar,
    addCar,
    deleteCar,
    getCarById,
    viewCar,
    
    // Loading state
    isLoading,
    error,
    
    // Favorites and comparison
    ...favoritesAndCompare,
    
    // Car images
    ...carImages,
    
    // Order management
    // We'll spread orderManagement but also explicitly include key functions
    // to ensure TypeScript recognizes them
    ...orderManagement,
    createOrder,
    syncOrders,
    processOrder,
    deleteOrder,
    orders,
    orderLoading,
  };
};
