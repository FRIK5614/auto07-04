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
  
  // Improved function to get uploaded images with error handling
  const getUploadedImages = (): { name: string, url: string }[] => {
    try {
      const imagesData = localStorage.getItem('carImagesData');
      if (!imagesData) {
        console.log('No car images data found in localStorage');
        return [];
      }
      
      const parsedData = JSON.parse(imagesData);
      
      if (!Array.isArray(parsedData)) {
        console.log('Car images data is not an array, resetting');
        localStorage.setItem('carImagesData', JSON.stringify([]));
        return [];
      }
      
      // Filter out any invalid entries
      const validImages = parsedData.filter(img => img && img.url && typeof img.url === 'string');
      
      if (validImages.length !== parsedData.length) {
        console.log('Fixed invalid image entries in localStorage');
        localStorage.setItem('carImagesData', JSON.stringify(validImages));
      }
      
      return validImages;
    } catch (error) {
      console.error('Error getting uploaded images:', error);
      // Reset the storage if corrupted
      localStorage.setItem('carImagesData', JSON.stringify([]));
      return [];
    }
  };
  
  // Improved function to save uploaded images
  const saveUploadedImages = (images: { name: string, url: string }[]): void => {
    try {
      if (!images || images.length === 0) return;
      
      const validImages = images.filter(img => img && img.url && typeof img.url === 'string');
      
      if (validImages.length === 0) {
        console.log('No valid images to save');
        return;
      }
      
      const existingImagesStr = localStorage.getItem('carImagesData');
      let existingImages: { name: string, url: string }[] = [];
      
      if (existingImagesStr) {
        try {
          const parsed = JSON.parse(existingImagesStr);
          existingImages = Array.isArray(parsed) ? parsed.filter(img => img && img.url) : [];
        } catch (e) {
          console.error('Error parsing existing images:', e);
          existingImages = [];
        }
      }
      
      const existingUrls = new Set(existingImages.map(img => img.url));
      
      const newImages = validImages.filter(img => !existingUrls.has(img.url));
      
      const updatedImages = [...existingImages, ...newImages];
      
      localStorage.setItem('carImagesData', JSON.stringify(updatedImages));
      console.log('Images saved to localStorage:', updatedImages.length);
    } catch (error) {
      console.error('Error saving uploaded images:', error);
    }
  };
  
  const saveImageByUrl = (url: string, name: string = ''): boolean => {
    if (!url) {
      console.error('Empty URL provided to saveImageByUrl');
      return false;
    }
    
    try {
      const imageName = name || `image-${Date.now()}`;
      const imageData = { name: imageName, url: url };
      
      saveUploadedImages([imageData]);
      console.log(`Image saved by URL: ${url}`);
      return true;
    } catch (error) {
      console.error('Error saving image by URL:', error);
      return false;
    }
  };
  
  const isValidImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
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
  
  // Improved function to get car saved image
  const getCarSavedImage = (carId: string): { id: string, url: string, alt: string } | null => {
    if (!carId) return null;
    
    try {
      const carImagesMapping = localStorage.getItem('carImagesMapping');
      if (!carImagesMapping) return null;
      
      let mappings: Record<string, string>;
      
      try {
        mappings = JSON.parse(carImagesMapping);
      } catch (e) {
        console.error('Error parsing car images mapping, resetting:', e);
        localStorage.setItem('carImagesMapping', JSON.stringify({}));
        return null;
      }
      
      if (mappings[carId]) {
        const savedImages = getUploadedImages();
        const imageUrl = mappings[carId];
        const foundImage = savedImages.find(img => img.url === imageUrl);
        
        if (foundImage) {
          console.log(`Retrieved saved image for car ${carId}: ${imageUrl}`);
          return {
            id: `saved-${carId}`,
            url: foundImage.url,
            alt: `Car Image ${carId}`
          };
        } else {
          // The mapping exists but the image doesn't - fix this inconsistency
          console.log(`Image mapping exists for car ${carId} but image not found, fixing...`);
          
          // Try to find a valid image in the saved images
          if (savedImages.length > 0) {
            const newMapping = { ...mappings, [carId]: savedImages[0].url };
            localStorage.setItem('carImagesMapping', JSON.stringify(newMapping));
            
            return {
              id: `saved-${carId}`,
              url: savedImages[0].url,
              alt: `Car Image ${carId}`
            };
          } else {
            // If we don't have any images to map to, remove the invalid mapping
            const { [carId]: _, ...restMappings } = mappings;
            localStorage.setItem('carImagesMapping', JSON.stringify(restMappings));
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting car saved image:', error);
      return null;
    }
  };
  
  // Improved function to assign image to car
  const assignImageToCar = (carId: string, imageUrl: string): boolean => {
    if (!carId || !imageUrl) {
      console.error('Invalid parameters for assignImageToCar');
      return false;
    }
    
    try {
      const carImagesMapping = localStorage.getItem('carImagesMapping');
      let mappings: Record<string, string> = {};
      
      if (carImagesMapping) {
        try {
          mappings = JSON.parse(carImagesMapping);
        } catch (e) {
          console.error('Error parsing car images mapping, resetting:', e);
          mappings = {};
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
  
  // Improved function to update car image
  const updateCarImage = (carId: string, imageUrl: string): void => {
    if (!carId || !imageUrl) {
      console.error('Invalid parameters for updateCarImage');
      return;
    }
    
    // Make sure the image exists in our saved images
    const savedImages = getUploadedImages();
    const imageExists = savedImages.some(img => img.url === imageUrl);
    
    if (!imageExists) {
      console.log(`Saving image ${imageUrl} for car ${carId}`);
      saveImageByUrl(imageUrl, `car-${carId}-${Date.now()}`);
    }
    
    // Now assign the image to the car
    assignImageToCar(carId, imageUrl);
  };
  
  // Improved function to apply saved images to car
  const applySavedImagesToCar = (car: Car): Car => {
    if (!car) return car;
    
    try {
      // First check if the car already has images
      if (car.images && car.images.length > 0 && car.images[0] && car.images[0].url) {
        // The car already has at least one valid image, save it for future reference
        updateCarImage(car.id, car.images[0].url);
        return car;
      }
      
      // Try to get a saved image specifically for this car
      const savedCarImage = getCarSavedImage(car.id);
      
      if (savedCarImage) {
        console.log(`Applied saved image to car ${car.id}: ${savedCarImage.url}`);
        return {
          ...car,
          images: [savedCarImage]
        };
      }
      
      // If we don't have a specific image for this car, try to use any saved image
      const savedImages = getUploadedImages();
      
      if (savedImages.length > 0) {
        console.log(`Applying general saved image to car ${car.id}: ${savedImages[0].url}`);
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
      
      // If we don't have any saved images, use a placeholder
      console.log(`Using placeholder for car ${car.id}`);
      return {
        ...car,
        images: [{
          id: `placeholder-${car.id}`,
          url: '/placeholder.svg',
          alt: `${car.brand} ${car.model}`
        }]
      };
    } catch (error) {
      console.error('Error applying saved images to car:', error);
      
      // Return car with placeholder in case of any errors
      return {
        ...car,
        images: [{
          id: `placeholder-${car.id}`,
          url: '/placeholder.svg',
          alt: `${car.brand} ${car.model}`
        }]
      };
    }
  };
  
  // Process all cars with images before returning them
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
