
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car } from "../types/car";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

export const useCarManagement = () => {
  const {
    cars,
    filteredCars,
    loading,
    error,
    filter,
    setFilter,
    getCarById,
    reloadCars,
    viewCar,
    deleteCar: contextDeleteCar,
    updateCar: contextUpdateCar,
    addCar: contextAddCar,
    exportCarsData: contextExportCarsData,
    importCarsData: contextImportCarsData
  } = useGlobalCars();
  
  // Добавляем локальное состояние для автомобилей
  const [localCars, setLocalCars] = useState<Car[]>(cars);
  
  const { toast } = useToast();
  
  // Метод для установки списка автомобилей
  const setCars = useCallback((newCars: Car[]) => {
    if (!Array.isArray(newCars)) {
      console.error("setCars: newCars is not an array", newCars);
      toast({
        variant: "destructive",
        title: "Ошибка формата данных",
        description: "Невозможно установить список автомобилей: некорректный формат"
      });
      return;
    }
    
    // Добавим проверку на обязательные поля и назначим статус для всех
    const validatedCars = newCars.map(car => ({
      ...car,
      id: car.id || crypto.randomUUID(),
      status: car.status || 'published',
      price: car.price || { base: 0 },
      images: car.images || []
    }));
    
    setLocalCars(validatedCars);
    
    // Также вызываем метод из контекста, если он доступен
    if (typeof reloadCars === 'function') {
      console.log("Calling reloadCars from context with validated cars", validatedCars.length);
      try {
        // Здесь была ошибка TS2554, исправляем вызов метода
        reloadCars();
      } catch (error) {
        console.error("Error calling reloadCars from context:", error);
        // Если вызов reloadCars не удался, используем только локальное состояние
      }
    }
  }, [reloadCars, toast]);
  
  // Этот метод будет вызываться из useCars
  const updateCar = useCallback(async (car: Car) => {
    try {
      const carWithStatus = {
        ...car,
        status: car.status || 'published',
        id: car.id || crypto.randomUUID()
      };
      
      console.log('Updating car with status:', carWithStatus);
      
      // Обновляем локальное состояние
      setLocalCars(prev => 
        prev.map(c => c.id === carWithStatus.id ? carWithStatus : c)
      );
      
      if (typeof contextUpdateCar === 'function') {
        return await contextUpdateCar(carWithStatus);
      }
      
      return carWithStatus;
    } catch (error) {
      console.error('Error in updateCar wrapper:', error);
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении автомобиля"
      });
      throw error;
    }
  }, [contextUpdateCar, toast]);
  
  // Этот метод будет вызываться из useCars
  const addCar = useCallback((car: Car) => {
    try {
      const carWithStatus = {
        ...car,
        status: car.status || 'published',
        id: car.id || crypto.randomUUID()
      };
      
      console.log('Adding car with status:', carWithStatus);
      
      // Добавляем в локальное состояние
      setLocalCars(prev => [carWithStatus, ...prev]);
      
      if (typeof contextAddCar === 'function') {
        return contextAddCar(carWithStatus);
      }
      
      return carWithStatus;
    } catch (error) {
      console.error('Error in addCar wrapper:', error);
      toast({
        variant: "destructive",
        title: "Ошибка добавления",
        description: "Произошла ошибка при добавлении автомобиля"
      });
      throw error;
    }
  }, [contextAddCar, toast]);
  
  // Этот метод будет вызываться из useCars
  const deleteCar = useCallback((carId: string) => {
    try {
      console.log('Deleting car with ID:', carId);
      
      // Удаляем из локального состояния
      setLocalCars(prev => prev.filter(car => car.id !== carId));
      
      if (typeof contextDeleteCar === 'function') {
        return contextDeleteCar(carId);
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteCar wrapper:', error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении автомобиля"
      });
      throw error;
    }
  }, [contextDeleteCar, toast]);
  
  const getMostViewedCars = useCallback((limit = 5): Car[] => {
    return [...(localCars || [])]
      .filter(car => car.viewCount && car.viewCount > 0)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  }, [localCars]);
  
  const exportCarsData = useCallback((): Car[] => {
    try {
      if (typeof contextExportCarsData === 'function') {
        return contextExportCarsData();
      }
      
      return localCars;
    } catch (error) {
      console.error('Error exporting cars data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Произошла ошибка при экспорте данных автомобилей"
      });
      return [];
    }
  }, [contextExportCarsData, localCars, toast]);
  
  const importCarsData = useCallback((data: Car[] | Car): { success: number, failed: number } => {
    try {
      const carsArray = Array.isArray(data) ? data : [data];
      
      if (typeof contextImportCarsData === 'function') {
        const result = contextImportCarsData(carsArray);
        
        if (typeof result === 'boolean') {
          return result ? { success: carsArray.length, failed: 0 } 
                        : { success: 0, failed: carsArray.length };
        } else if (result && typeof result === 'object' && 'success' in result && 'failed' in result) {
          return result;
        }
      }
      
      // Также добавляем импортируемые автомобили в локальное состояние
      const processedCars = carsArray.map(car => ({
        ...car,
        id: car.id || crypto.randomUUID(),
        status: car.status || 'draft'
      }));
      
      setLocalCars(prev => [...processedCars, ...prev]);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано: ${processedCars.length} автомобилей`
      });
      
      return { success: processedCars.length, failed: 0 };
    } catch (error) {
      console.error('Error in importCarsData:', error);
      const count = Array.isArray(data) ? data.length : 1;
      
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Произошла неожиданная ошибка при импорте данных"
      });
      
      return { success: 0, failed: count };
    }
  }, [contextImportCarsData, toast]);
  
  const getPopularCarModels = useCallback((limit = 5): { model: string, count: number }[] => {
    const modelCounts: Record<string, number> = {};
    localCars.forEach(car => {
      const model = `${car.brand} ${car.model}`;
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    
    return Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [localCars]);
  
  const getCarsByBodyType = useCallback((bodyType: string): Car[] => {
    return localCars.filter(car => car.bodyType === bodyType);
  }, [localCars]);
  
  const sortCars = useCallback((carsToSort: Car[], criterion: string) => {
    switch (criterion) {
      case 'priceAsc':
        return [...carsToSort].sort((a, b) => 
          ((a.price?.base || 0) - (a.price?.discount || 0)) - 
          ((b.price?.base || 0) - (b.price?.discount || 0))
        );
      case 'priceDesc':
        return [...carsToSort].sort((a, b) => 
          ((b.price?.base || 0) - (b.price?.discount || 0)) - 
          ((a.price?.base || 0) - (a.price?.discount || 0))
        );
      case 'yearDesc':
        return [...carsToSort].sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'yearAsc':
        return [...carsToSort].sort((a, b) => (a.year || 0) - (b.year || 0));
      default:
        return carsToSort;
    }
  }, []);

  return {
    cars: localCars, // Используем локальное состояние
    filteredCars,
    loading,
    error,
    filter,
    setFilter,
    getCarById,
    reloadCars,
    viewCar,
    deleteCar,
    updateCar,
    addCar,
    getMostViewedCars,
    getPopularCarModels,
    getCarsByBodyType,
    sortCars,
    exportCarsData,
    importCarsData,
    setCars,
  };
};

function getGlobalCars() {
  try {
    return useGlobalCars();
  } catch (error) {
    console.error('Error accessing global cars context:', error);
    return {
      getPopularCarModels: () => [],
      getCarsByBodyType: () => [],
      sortCars: (cars: Car[], _: string) => cars
    };
  }
}
