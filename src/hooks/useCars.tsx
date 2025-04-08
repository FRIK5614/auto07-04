
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
    console.log('Loading cars via useCars hook');
    return carManagement.reloadCars();
  };
  
  // Make sure exportCarsData returns Car[]
  const exportCarsData = (): Car[] => {
    return carManagement.exportCarsData();
  };
  
  // Import cars data with proper typing
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    return carManagement.importCarsData(data);
  };
  
  // Extract these methods from orderManagement to ensure they're properly typed
  const { createOrder, syncOrders, processOrder, deleteOrder, orders, loading: orderLoading } = orderManagement;
  
  // Explicitly extract key methods from carManagement
  const { 
    updateCar, 
    addCar, 
    deleteCar,
    getCarById,
    viewCar
  } = carManagement;

  return {
    // Car management
    ...carManagement,
    // Overwrite cars with image-enhanced versions
    cars: carsWithImages,
    filteredCars: filteredCarsWithImages,
    loadCars,
    exportCarsData,
    importCarsData,
    updateCar,
    addCar,
    deleteCar,
    getCarById,
    viewCar,
    
    // Favorites and comparison
    ...favoritesAndCompare,
    
    // Car images
    ...carImages,
    
    // Order management
    // We'll spread orderManagement but also explicitly include key functions
    // to ensure TypeScript recognizes them
    ...orderManagement,
    createOrder,
    syncOrders,
    processOrder,
    deleteOrder,
    orders,
    orderLoading,
  };
};
