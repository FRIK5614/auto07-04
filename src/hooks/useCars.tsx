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
  
  const getUploadedImages = (): { name: string, url: string }[] => {
    try {
      const imagesData = localStorage.getItem('carImagesData');
      if (!imagesData) return [];
      
      const parsedData = JSON.parse(imagesData);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error('Error getting uploaded images:', error);
      return [];
    }
  };
  
  const saveUploadedImages = (images: { name: string, url: string }[]): void => {
    try {
      if (!images || images.length === 0) return;
      
      const existingImagesStr = localStorage.getItem('carImagesData');
      let existingImages: { name: string, url: string }[] = [];
      
      if (existingImagesStr) {
        try {
          const parsed = JSON.parse(existingImagesStr);
          existingImages = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing existing images:', e);
          existingImages = [];
        }
      }
      
      const existingUrls = new Set(existingImages.map(img => img.url));
      
      const newImages = images.filter(img => !existingUrls.has(img.url));
      
      const updatedImages = [...existingImages, ...newImages];
      
      localStorage.setItem('carImagesData', JSON.stringify(updatedImages));
      console.log('Images saved to localStorage:', updatedImages.length);
    } catch (error) {
      console.error('Error saving uploaded images:', error);
    }
  };
  
  const saveImageByUrl = (url: string, name: string = ''): boolean => {
    try {
      const imageName = name || `image-${Date.now()}`;
      const imageData = { name: imageName, url: url };
      
      saveUploadedImages([imageData]);
      return true;
    } catch (error) {
      console.error('Error saving image by URL:', error);
      return false;
    }
  };
  
  const isValidImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('Content-Type') || '';
      return response.ok && contentType.startsWith('image/');
    } catch (error) {
      console.error('Error validating image URL:', error);
      return false;
    }
  };
  
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
  
  const getOrderCreationDate = (order: Order): string => {
    try {
      return new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
      console.error('Error formatting order date:', error);
      return 'Неизвестно';
    }
  };
  
  const exportOrdersToCsv = (): string => {
    if (!orders || orders.length === 0) {
      return '';
    }

    const headers = [
      'ID', 'Дата создания', 'Статус', 'Имя клиента', 
      'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель'
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
        car ? car.model : 'Н/Д'
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
  };
  
  const getCarSavedImage = (carId: string): { id: string, url: string, alt: string } | null => {
    try {
      const carImagesMapping = localStorage.getItem('carImagesMapping');
      if (carImagesMapping) {
        const mappings = JSON.parse(carImagesMapping);
        if (mappings[carId]) {
          const savedImages = getUploadedImages();
          const imageUrl = mappings[carId];
          const foundImage = savedImages.find(img => img.url === imageUrl);
          
          if (foundImage) {
            return {
              id: `saved-${carId}`,
              url: foundImage.url,
              alt: `Car Image ${carId}`
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting car saved image:', error);
      return null;
    }
  };
  
  const assignImageToCar = (carId: string, imageUrl: string): boolean => {
    try {
      const carImagesMapping = localStorage.getItem('carImagesMapping');
      let mappings = {};
      
      if (carImagesMapping) {
        try {
          mappings = JSON.parse(carImagesMapping);
        } catch (e) {
          console.error('Error parsing car images mapping:', e);
        }
      }
      
      mappings[carId] = imageUrl;
      localStorage.setItem('carImagesMapping', JSON.stringify(mappings));
      console.log(`Image ${imageUrl} assigned to car ${carId}`);
      return true;
    } catch (error) {
      console.error('Error assigning image to car:', error);
      return false;
    }
  };
  
  const updateCarImage = (carId: string, imageUrl: string): void => {
    const savedImages = getUploadedImages();
    const imageExists = savedImages.some(img => img.url === imageUrl);
    
    if (!imageExists) {
      saveImageByUrl(imageUrl);
    }
    
    assignImageToCar(carId, imageUrl);
  };
  
  const applySavedImagesToCar = (car: Car): Car => {
    if (car.images && car.images.length > 0) {
      return car;
    }
    
    const savedCarImage = getCarSavedImage(car.id);
    
    if (savedCarImage) {
      return {
        ...car,
        images: [savedCarImage]
      };
    }
    
    const savedImages = getUploadedImages();
    
    if (savedImages.length > 0) {
      assignImageToCar(car.id, savedImages[0].url);
      
      return {
        ...car,
        images: [{
          id: `saved-${car.id}`,
          url: savedImages[0].url,
          alt: `${car.brand} ${car.model}`
        }]
      };
    }
    
    return {
      ...car,
      images: [{
        id: `placeholder-${car.id}`,
        url: '/placeholder.svg',
        alt: `${car.brand} ${car.model}`
      }]
    };
  };
  
  const carsWithImages = cars.map(applySavedImagesToCar);
  const filteredCarsWithImages = filteredCars.map(applySavedImagesToCar);
  
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
    sortCars,
    exportCarsData,
    importCarsData,
    getUploadedImages,
    saveUploadedImages,
    saveImageByUrl,
    isValidImageUrl,
    exportOrdersToCsv,
    getOrderCreationDate,
    addToFavorites,
    removeFromFavorites,
    addToCompare,
    removeFromCompare,
    applySavedImagesToCar,
    updateCarImage,
    assignImageToCar,
    getCarSavedImage
  };
};
