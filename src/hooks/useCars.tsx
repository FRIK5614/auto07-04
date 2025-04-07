
import { useCarManagement } from "./useCarManagement";
import { useFavoritesAndCompare } from "./useFavoritesAndCompare";
import { useCarImages } from "./useCarImages";
import { useOrderManagement } from "./useOrderManagement";

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

  // Create exportOrdersToCsv function
  const exportOrdersToCsv = () => {
    const orders = orderManagement.orders;
    if (!orders || orders.length === 0) return "";
    
    const headers = [
      'ID', 'Дата создания', 'Статус', 'Имя клиента', 
      'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const order of orders) {
      const car = carManagement.getCarById(order.carId);
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
      
      const escapedRow = row.map(value => {
        const strValue = String(value).replace(/"/g, '""');
        return strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') 
          ? `"${strValue}"` 
          : strValue;
      });
      
      csvRows.push(escapedRow.join(','));
    }
    
    return csvRows.join('\n');
  };

  return {
    // Car management
    ...carManagement,
    // Overwrite cars with image-enhanced versions
    cars: carsWithImages,
    filteredCars: filteredCarsWithImages,
    loadCars, // Add the loadCars method
    
    // Favorites and comparison
    ...favoritesAndCompare,
    
    // Car images
    ...carImages,
    
    // Order management
    ...orderManagement,
    
    // Add the CSV export functionality
    exportOrdersToCsv
  };
};
