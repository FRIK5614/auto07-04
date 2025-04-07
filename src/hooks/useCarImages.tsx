
import { useState } from "react";
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car, CarImage } from "../types/car";
import { useToast } from "@/hooks/use-toast";

// Определяем базовый URL для API
const API_BASE_URL = 'https://metallika29.ru/public/api';

export const useCarImages = () => {
  const {
    getCarById,
    updateCar
  } = useGlobalCars();
  
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Загрузка изображения на сервер
  const uploadCarImage = async (file: File, carId?: string): Promise<CarImage | null> => {
    try {
      setIsUploading(true);
      
      if (!file) {
        console.error('No file provided for upload');
        return null;
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      if (carId) {
        formData.append('carId', carId);
      }
      
      const response = await fetch(`${API_BASE_URL}/images/upload.php`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        toast({
          title: "Изображение загружено",
          description: "Файл успешно загружен на сервер"
        });
        
        return {
          id: result.data.id || `img-${Date.now()}`,
          url: result.data.url,
          alt: `Изображение автомобиля${carId ? ` ${carId}` : ''}`
        };
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: result.message || "Не удалось загрузить изображение на сервер"
        });
        
        return null;
      }
    } catch (error) {
      console.error('Error uploading car image:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке изображения"
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Получение изображений автомобиля с сервера
  const fetchCarImages = async (carId: string): Promise<CarImage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/get_car_images.php?carId=${encodeURIComponent(carId)}`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || `Изображение автомобиля ${carId}`
        }));
      } else {
        console.error('Ошибка получения изображений автомобиля:', result.message || 'Неизвестная ошибка');
        return [];
      }
    } catch (error) {
      console.error('Error fetching car images:', error);
      return [];
    }
  };

  // Обновление изображений автомобиля в контексте
  const updateCarImagesInContext = async (carId: string): Promise<boolean> => {
    try {
      const car = getCarById(carId);
      if (!car) return false;
      
      const images = await fetchCarImages(carId);
      
      if (images.length > 0) {
        const updatedCar = {
          ...car,
          images: images
        };
        
        updateCar(updatedCar);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating car images in context:', error);
      return false;
    }
  };

  // Установка главного изображения для автомобиля
  const setMainImage = async (imageId: string, carId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/set_main_image.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: imageId, carId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Главное изображение установлено",
          description: "Главное изображение автомобиля обновлено"
        });
        
        // Обновляем изображения в контексте
        await updateCarImagesInContext(carId);
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: result.message || "Не удалось установить главное изображение"
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error setting main image:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при установке главного изображения"
      });
      
      return false;
    }
  };

  // Удаление изображения
  const deleteImage = async (imageId: string, carId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/delete_image.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: imageId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Изображение удалено",
          description: "Изображение успешно удалено"
        });
        
        // Обновляем изображения в контексте
        await updateCarImagesInContext(carId);
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка удаления",
          description: result.message || "Не удалось удалить изображение"
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении изображения"
      });
      
      return false;
    }
  };

  // Добавление изображения по URL
  const addImageByUrl = async (imageUrl: string, carId: string): Promise<boolean> => {
    try {
      // Проверяем доступность изображения
      const checkImage = new Image();
      checkImage.src = imageUrl;
      
      await new Promise<void>((resolve, reject) => {
        checkImage.onload = () => resolve();
        checkImage.onerror = () => reject(new Error('Изображение недоступно'));
      });
      
      // Создаем новое изображение через API
      const response = await fetch(`${API_BASE_URL}/images/add_by_url.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: imageUrl, 
          carId: carId,
          alt: `Изображение автомобиля ${carId}`
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Изображение добавлено",
          description: "Изображение по URL успешно добавлено"
        });
        
        // Обновляем изображения в контексте
        await updateCarImagesInContext(carId);
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка добавления",
          description: result.message || "Не удалось добавить изображение по URL"
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error adding image by URL:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка добавления",
        description: "Произошла ошибка при добавлении изображения по URL"
      });
      
      return false;
    }
  };

  // Обновить изображение автомобиля (загрузка и установка)
  const updateCarImage = async (carId: string, file: File): Promise<boolean> => {
    try {
      const image = await uploadCarImage(file, carId);
      
      if (image) {
        // Обновляем изображения в контексте
        await updateCarImagesInContext(carId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating car image:', error);
      return false;
    }
  };

  // Получение главного изображения автомобиля
  const getMainCarImage = (car: Car): string => {
    if (!car || !car.images || car.images.length === 0) {
      return '/placeholder.svg';
    }
    
    // Ищем главное изображение (с флагом isMain)
    const mainImage = car.images.find(img => img.isMain);
    if (mainImage) return mainImage.url;
    
    // Если главное не найдено, берем первое
    return car.images[0].url;
  };

  // Применение изображений к автомобилю
  const applySavedImagesToCar = (car: Car): Car => {
    if (!car) return car;
    
    try {
      // Если у автомобиля уже есть изображения, оставляем их
      if (car.images && car.images.length > 0) {
        return car;
      }
      
      // Иначе запрашиваем с сервера
      fetchCarImages(car.id)
        .then(images => {
          if (images.length > 0) {
            const updatedCar = { ...car, images };
            updateCar(updatedCar);
          }
        })
        .catch(error => {
          console.error('Error fetching images for car:', error);
        });
      
      return car;
    } catch (error) {
      console.error('Error applying saved images to car:', error);
      return car;
    }
  };

  return {
    uploadCarImage,
    fetchCarImages,
    updateCarImagesInContext,
    setMainImage,
    deleteImage,
    addImageByUrl,
    updateCarImage,
    applySavedImagesToCar,
    getMainCarImage,
    isUploading
  };
};
