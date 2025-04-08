
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";
import { Car } from "@/types/car";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export const useCars = () => {
  const carManagement = useCarManagement();
  const favoritesAndCompare = useFavoritesAndCompare();
  const carImages = useCarImages();
  const orderManagement = useOrderManagement();
  const { toast } = useToast();
  
  const { cars, filteredCars } = carManagement;
  
  // Apply saved images to all cars
  const carsWithImages = cars.map(car => carImages.applySavedImagesToCar(car));
  const filteredCarsWithImages = filteredCars.map(car => carImages.applySavedImagesToCar(car));

  // Create a loadCars convenience method that wraps reloadCars from carManagement
  const loadCars = useCallback(() => {
    console.log('Loading cars via useCars hook');
    try {
      return carManagement.reloadCars();
    } catch (error) {
      console.error('Error loading cars:', error);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список автомобилей"
      });
      return Promise.resolve();
    }
  }, [carManagement, toast]);
  
  // Make sure exportCarsData returns Car[]
  const exportCarsData = useCallback((): Car[] => {
    try {
      return carManagement.exportCarsData();
    } catch (error) {
      console.error('Error exporting cars data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные автомобилей"
      });
      return [];
    }
  }, [carManagement, toast]);
  
  // Import cars data with proper typing and error handling
  const importCarsData = useCallback((data: Car[] | Car): { success: number, failed: number } => {
    try {
      const result = carManagement.importCarsData(data);
      // Force reload after import
      loadCars();
      return result;
    } catch (error) {
      console.error('Error importing cars data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Произошла ошибка при импорте данных автомобилей"
      });
      const count = Array.isArray(data) ? data.length : 1;
      return { success: 0, failed: count };
    }
  }, [carManagement, loadCars, toast]);

  // Extract favorites and compare lists
  const { favorites, compareCars } = favoritesAndCompare;

  // Add these properties for compatibility with the Header component
  const favoriteCarIds = favorites;
  const compareCarIds = compareCars;
  
  // Extract these methods from orderManagement to ensure they're properly typed
  const { createOrder, syncOrders, processOrder, deleteOrder, orders, loading: orderLoading } = orderManagement;
  
  // Explicitly extract key methods from carManagement with error handling
  const { 
    updateCar: rawUpdateCar, 
    addCar: rawAddCar, 
    deleteCar: rawDeleteCar,
    getCarById,
    viewCar,
    getCarsByCountry,
    getAvailableCountries
  } = carManagement;
  
  // Wrap these methods with proper error handling
  const updateCar = useCallback(async (car: Car) => {
    try {
      await rawUpdateCar(car);
      await loadCars(); // Reload cars after update
      return true;
    } catch (error) {
      console.error('Error updating car in useCars:', error);
      return false;
    }
  }, [rawUpdateCar, loadCars]);
  
  const addCar = useCallback((car: Car) => {
    try {
      const result = rawAddCar(car);
      loadCars(); // Reload cars after adding
      return result;
    } catch (error) {
      console.error('Error adding car in useCars:', error);
      throw error;
    }
  }, [rawAddCar, loadCars]);
  
  const deleteCar = useCallback((carId: string) => {
    try {
      rawDeleteCar(carId);
      loadCars(); // Reload cars after deletion
    } catch (error) {
      console.error('Error deleting car in useCars:', error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении автомобиля"
      });
      throw error;
    }
  }, [rawDeleteCar, loadCars, toast]);

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
    getCarsByCountry,
    getAvailableCountries,
    
    // Favorites and comparison
    ...favoritesAndCompare,
    // Add explicit properties needed by Header component
    favoriteCarIds,
    compareCarIds,
    
    // Car images
    ...carImages,
    
    // Order management
    ...orderManagement,
    createOrder,
    syncOrders,
    processOrder,
    deleteOrder,
    orders,
    orderLoading,
  };
};
