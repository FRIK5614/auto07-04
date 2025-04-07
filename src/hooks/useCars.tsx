
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";
import { Car } from "@/types/car";

export const useCars = () => {
  const carManagement = useCarManagement();
  const favoritesAndCompare = useFavoritesAndCompare();
  const carImages = useCarImages();
  const orderManagement = useOrderManagement();
  
  const { cars, filteredCars } = carManagement;
  
  // Apply saved images to all cars
  const carsWithImages = cars.map(car => carImages.applySavedImagesToCar(car));
  const filteredCarsWithImages = filteredCars.map(car => carImages.applySavedImagesToCar(car));

  // Create a loadCars convenience method that wraps reloadCars from carManagement
  const loadCars = () => {
    return carManagement.reloadCars();
  };
  
  // Add exportCarsData and importCarsData methods with proper typing
  const exportCarsData = () => {
    return carManagement.exportCarsData();
  };
  
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    return carManagement.importCarsData(data);
  };

  return {
    // Car management
    ...carManagement,
    // Overwrite cars with image-enhanced versions
    cars: carsWithImages,
    filteredCars: filteredCarsWithImages,
    loadCars,
    exportCarsData,
    importCarsData,
    
    // Favorites and comparison
    ...favoritesAndCompare,
    
    // Car images
    ...carImages,
    
    // Order management
    ...orderManagement,
  };
};
