
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";
import { apiAdapter } from "@/services/adapter";
import { Car } from "@/types/car";
import { useState, useEffect } from "react";
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
  const loadCars = async () => {
    console.log('Loading cars from API via useCars hook');
    setIsLoading(true);
    setError(null);
    
    try {
      // Получаем данные с реального API
      const carsData = await apiAdapter.getCars();
      
      // Обновляем состояние в carManagement
      carManagement.reloadCars();
      
      toast({
        title: "Загрузка успешна",
        description: `Загружено ${carsData.length} автомобилей`
      });
      
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
  };
  
  // Загружаем автомобили при первом рендере
  useEffect(() => {
    loadCars();
  }, []);
  
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
      // Вызываем API для добавления автомобиля в БД
      const addedCar = await apiAdapter.addCar(car);
      
      // Вызываем функцию из carManagement
      carManagement.addCar(addedCar);
      
      // Перезагружаем список автомобилей
      await loadCars();
      
      return addedCar;
    } catch (error) {
      console.error('Ошибка при добавлении автомобиля:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для обновления автомобиля
  const updateCar = async (car: Car) => {
    setIsLoading(true);
    try {
      // Вызываем API для обновления автомобиля в БД
      const updatedCar = await apiAdapter.updateCar(car);
      
      // Вызываем функцию из carManagement
      carManagement.updateCar(updatedCar);
      
      // Перезагружаем список автомобилей
      await loadCars();
      
      return updatedCar;
    } catch (error) {
      console.error('Ошибка при обновлении автомобиля:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для удаления автомобиля
  const deleteCar = async (carId: string) => {
    setIsLoading(true);
    try {
      // Вызываем API для удаления автомобиля из БД
      await apiAdapter.deleteCar(carId);
      
      // Вызываем функцию из carManagement
      carManagement.deleteCar(carId);
      
      // Перезагружаем список автомобилей
      await loadCars();
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении автомобиля:', error);
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
    viewCar
  } = carManagement;

  return {
    // Car management
    ...carManagement,
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
