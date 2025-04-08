
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";
import { Car } from "@/types/car";
import { useToast } from "@/hooks/use-toast";

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
  const loadCars = () => {
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
  };
  
  // Make sure exportCarsData returns Car[]
  const exportCarsData = (): Car[] => {
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
  };
  
  // Import cars data with proper typing and error handling
  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    try {
      return carManagement.importCarsData(data);
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
  };
  
  // Extract these methods from orderManagement to ensure they're properly typed
  const { createOrder, syncOrders, processOrder, deleteOrder, orders, loading: orderLoading } = orderManagement;
  
  // Explicitly extract key methods from carManagement with error handling
  const { 
    updateCar: rawUpdateCar, 
    addCar: rawAddCar, 
    deleteCar: rawDeleteCar,
    getCarById,
    viewCar
  } = carManagement;
  
  // Wrap these methods with proper error handling
  const updateCar = async (car: Car) => {
    try {
      await rawUpdateCar(car);
      return true;
    } catch (error) {
      console.error('Error updating car in useCars:', error);
      return false;
    }
  };
  
  const addCar = (car: Car) => {
    try {
      return rawAddCar(car);
    } catch (error) {
      console.error('Error adding car in useCars:', error);
      throw error;
    }
  };
  
  const deleteCar = (carId: string) => {
    try {
      rawDeleteCar(carId);
    } catch (error) {
      console.error('Error deleting car in useCars:', error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении автомобиля"
      });
      throw error;
    }
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
