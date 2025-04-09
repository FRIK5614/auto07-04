
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
  
  const carsWithImages = cars.map(car => carImages.applySavedImagesToCar(car));
  const filteredCarsWithImages = filteredCars.map(car => carImages.applySavedImagesToCar(car));

  const loadCars = useCallback(async () => {
    console.log('Loading cars from API via useCars hook');
    setIsLoading(true);
    setError(null);
    
    try {
      const carsData = await apiAdapter.getCars();
      console.log('API returned cars:', carsData.length);
      
      if (carsData.length > 0) {
        const processedCars = carsData.map((car: Car, index: number) => {
          // Проверяем и устанавливаем флаги isNew и isPopular если они не определены
          if (typeof car.isNew === 'undefined') {
            car.isNew = !!car.isNew;
          }
          if (typeof car.isPopular === 'undefined') {
            car.isPopular = !!car.isPopular;
          }
          return car;
        });
        
        carManagement.setCars(processedCars); 
        
        toast({
          title: "Загрузка успешна",
          description: `Загружено ${processedCars.length} автомобилей`
        });
      } else {
        toast({
          variant: "default",
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
  
  useEffect(() => {
    loadCars().catch(err => {
      console.error("Failed to load cars on initial render:", err);
    });
  }, [loadCars]);
  
  const exportCarsData = (): Car[] => {
    return carManagement.exportCarsData();
  };
  
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    return carManagement.importCarsData(data);
  };
  
  const addCar = async (car: Car) => {
    setIsLoading(true);
    try {
      console.log('Adding new car:', car);
      
      if (!car.status) {
        car.status = 'published';
      }
      
      const addedCar = await apiAdapter.addCar(car);
      
      carManagement.addCar(addedCar);
      
      toast({
        title: "Автомобиль добавлен",
        description: `${addedCar.brand} ${addedCar.model} успешно добавлен в базу`
      });
      
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
  
  const updateCar = async (car: Car) => {
    setIsLoading(true);
    try {
      console.log('Updating car:', car);
      
      if (!car.status) {
        car.status = 'published';
      }
      
      const updatedCar = await apiAdapter.updateCar(car);
      
      carManagement.updateCar(updatedCar);
      
      toast({
        title: "Автомобиль обновлен",
        description: `${updatedCar.brand} ${updatedCar.model} успешно обновлен`
      });
      
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
  
  const deleteCar = async (carId: string) => {
    setIsLoading(true);
    try {
      console.log('Deleting car with ID:', carId);
      
      const result = await apiAdapter.deleteCar(carId);
      
      if (result) {
        carManagement.deleteCar(carId);
        
        toast({
          title: "Автомобиль удален",
          description: `Автомобиль успешно удален из базы`
        });
        
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
  
  const { createOrder, syncOrders, processOrder, deleteOrder, orders, loading: orderLoading } = orderManagement;
  
  const { 
    getCarById,
    viewCar,
    setCars
  } = carManagement;

  return {
    ...carManagement,
    setCars,
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
    
    error,
    isLoading,
    // Удаляем дублирующееся свойство loadCars
    
    ...favoritesAndCompare,
    
    ...carImages,
    
    ...orderManagement,
    createOrder,
    syncOrders,
    processOrder,
    deleteOrder,
    orders,
    orderLoading,
  };
};
