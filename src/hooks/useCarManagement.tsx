
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car } from "../types/car";
import { useToast } from "@/hooks/use-toast";
import { apiAdapter } from "@/services/adapter";

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
        status: car.status || 'published',
        isNew: car.isNew === undefined ? false : car.isNew,
        isPopular: car.isPopular === undefined ? false : car.isPopular
      };
      
      console.log('Updating car with status:', carWithStatus);
      return await contextUpdateCar(carWithStatus);
    } catch (error) {
      console.error('Error in updateCar wrapper:', error);
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении автомобиля"
      });
      throw error;
    }
  };
  
  const addCar = (car: Car) => {
    try {
      const carWithStatus = {
        ...car,
        status: car.status || 'published',
        isNew: car.isNew === undefined ? false : car.isNew,
        isPopular: car.isPopular === undefined ? false : car.isPopular
      };
      
      console.log('Adding car with status:', carWithStatus);
      return contextAddCar(carWithStatus);
    } catch (error) {
      console.error('Error in addCar wrapper:', error);
      toast({
        variant: "destructive",
        title: "Ошибка добавления",
        description: "Произошла ошибка при добавлении автомобиля"
      });
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
  
  // Реализуем функции сортировки
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
    console.log('Сортировка по критерию:', criterion);
    
    switch (criterion) {
      case 'priceAsc':
        return [...carsToSort].sort((a, b) => {
          const priceA = a.price.base - (a.price.discount || 0);
          const priceB = b.price.base - (b.price.discount || 0);
          return priceA - priceB;
        });
      case 'priceDesc':
        return [...carsToSort].sort((a, b) => {
          const priceA = a.price.base - (a.price.discount || 0);
          const priceB = b.price.base - (b.price.discount || 0);
          return priceB - priceA;
        });
      case 'yearDesc':
        return [...carsToSort].sort((a, b) => b.year - a.year);
      case 'yearAsc':
        return [...carsToSort].sort((a, b) => a.year - b.year);
      default:
        return carsToSort;
    }
  };
  
  const getCarsByCountry = (country: string): Car[] => {
    return cars.filter(car => car.country === country);
  };
  
  const getAvailableCountries = (): string[] => {
    const countries = new Set<string>();
    cars.forEach(car => {
      if (car.country) {
        countries.add(car.country);
      }
    });
    return Array.from(countries);
  };

  // Функция для получения новых автомобилей с проверкой наличия
  const getNewCars = (limit?: number): Car[] => {
    // Добавляем дополнительную проверку isNew существует и равен true
    const newCars = cars.filter(car => car && car.isNew === true && car.status === 'published');
    console.log(`Найдено ${newCars.length} новых автомобилей из ${cars.length} всего`);
    
    if (cars.length > 0 && newCars.length === 0) {
      console.log('Данные по флагу isNew:', cars.map(car => ({ id: car.id, isNew: car.isNew })));
    }
    
    return limit ? newCars.slice(0, limit) : newCars;
  };
  
  // Функция для получения популярных автомобилей с проверкой наличия
  const getPopularCars = (limit?: number): Car[] => {
    // Добавляем дополнительную проверку isPopular существует и равен true
    const popularCars = cars.filter(car => car && car.isPopular === true && car.status === 'published');
    console.log(`Найдено ${popularCars.length} популярных автомобилей из ${cars.length} всего`);
    
    if (cars.length > 0 && popularCars.length === 0) {
      console.log('Данные по флагу isPopular:', cars.map(car => ({ id: car.id, isPopular: car.isPopular })));
    }
    
    return limit ? popularCars.slice(0, limit) : popularCars;
  };

  // Принудительно загружаем данные из API при инициализации хука
  const forceReloadCars = async () => {
    console.log("Принудительная загрузка автомобилей из API");
    try {
      const carsFromApi = await apiAdapter.getCars();
      console.log(`Загружено ${carsFromApi.length} автомобилей из API`);
      
      if (typeof reloadCars === 'function') {
        // Если есть метод reloadCars в контексте, вызываем его
        await reloadCars();
      }
      
      return carsFromApi;
    } catch (error) {
      console.error("Ошибка при загрузке автомобилей из API:", error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список автомобилей из API"
      });
      return [];
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
    forceReloadCars, // Добавляем новый метод
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
    getCarsByCountry,
    getAvailableCountries,
    getNewCars,
    getPopularCars
  };
};
