
import React, { useEffect, useState } from 'react';
import { Car } from '../types/car';
import CarCard from './CarCard';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface FeaturedCarsProps {
  title?: string;
  subtitle?: string;
  filter?: 'new' | 'popular' | 'all';
  limit?: number;
  cars?: Car[];
  isLoading?: boolean;
}

const FeaturedCars: React.FC<FeaturedCarsProps> = ({ 
  title = "Популярные автомобили", 
  subtitle = "Самые востребованные модели в нашем автосалоне", 
  filter = 'all',
  limit = 6,
  cars = [],
  isLoading = false
}) => {
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Логируем входящие данные для отладки
    console.log(`FeaturedCars (${title}) - Входящие данные:`, {
      filter,
      limit,
      carsLength: cars.length,
      isNew: cars.filter(c => c?.isNew).length,
      isPopular: cars.filter(c => c?.isPopular).length,
      status: cars.filter(c => c?.status === 'published').length
    });
  
    if (cars && cars.length > 0) {
      let result = [...cars]; // Создаем копию массива
      
      // Применяем фильтр, если он указан
      if (filter === 'new') {
        result = result.filter(car => car.isNew === true);
        console.log(`После фильтра "new":`, result.length);
      } else if (filter === 'popular') {
        result = result.filter(car => car.isPopular === true);
        console.log(`После фильтра "popular":`, result.length);
      }
      
      // Выводим только опубликованные автомобили
      result = result.filter(car => car.status === 'published' || car.status === undefined);
      console.log(`После фильтра status:`, result.length);
      
      // Ограничиваем количество
      result = result.slice(0, limit);
      
      console.log(`FeaturedCars (${title}) - Отфильтровано:`, {
        resultLength: result.length,
        filterType: filter
      });
      
      setFilteredCars(result);
    } else {
      console.log(`FeaturedCars (${title}) - Нет автомобилей для отображения`);
      setFilteredCars([]);
    }
  }, [cars, filter, limit, title]);
  
  // Проверяем количество автомобилей после фильтрации
  const showMoreButton = cars.filter(car => {
    if (filter === 'new') return car.isNew === true && (car.status === 'published' || car.status === undefined);
    if (filter === 'popular') return car.isPopular === true && (car.status === 'published' || car.status === undefined);
    return car.status === 'published' || car.status === undefined;
  }).length > limit;
  
  // Если загружаются данные, показываем скелетон
  if (isLoading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(limit).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Если нет автомобилей для отображения, показываем заглушку вместо null
  if (filteredCars.length === 0) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">Автомобили не найдены</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        
        {showMoreButton && (
          <div className="flex justify-center mt-8">
            <Button asChild>
              <Link 
                to={`/catalog${createFilterQueryString(filter)}`}
                className="flex items-center"
              >
                Больше автомобилей
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Функция для создания строки запроса на основе фильтра
function createFilterQueryString(filter: 'new' | 'popular' | 'all'): string {
  if (filter === 'new') {
    return '?isNew=true';
  } else if (filter === 'popular') {
    return '?isPopular=true';
  }
  return '';
}

export default FeaturedCars;
