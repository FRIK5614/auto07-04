import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car } from "../types/car";
import { useToast } from "@/hooks/use-toast";

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
    deleteCar,
    updateCar: contextUpdateCar,
    addCar: contextAddCar,
    exportCarsData: contextExportCarsData,
    importCarsData: contextImportCarsData
  } = useGlobalCars();
  
  const { toast } = useToast();
  
  const updateCar = async (car: Car) => {
    try {
      const carWithStatus = {
        ...car,
        status: car.status || 'published'
      };
      
      return await contextUpdateCar(carWithStatus);
    } catch (error) {
      console.error('Error in updateCar wrapper:', error);
      throw error;
    }
  };
  
  const addCar = (car: Car) => {
    try {
      const carWithStatus = {
        ...car,
        status: car.status || 'published'
      };
      
      return contextAddCar(carWithStatus);
    } catch (error) {
      console.error('Error in addCar wrapper:', error);
      throw error;
    }
  };
  
  const getMostViewedCars = (limit = 5): Car[] => {
    return [...cars]
      .filter(car => car.viewCount && car.viewCount > 0)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  };
  
  const exportCarsData = (): Car[] => {
    try {
      if (typeof contextExportCarsData === 'function') {
        return contextExportCarsData();
      }
      
      return cars;
    } catch (error) {
      console.error('Error exporting cars data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Произошла ошибка при экспорте данных автомобилей"
      });
      return [];
    }
  };
  
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
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
      
      let success = 0;
      let failed = 0;
      
      for (const car of carsArray) {
        try {
          addCar(car);
          success++;
        } catch (err) {
          console.error('Error importing car:', car, err);
          failed++;
        }
      }
      
      if (success > 0) {
        toast({
          title: "Импорт завершен",
          description: `Успешно импортировано: ${success}, не удалось: ${failed}`
        });
      } else if (failed > 0) {
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description: `Не удалось импортировать ни одного автомобиля. Ошибок: ${failed}`
        });
      }
      
      return { success, failed };
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
  };
  
  const getPopularCarModels = (limit = 5): { model: string, count: number }[] => {
    const modelCounts: Record<string, number> = {};
    cars.forEach(car => {
      const model = `${car.brand} ${car.model}`;
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    
    return Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };
  
  const getCarsByBodyType = (bodyType: string): Car[] => {
    return cars.filter(car => car.bodyType === bodyType);
  };
  
  const sortCars = (carsToSort: Car[], criterion: string) => {
    switch (criterion) {
      case 'priceAsc':
        return [...carsToSort].sort((a, b) => (a.price.base - (a.price.discount || 0)) - (b.price.base - (b.price.discount || 0)));
      case 'priceDesc':
        return [...carsToSort].sort((a, b) => (b.price.base - (b.price.discount || 0)) - (a.price.base - (a.price.discount || 0)));
      case 'yearDesc':
        return [...carsToSort].sort((a, b) => b.year - a.year);
      case 'yearAsc':
        return [...carsToSort].sort((a, b) => a.year - b.year);
      default:
        return carsToSort;
    }
  };

  return {
    cars,
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
