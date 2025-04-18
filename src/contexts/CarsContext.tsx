import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car, CarFilter, Order, OrdersFile } from "../types/car";
import { fetchAllCars, loadOrdersFromJson, saveOrderToJson } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

interface CarsContextType {
  cars: Car[];
  filteredCars: Car[];
  favorites: string[];
  compareCars: string[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  filter: CarFilter;
  setFilter: (filter: CarFilter) => void;
  addToFavorites: (carId: string) => void;
  removeFromFavorites: (carId: string) => void;
  addToCompare: (carId: string) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  getCarById: (id: string) => Car | undefined;
  reloadCars: () => Promise<void>;
  viewCar: (carId: string) => void;
  deleteCar: (carId: string) => void;
  updateCar: (car: Car) => void;
  addCar: (car: Car) => void;
  processOrder: (orderId: string, status: Order['status']) => void;
  getOrders: () => Order[];
  exportCarsData: () => Car[];
  importCarsData: (data: Car[] | Car) => { success: number, failed: number };
  syncOrders: () => Promise<void>;
}

const CarsContext = createContext<CarsContextType | undefined>(undefined);

export const CarsProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareCars, setCompareCars] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CarFilter>({});
  const { toast } = useToast();

  const syncOrders = async () => {
    try {
      console.log("Начало синхронизации заказов с JSON...");
      const jsonOrders = await loadOrdersFromJson();
      
      if (!jsonOrders || jsonOrders.length === 0) {
        console.log("JSON-файлы с заказами не найдены");
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          try {
            const localOrders = JSON.parse(savedOrders);
            if (localOrders && localOrders.length > 0) {
              console.log(`Найдено ${localOrders.length} локальных заказов, но нет JSON. Используем локальные.`);
              for (const localOrder of localOrders) {
                try {
                  const jsonFilePath = await saveOrderToJson(localOrder);
                  localOrder.jsonFilePath = jsonFilePath;
                  localOrder.syncStatus = 'synced';
                } catch (saveError) {
                  console.error(`Ошибка при сохранении локального заказа ${localOrder.id} в JSON:`, saveError);
                }
              }
              localStorage.setItem("orders", JSON.stringify(localOrders));
              setOrders(localOrders);
              return;
            }
          } catch (parseError) {
            console.error("Ошибка при разборе локальных заказов:", parseError);
          }
        }
        return;
      }

      console.log(`Получено ${jsonOrders.length} заказов из JSON-файлов`);

      const ordersWithSyncStatus = jsonOrders.map(order => ({
        ...order,
        syncStatus: order.syncStatus || 'synced' as const
      }));
      
      setOrders(ordersWithSyncStatus);
      
      try {
        localStorage.setItem("orders", JSON.stringify(ordersWithSyncStatus));
      } catch (storageError) {
        console.error("Ошибка при сохранении заказов в localStorage:", storageError);
        
        if (ordersWithSyncStatus.length > 50) {
          const limitedOrders = ordersWithSyncStatus.slice(-50);
          try {
            localStorage.setItem("orders", JSON.stringify(limitedOrders));
            console.log("Сохранены последние 50 заказов из-за ограничений localStorage");
          } catch (limitError) {
            console.error("Не удалось сохранить даже ограниченный список заказов:", limitError);
          }
        }
      }
      
      const csvContent = saveOrdersToCSV();
      localStorage.setItem("ordersCSVBackup", csvContent);
      localStorage.setItem("ordersCSVBackupTime", new Date().toISOString());
      console.log("Синхронизация заказов успешно завершена");
    } catch (error) {
      console.error("Ошибка при синхронизации заказов:", error);
      
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
          console.log("Восстановлены заказы из localStorage после ошибки синхронизации");
        } catch (err) {
          console.error("Ошибка при восстановлении заказов из localStorage:", err);
        }
      }
      
      throw error;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await syncOrders();
      } catch (fetchError) {
        console.error("Ошибка при загрузке заказов:", fetchError);
        const savedOrders = localStorage.getItem("orders");
        if (savedOrders) {
          try {
            setOrders(JSON.parse(savedOrders));
            console.log("Загружены заказы из localStorage");
          } catch (err) {
            console.error("Ошибка при разборе сохраненных заказов:", err);
          }
        }
      }
    };
    
    fetchOrders();
    
    const syncInterval = setInterval(() => {
      syncOrders().catch(error => {
        console.error("Периодическая синхронизация не удалась:", error);
      });
    }, 10000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("orders", JSON.stringify(orders));
      
      const csvContent = saveOrdersToCSV();
      localStorage.setItem("ordersCSVBackup", csvContent);
      localStorage.setItem("ordersCSVBackupTime", new Date().toISOString());
    }
  }, [orders]);

  const saveOrdersToCSV = () => {
    if (!orders || orders.length === 0) return "";
    
    const headers = [
      'ID', 'Дата создания', 'Статус', 'Имя клиента', 
      'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель', 'Синхронизация', 'JSON файл'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const order of orders) {
      const car = cars.find(c => c.id === order.carId);
      const row = [
        order.id,
        new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' '),
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
    
    const csvContent = csvRows.join('\n');
    return csvContent;
  };

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const savedCars = localStorage.getItem("carsCatalog");
      if (savedCars) {
        try {
          const parsedCars = JSON.parse(savedCars);
          console.log("Loaded cars from localStorage:", parsedCars.length);
          setCars(parsedCars);
          setFilteredCars(parsedCars);
          setLoading(false);
          
          await syncOrders();
          
          fetchAllCars().then(apiCars => {
            if (apiCars && apiCars.length > 0) {
              setCars(apiCars);
              setFilteredCars(apiCars);
              localStorage.setItem("carsCatalog", JSON.stringify(apiCars));
            }
          }).catch(err => {
            console.error("Background refresh of cars failed:", err);
          });
          
          return;
        } catch (err) {
          console.error("Failed to parse saved cars, will load from API:", err);
        }
      }
      
      const data = await fetchAllCars();
      console.log("Loaded cars from API:", data.length);
      setCars(data);
      setFilteredCars(data);
      localStorage.setItem("carsCatalog", JSON.stringify(data));
      
      await syncOrders();
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load cars:", err);
      const errorMessage = "Не удалось загрузить данные об автомобилях";
      setError(errorMessage);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: errorMessage
      });
    }
  };

  const createSampleOrders = async (data: Car[]) => {
    const sampleOrders: Order[] = [
      {
        id: "order1",
        carId: data[0]?.id || "car1",
        customerName: "Иван Иванов",
        customerPhone: "+7 (999) 123-45-67",
        customerEmail: "ivan@example.com",
        status: "new",
        createdAt: new Date().toISOString(),
        syncStatus: "pending"
      },
      {
        id: "order2",
        carId: data[1]?.id || "car2",
        customerName: "Петр Петров",
        customerPhone: "+7 (999) 765-43-21",
        customerEmail: "petr@example.com",
        status: "processing",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        syncStatus: "pending"
      },
      {
        id: "order3",
        carId: data[2]?.id || "car3",
        customerName: "Мария Сидорова",
        customerPhone: "+7 (999) 555-55-55",
        customerEmail: "maria@example.com",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        syncStatus: "pending"
      },
    ];
    
    setOrders(sampleOrders);
    localStorage.setItem("orders", JSON.stringify(sampleOrders));
    
    for (const order of sampleOrders) {
      try {
        const jsonFilePath = await saveOrderToJson(order);
        order.jsonFilePath = jsonFilePath;
        order.syncStatus = "synced";
      } catch (error) {
        console.error(`Failed to save sample order ${order.id} to JSON:`, error);
        order.syncStatus = "failed";
      }
    }
    
    localStorage.setItem("orders", JSON.stringify(sampleOrders));
  };

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const savedCompareCars = localStorage.getItem("compareCars");
    if (savedCompareCars) {
      setCompareCars(JSON.parse(savedCompareCars));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("compareCars", JSON.stringify(compareCars));
  }, [compareCars]);

  useEffect(() => {
    let result = [...cars];

    if (filter.brands && filter.brands.length > 0) {
      result = result.filter(car => filter.brands?.includes(car.brand));
    }

    if (filter.models && filter.models.length > 0) {
      result = result.filter(car => filter.models?.includes(car.model));
    }

    if (filter.years && filter.years.length > 0) {
      result = result.filter(car => filter.years?.includes(car.year));
    }

    if (filter.bodyTypes && filter.bodyTypes.length > 0) {
      result = result.filter(car => filter.bodyTypes?.includes(car.bodyType));
    }

    if (filter.priceRange) {
      result = result.filter(
        car => 
          car.price.base >= (filter.priceRange?.min || 0) && 
          car.price.base <= (filter.priceRange?.max || Infinity)
      );
    }

    if (filter.engineTypes && filter.engineTypes.length > 0) {
      result = result.filter(car => filter.engineTypes?.includes(car.engine.type));
    }

    if (filter.drivetrains && filter.drivetrains.length > 0) {
      result = result.filter(car => filter.drivetrains?.includes(car.drivetrain));
    }

    if (filter.isNew !== undefined) {
      result = result.filter(car => car.isNew === filter.isNew);
    }
    
    if (filter.countries && filter.countries.length > 0) {
      result = result.filter(car => car.country && filter.countries?.includes(car.country));
    }

    setFilteredCars(result);
  }, [cars, filter]);

  const addToFavorites = (carId: string) => {
    if (!favorites.includes(carId)) {
      setFavorites([...favorites, carId]);
      toast({
        title: "Добавлено в избранное",
        description: "Автомобиль добавлен в список избранного"
      });
    }
  };

  const removeFromFavorites = (carId: string) => {
    setFavorites(favorites.filter(id => id !== carId));
    toast({
      title: "Удалено из избранного",
      description: "Автомобиль удален из списка избранного"
    });
  };

  const addToCompare = (carId: string) => {
    if (!compareCars.includes(carId) && compareCars.length < 3) {
      setCompareCars([...compareCars, carId]);
      toast({
        title: "Добавлено к сравнению",
        description: "Автомобиль добавлен к сравнению"
      });
    } else if (compareCars.length >= 3) {
      toast({
        variant: "destructive",
        title: "Ограничение сравнения",
        description: "Можно сравнивать не более 3 автомобилей одновременно"
      });
    }
  };

  const removeFromCompare = (carId: string) => {
    setCompareCars(compareCars.filter(id => id !== carId));
    toast({
      title: "Удалено из сравнения",
      description: "Автомобиль удален из списка сравнения"
    });
  };

  const clearCompare = () => {
    setCompareCars([]);
    toast({
      title: "Список сравнения очищен",
      description: "Все автомобили удалены из списка сравнения"
    });
  };

  const getCarById = (id: string) => {
    return cars.find(car => car.id === id);
  };

  const viewCar = (carId: string) => {
    setCars(prevCars => 
      prevCars.map(car => 
        car.id === carId 
          ? { ...car, viewCount: (car.viewCount || 0) + 1 } 
          : car
      )
    );
  };

  const deleteCar = (carId: string) => {
    setCars(prevCars => prevCars.filter(car => car.id !== carId));
    toast({
      title: "Автомобиль удален",
      description: "Автомобиль был успешно удален из каталога"
    });
  };

  const updateCar = (updatedCar: Car) => {
    setCars(prevCars => 
      prevCars.map(car => 
        car.id === updatedCar.id ? updatedCar : car
      )
    );
    toast({
      title: "Автомобиль обновлен",
      description: "Информация об автомобиле была успешно обновлена"
    });
  };

  const addCar = (newCar: Car) => {
    const carToAdd = {
      ...newCar,
      id: newCar.id || `car-${uuidv4()}`
    };

    setCars(prevCars => [...prevCars, carToAdd]);
    toast({
      title: "Автомобиль добавлен",
      description: "Новый автомобиль был успешно добавлен в каталог"
    });
  };

  const processOrder = async (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status, syncStatus: 'pending' as const } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    const orderToUpdate = updatedOrders.find(order => order.id === orderId);
    if (orderToUpdate) {
      try {
        const jsonFilePath = await saveOrderToJson(orderToUpdate);
        
        const finalOrders = updatedOrders.map(order => 
          order.id === orderId ? { ...order, syncStatus: 'synced' as const, jsonFilePath } : order
        );
        
        setOrders(finalOrders);
        localStorage.setItem("orders", JSON.stringify(finalOrders));
        
        toast({
          title: "Заказ обновлен",
          description: `Статус заказа изменен на: ${status}`
        });
      } catch (error) {
        console.error(`Failed to update order ${orderId} in JSON:`, error);
        
        const failedOrders = updatedOrders.map(order => 
          order.id === orderId ? { ...order, syncStatus: 'failed' as const } : order
        );
        
        setOrders(failedOrders);
        localStorage.setItem("orders", JSON.stringify(failedOrders));
        
        toast({
          variant: "destructive",
          title: "Ошибка обновления",
          description: "Заказ обновлен локально, но не сохранен в JSON-файле"
        });
      }
    }
  };

  const getOrders = () => {
    return orders;
  };

  const reloadCars = async () => {
    await loadCars();
  };

  const exportCarsData = (): Car[] => {
    return cars;
  };

  const importCarsData = (data: Car[] | Car): { success: number, failed: number } => {
    try {
      const carsToImport = Array.isArray(data) ? data : [data];
      
      if (carsToImport.length > 0) {
        const processedCars = carsToImport.map((car: Partial<Car>) => {
          if (!car.id || car.id.trim() === '') {
            car.id = `imported-${uuidv4()}`;
          }
          
          return ensureCompleteCar(car as Car);
        });
        
        setCars(processedCars);
        setFilteredCars(processedCars);
        localStorage.setItem("carsCatalog", JSON.stringify(processedCars));
        
        toast({
          title: "Импорт завершен",
          description: `Импортировано ${processedCars.length} автомобилей`
        });
        return { success: processedCars.length, failed: 0 };
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description: "Данные не содержат автомобилей или имеют неверный формат"
        });
        return { success: 0, failed: 0 };
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Не удалось разобрать данные"
      });
      const count = Array.isArray(data) ? data.length : 1;
      return { success: 0, failed: count };
    }
  };

  const ensureCompleteCar = (car: Partial<Car>): Car => {
    return car as Car;
  };

  useEffect(() => {
    if (cars.length > 0) {
      localStorage.setItem("carsCatalog", JSON.stringify(cars));
    }
  }, [cars]);

  return (
    <CarsContext.Provider
      value={{
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
      }}
    >
      {children}
    </CarsContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarsContext);
  if (context === undefined) {
    throw new Error("useCars must be used within a CarsProvider");
  }
  return context;
};
