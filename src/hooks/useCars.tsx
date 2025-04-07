import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car, Order } from "../types/car";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, assignImageToCar as apiAssignImageToCar, saveOrderToJson } from "../services/api";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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
    importCarsData,
    syncOrders
  } = useGlobalCars();
  
  const { toast } = useToast();

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
  
  const getMostViewedCars = (limit = 5): Car[] => {
    return [...cars]
      .filter(car => car.viewCount && car.viewCount > 0)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
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

  const uploadCarImage = async (file: File): Promise<string | null> => {
    try {
      if (!file) {
        console.error('No file provided for upload');
        return null;
      }
      
      const serverPath = await uploadImage(file);
      
      if (!serverPath) {
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: "Не удалось загрузить изображение на сервер"
        });
        return null;
      }
      
      toast({
        title: "Изображение загружено",
        description: "Файл успешно загружен на сервер"
      });
      
      return serverPath;
    } catch (error) {
      console.error('Error uploading car image:', error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке изображения"
      });
      return null;
    }
  };

  const assignImageToCar = async (carId: string, imagePath: string): Promise<boolean> => {
    try {
      const success = await apiAssignImageToCar(carId, imagePath);
      
      if (success) {
        const car = getCarById(carId);
        if (car) {
          const updatedCar = {
            ...car,
            images: [
              {
                id: `server-${carId}`,
                url: imagePath,
                alt: `${car.brand} ${car.model}`
              },
              ...(car.images || [])
            ]
          };
          updateCar(updatedCar);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error assigning image to car:', error);
      return false;
    }
  };

  const updateCarImage = async (carId: string, file: File): Promise<boolean> => {
    try {
      if (!carId || !file) {
        console.error('Invalid parameters for updateCarImage');
        return false;
      }
      
      const imagePath = await uploadCarImage(file);
      if (!imagePath) {
        return false;
      }
      
      return await assignImageToCar(carId, imagePath);
    } catch (error) {
      console.error('Error updating car image:', error);
      return false;
    }
  };

  const saveUploadedImages = (images: {name: string, url: string}[]): void => {
    try {
      const existingImagesData = localStorage.getItem('carImages');
      let existingImages: {name: string, url: string}[] = [];
      
      if (existingImagesData) {
        existingImages = JSON.parse(existingImagesData);
      }
      
      const combinedImages = [...existingImages];
      
      for (const newImage of images) {
        if (!existingImages.some(img => img.name === newImage.name)) {
          combinedImages.push(newImage);
        }
      }
      
      localStorage.setItem('carImages', JSON.stringify(combinedImages));
      console.log(`Saved ${images.length} images to localStorage`);
    } catch (error) {
      console.error('Error saving uploaded images to localStorage:', error);
    }
  };
  
  const getUploadedImages = (): {name: string, url: string}[] => {
    try {
      const imagesData = localStorage.getItem('carImages');
      if (!imagesData) return [];
      
      return JSON.parse(imagesData);
    } catch (error) {
      console.error('Error getting uploaded images from localStorage:', error);
      return [];
    }
  };
  
  const saveImageByUrl = async (imageUrl: string): Promise<boolean> => {
    try {
      const filename = imageUrl.split('/').pop() || `image-${Date.now()}.jpg`;
      
      saveUploadedImages([{
        name: filename,
        url: imageUrl
      }]);
      
      return true;
    } catch (error) {
      console.error('Error saving image by URL:', error);
      return false;
    }
  };
  
  const isValidImageUrl = async (url: string): Promise<boolean> => {
    try {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
      
      return url.startsWith('http') && hasImageExtension;
    } catch (error) {
      console.error('Error validating image URL:', error);
      return false;
    }
  };

  const getCarServerImage = (carId: string): { id: string, url: string, alt: string } | null => {
    try {
      const carImageMapping = localStorage.getItem('carImageMapping');
      if (!carImageMapping) return null;
      
      const mapping = JSON.parse(carImageMapping);
      if (!mapping[carId]) return null;
      
      const car = getCarById(carId);
      
      return {
        id: `server-${carId}`,
        url: mapping[carId],
        alt: car ? `${car.brand} ${car.model}` : `Car ${carId}`
      };
    } catch (error) {
      console.error('Error getting car server image:', error);
      return null;
    }
  };

  const applySavedImagesToCar = (car: Car): Car => {
    if (!car) return car;
    
    try {
      if (car.images && car.images.length > 0 && 
          car.images.some(img => img && img.url && img.url.startsWith('/car/image/'))) {
        return car;
      }
      
      const serverImage = getCarServerImage(car.id);
      
      if (serverImage) {
        return {
          ...car,
          images: [serverImage, ...(car.images || [])]
        };
      }
      
      return car;
    } catch (error) {
      console.error('Error applying server images to car:', error);
      return car;
    }
  };

  const carsWithImages = cars.map(car => applySavedImagesToCar(car));
  const filteredCarsWithImages = filteredCars.map(car => applySavedImagesToCar(car));
  
  const getOrderCreationDate = (order: Order) => {
    try {
      return format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch (error) {
      console.error('Error formatting order date:', error);
      return 'Неизвестно';
    }
  };

  const createOrder = async (order: Order): Promise<boolean> => {
    try {
      console.log(`Начало создания заказа ${order.id}`);
      
      // Сохраняем в JSON как основной источник данных
      const jsonFilePath = await saveOrderToJson(order);
      console.log(`Заказ ${order.id} сохранен в JSON: ${jsonFilePath}`);
      
      const updatedOrder: Order = {
        ...order,
        syncStatus: 'synced' as const,
        jsonFilePath
      };
      
      // Обновляем локальное хранилище с защитой от ошибок
      try {
        const savedOrders = localStorage.getItem("orders");
        let currentOrders: Order[] = [];
        
        if (savedOrders) {
          currentOrders = JSON.parse(savedOrders);
        }
        
        // Проверяем, нет ли уже этого заказа в списке (избегаем дубликатов)
        const orderIndex = currentOrders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex >= 0) {
          currentOrders[orderIndex] = updatedOrder;
        } else {
          currentOrders.push(updatedOrder);
        }
        
        localStorage.setItem("orders", JSON.stringify(currentOrders));
        console.log(`Заказ ${order.id} сохранен в localStorage`);
      } catch (storageError) {
        console.error("Ошибка при сохранении заказа в localStorage:", storageError);
        // Продолжаем выполнение, т.к. JSON уже сохранен
      }
      
      // Принудительно синхронизируем, чтобы обновить заказы во всех браузерах
      try {
        await syncOrders();
        console.log("Выполнена принудительная синхронизация после создания заказа");
      } catch (syncError) {
        console.error("Ошибка синхронизации после создания заказа:", syncError);
        // Продолжаем выполнение, т.к. основные данные уже сохранены
      }
      
      toast({
        title: "Заказ создан",
        description: "Ваш заказ был успешно создан и сохранен"
      });
      
      return true;
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      
      // В случае ошибки сохранения в JSON, сохраняем локально с пометкой ошибки
      try {
        const savedOrders = localStorage.getItem("orders");
        let currentOrders: Order[] = [];
        
        if (savedOrders) {
          currentOrders = JSON.parse(savedOrders);
        }
        
        const failedOrder: Order = {
          ...order,
          syncStatus: 'failed' as const
        };
        
        currentOrders.push(failedOrder);
        localStorage.setItem("orders", JSON.stringify(currentOrders));
        console.log(`Заказ ${order.id} сохранен локально с пометкой об ошибке`);
      } catch (storageError) {
        console.error("Не удалось сохранить заказ даже локально:", storageError);
      }
      
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Заказ сохранен локально, но возникла ошибка при сохранении в файл"
      });
      
      return false;
    }
  };

  return {
    cars: carsWithImages,
    filteredCars: filteredCarsWithImages,
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
    sortCars: (carsToSort: Car[], criterion: string) => {
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
    },
    exportCarsData,
    importCarsData,
    uploadCarImage,
    assignImageToCar,
    updateCarImage,
    applySavedImagesToCar,
    getCarServerImage,
    saveUploadedImages,
    getUploadedImages,
    saveImageByUrl,
    isValidImageUrl,
    createOrder,
    exportOrdersToCsv: () => {
      if (!orders || orders.length === 0) {
        return '';
      }

      const headers = [
        'ID', 'Дата создания', 'Статус', 'Имя клиента', 
        'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель', 'Синхронизация', 'JSON файл'
      ];
      
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      for (const order of orders) {
        const car = getCarById(order.carId);
        const row = [
          order.id,
          getOrderCreationDate(order),
          order.status,
          order.customerName,
          order.customerPhone,
          order.customerEmail,
          order.carId,
          car ? car.brand : 'Н/Д',
          car ? car.model : 'Н/Д',
          order.syncStatus || 'Н/Д',
          order.jsonFilePath || 'Н/Д'
        ];
        
        const escapedRow = row.map(value => {
          const strValue = String(value).replace(/"/g, '""');
          return value.includes(',') || value.includes('"') || value.includes('\n') 
            ? `"${strValue}"` 
            : strValue;
        });
        
        csvRows.push(escapedRow.join(','));
      }
      
      return csvRows.join('\n');
    },
    getOrderCreationDate,
    syncOrders: async () => {
      try {
        await syncOrders();
        toast({
          title: "Синхронизация завершена",
          description: "Заказы успешно синхронизированы"
        });
        return true;
      } catch (error) {
        console.error("Ошибка синхронизации заказов:", error);
        toast({
          variant: "destructive",
          title: "Ошибка синхронизации",
          description: "Не удалось синхронизировать заказы"
        });
        return false;
      }
    },
    addToFavorites,
    removeFromFavorites,
    addToCompare,
    removeFromCompare
  };
};
