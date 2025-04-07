
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car, Order } from "../types/car";

export const useCars = () => {
  const {
    cars,
    filteredCars,
    favorites,
    compareCars,
    orders,
    loading,
    error,
    filter,
    setFilter,
    addToFavorites,
    removeFromFavorites,
    addToCompare,
    removeFromCompare,
    clearCompare,
    getCarById,
    reloadCars,
    viewCar,
    deleteCar,
    updateCar,
    addCar,
    processOrder,
    getOrders,
    exportCarsData,
    importCarsData
  } = useGlobalCars();

  const favoriteCars = cars.filter(car => favorites.includes(car.id));
  
  const comparisonCars: Car[] = compareCars
    .map(id => cars.find(car => car.id === id))
    .filter((car): car is Car => car !== undefined);

  const toggleFavorite = (carId: string) => {
    if (favorites.includes(carId)) {
      removeFromFavorites(carId);
    } else {
      addToFavorites(carId);
    }
  };

  const toggleCompare = (carId: string) => {
    if (compareCars.includes(carId)) {
      removeFromCompare(carId);
    } else {
      addToCompare(carId);
    }
  };

  const isFavorite = (carId: string) => favorites.includes(carId);
  
  const isInCompare = (carId: string) => compareCars.includes(carId);
  
  // Get most viewed cars
  const getMostViewedCars = (limit = 5): Car[] => {
    return [...cars]
      .filter(car => car.viewCount && car.viewCount > 0)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
  };
  
  // Get most popular car models
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
  
  // Get cars by body type
  const getCarsByBodyType = (bodyType: string): Car[] => {
    return cars.filter(car => car.bodyType === bodyType);
  };
  
  // Функция для получения загруженных изображений
  const getUploadedImages = (): { name: string, url: string }[] => {
    try {
      const imagesData = localStorage.getItem('carImages');
      if (!imagesData) return [];
      
      const parsedData = JSON.parse(imagesData);
      return parsedData.map((img: { name: string, base64: string }) => ({
        name: img.name,
        url: img.base64
      }));
    } catch (error) {
      console.error('Error getting uploaded images:', error);
      return [];
    }
  };
  
  // Функция для сохранения изображений
  const saveUploadedImages = (images: { name: string, base64: string }[]): void => {
    try {
      // Сначала получаем существующие изображения
      const existingImagesStr = localStorage.getItem('carImages');
      let existingImages = [];
      
      if (existingImagesStr) {
        try {
          existingImages = JSON.parse(existingImagesStr);
        } catch (e) {
          console.error('Error parsing existing images:', e);
          existingImages = [];
        }
      }
      
      // Объединяем с новыми и сохраняем
      const updatedImages = [...existingImages, ...images];
      localStorage.setItem('carImages', JSON.stringify(updatedImages));
      console.log('Images saved to localStorage:', updatedImages.length);
    } catch (error) {
      console.error('Error saving uploaded images:', error);
    }
  };
  
  // Sort cars by specific criteria
  const sortCars = (carsToSort: Car[], criterion: string): Car[] => {
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
  
  // Экспорт заказов в CSV
  const exportOrdersToCsv = (): string => {
    if (!orders || orders.length === 0) {
      return '';
    }

    // Заголовки CSV
    const headers = [
      'ID', 'Дата создания', 'Статус', 'Имя клиента', 
      'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель'
    ];
    
    // Формируем строки CSV
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const order of orders) {
      const car = getCarById(order.carId);
      const row = [
        order.id,
        new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' '),
        order.status,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.carId,
        car ? car.brand : 'Н/Д',
        car ? car.model : 'Н/Д'
      ];
      
      // Экранируем запятые и кавычки
      const escapedRow = row.map(value => {
        const strValue = String(value).replace(/"/g, '""');
        return value.includes(',') || value.includes('"') || value.includes('\n') 
          ? `"${strValue}"` 
          : strValue;
      });
      
      csvRows.push(escapedRow.join(','));
    }
    
    // Возвращаем CSV контент
    return csvRows.join('\n');
  };
  
  return {
    cars,
    filteredCars,
    favoriteCars,
    comparisonCars,
    compareCarsIds: compareCars,
    orders,
    loading,
    error,
    filter,
    setFilter,
    toggleFavorite,
    toggleCompare,
    clearCompare,
    isFavorite,
    isInCompare,
    getCarById,
    reloadCars,
    viewCar,
    deleteCar,
    updateCar,
    addCar,
    processOrder,
    getOrders,
    getMostViewedCars,
    getPopularCarModels,
    getCarsByBodyType,
    sortCars,
    exportCarsData,
    importCarsData,
    getUploadedImages,
    saveUploadedImages,
    exportOrdersToCsv,
    // Export these functions to fix the build errors
    addToFavorites,
    removeFromFavorites,
    addToCompare,
    removeFromCompare
  };
};
