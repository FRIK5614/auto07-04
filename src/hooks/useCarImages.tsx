
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Car } from "../types/car";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, assignImageToCar as apiAssignImageToCar } from "../services/api";

export const useCarImages = () => {
  const {
    getCarById,
    updateCar
  } = useGlobalCars();
  
  const { toast } = useToast();

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

  return {
    uploadCarImage,
    assignImageToCar,
    updateCarImage,
    applySavedImagesToCar,
    getCarServerImage,
    saveUploadedImages,
    getUploadedImages,
    saveImageByUrl,
    isValidImageUrl
  };
};
