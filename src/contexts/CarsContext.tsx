import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car, CarFilter, Order } from "../types/car";
import { fetchAllCars } from "../services/api";
import { useToast } from "@/hooks/use-toast";

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

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCars();
      console.log("Loaded cars:", data);
      setCars(data);
      setFilteredCars(data);
      
      if (orders.length === 0) {
        const sampleOrders: Order[] = [
          {
            id: "order1",
            carId: data[0]?.id || "car1",
            customerName: "Иван Иванов",
            customerPhone: "+7 (999) 123-45-67",
            status: "new",
            createdAt: new Date().toISOString(),
          },
          {
            id: "order2",
            carId: data[1]?.id || "car2",
            customerName: "Петр Петров",
            customerPhone: "+7 (999) 765-43-21",
            status: "processing",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "order3",
            carId: data[2]?.id || "car3",
            customerName: "Мария Сидорова",
            customerPhone: "+7 (999) 555-55-55",
            status: "completed",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setOrders(sampleOrders);
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

  useEffect(() => {
    loadCars();
  }, []);

  const reloadCars = async () => {
    await loadCars();
  };

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
    setCars(prevCars => [...prevCars, newCar]);
    toast({
      title: "Автомобиль добавлен",
      description: "Новый автомобиль был успешно добавлен в каталог"
    });
  };

  const processOrder = (orderId: string, status: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    toast({
      title: "Заказ обновлен",
      description: `Статус заказа изменен на: ${status}`
    });
  };

  const getOrders = () => {
    return orders;
  };

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
        getOrders
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
