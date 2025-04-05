
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Car, CarFilter } from "../types/car";
import { carsData } from "../data/carsData";

interface CarsContextType {
  cars: Car[];
  filteredCars: Car[];
  favorites: string[];
  compareCars: string[];
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
}

const CarsContext = createContext<CarsContextType | undefined>(undefined);

export const CarsProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareCars, setCompareCars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CarFilter>({});

  // Load data
  useEffect(() => {
    try {
      setCars(carsData);
      setFilteredCars(carsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load car data");
      setLoading(false);
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Load compareCars from localStorage
  useEffect(() => {
    const savedCompareCars = localStorage.getItem("compareCars");
    if (savedCompareCars) {
      setCompareCars(JSON.parse(savedCompareCars));
    }
  }, []);

  // Save compareCars to localStorage
  useEffect(() => {
    localStorage.setItem("compareCars", JSON.stringify(compareCars));
  }, [compareCars]);

  // Apply filters
  useEffect(() => {
    let result = [...cars];

    // Brand filter
    if (filter.brands && filter.brands.length > 0) {
      result = result.filter(car => filter.brands?.includes(car.brand));
    }

    // Model filter
    if (filter.models && filter.models.length > 0) {
      result = result.filter(car => filter.models?.includes(car.model));
    }

    // Year filter
    if (filter.years && filter.years.length > 0) {
      result = result.filter(car => filter.years?.includes(car.year));
    }

    // Body type filter
    if (filter.bodyTypes && filter.bodyTypes.length > 0) {
      result = result.filter(car => filter.bodyTypes?.includes(car.bodyType));
    }

    // Price range filter
    if (filter.priceRange) {
      result = result.filter(
        car => 
          car.price.base >= (filter.priceRange?.min || 0) && 
          car.price.base <= (filter.priceRange?.max || Infinity)
      );
    }

    // Engine type filter
    if (filter.engineTypes && filter.engineTypes.length > 0) {
      result = result.filter(car => filter.engineTypes?.includes(car.engine.type));
    }

    // Drivetrain filter
    if (filter.drivetrains && filter.drivetrains.length > 0) {
      result = result.filter(car => filter.drivetrains?.includes(car.drivetrain));
    }

    // New cars filter
    if (filter.isNew !== undefined) {
      result = result.filter(car => car.isNew === filter.isNew);
    }

    setFilteredCars(result);
  }, [cars, filter]);

  const addToFavorites = (carId: string) => {
    if (!favorites.includes(carId)) {
      setFavorites([...favorites, carId]);
    }
  };

  const removeFromFavorites = (carId: string) => {
    setFavorites(favorites.filter(id => id !== carId));
  };

  const addToCompare = (carId: string) => {
    if (!compareCars.includes(carId) && compareCars.length < 3) {
      setCompareCars([...compareCars, carId]);
    }
  };

  const removeFromCompare = (carId: string) => {
    setCompareCars(compareCars.filter(id => id !== carId));
  };

  const clearCompare = () => {
    setCompareCars([]);
  };

  const getCarById = (id: string) => {
    return cars.find(car => car.id === id);
  };

  return (
    <CarsContext.Provider
      value={{
        cars,
        filteredCars,
        favorites,
        compareCars,
        loading,
        error,
        filter,
        setFilter,
        addToFavorites,
        removeFromFavorites,
        addToCompare,
        removeFromCompare,
        clearCompare,
        getCarById
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
