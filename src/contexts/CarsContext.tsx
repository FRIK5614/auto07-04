import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car, CarFilter, Order } from "../types/car";
import { fetchAllCars } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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
  exportCarsData: () => string;
  importCarsData: (data: string) => boolean;
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

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (err) {
        console.error("Failed to parse saved orders:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders]);

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
          
          const savedOrders = localStorage.getItem("orders");
          if (savedOrders) {
            try {
              setOrders(JSON.parse(savedOrders));
            } catch (err) {
              console.error("Failed to parse saved orders:", err);
              createSampleOrders(parsedCars);
            }
          } else {
            createSampleOrders(parsedCars);
          }
          
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
      
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (err) {
          console.error("Failed to parse saved orders:", err);
          createSampleOrders(data);
        }
      } else {
        createSampleOrders(data);
      }
      
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

  const createSampleOrders = (data: Car[]) => {
    const sampleOrders: Order[] = [
      {
        id: "order1",
        carId: data[0]?.id || "car1",
        customerName: "Иван Иванов",
        customerPhone: "+7 (999) 123-45-67",
        customerEmail: "ivan@example.com",
        status: "new",
        createdAt: new Date().toISOString(),
      },
      {
        id: "order2",
        carId: data[1]?.id || "car2",
        customerName: "Петр Петров",
        customerPhone: "+7 (999) 765-43-21",
        customerEmail: "petr@example.com",
        status: "processing",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "order3",
        carId: data[2]?.id || "car3",
        customerName: "Мария Сидорова",
        customerPhone: "+7 (999) 555-55-55",
        customerEmail: "maria@example.com",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setOrders(sampleOrders);
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

  const processOrder = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    toast({
      title: "Заказ обновлен",
      description: `Статус заказа изменен на: ${status}`
    });
  };

  const getOrders = () => {
    return orders;
  };

  const reloadCars = async () => {
    await loadCars();
  };

  const exportCarsData = (): string => {
    return JSON.stringify(cars, null, 2);
  };

  const importCarsData = (data: string): boolean => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const processedCars = parsedData.map((car: Partial<Car>) => {
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
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description: "Данные не содержат автомобилей или имеют неверный формат"
        });
        return false;
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Не удалось разобрать JSON данные"
      });
      return false;
    }
  };

  const ensureCompleteCar = (car: Partial<Car>): Car => {
    return {
      id: car.id || `car-${uuidv4()}`,
      brand: car.brand || 'Неизвестно',
      model: car.model || 'Неизвестно',
      year: car.year || new Date().getFullYear(),
      bodyType: car.bodyType || "Седан",
      colors: car.colors || ["Белый", "Черный"],
      price: car.price || {
        base: 0,
        withOptions: 0
      },
      engine: car.engine || {
        type: "4-цилиндровый",
        displacement: 2.0,
        power: 150,
        torque: 200,
        fuelType: "Бензин"
      },
      transmission: car.transmission || {
        type: "Автоматическая",
        gears: 6
      },
      drivetrain: car.drivetrain || "Передний",
      dimensions: car.dimensions || {
        length: 4500,
        width: 1800,
        height: 1500,
        wheelbase: 2700,
        weight: 1500,
        trunkVolume: 450
      },
      performance: car.performance || {
        acceleration: 9.0,
        topSpeed: 200,
        fuelConsumption: {
          city: 8.0,
          highway: 6.0,
          combined: 7.0
        }
      },
      features: car.features || [
        {
          id: `feature-${uuidv4()}`,
          name: "Климат-контроль",
          category: "Комфорт",
          isStandard: true
        }
      ],
      images: car.images && car.images.length > 0 ? car.images : [
        {
          id: `image-${uuidv4()}`,
          url: "/placeholder.svg",
          alt: `${car.brand || 'Неизвестно'} ${car.model || 'Неизвестно'}`
        }
      ],
      description: car.description || `${car.brand || 'Неизвестно'} ${car.model || 'Неизвестно'} ${car.year || new Date().getFullYear()} года`,
      isNew: car.isNew !== undefined ? car.isNew : false,
      country: car.country || "Неизвестно",
      viewCount: car.viewCount || 0
    };
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
        importCarsData
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
