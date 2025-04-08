
import React, { useEffect, useState } from 'react';
import { Car } from '../types/car';
import CarCard from './CarCard';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

interface FeaturedCarsProps {
  title: string;
  subtitle: string;
  filter?: 'new' | 'popular' | 'all';
  limit?: number;
  cars?: Car[]; // Added cars prop to support both direct passing of cars and filtering
}

const FeaturedCars: React.FC<FeaturedCarsProps> = ({ 
  title, 
  subtitle, 
  filter = 'all',
  limit = 6,
  cars = [] // Default to empty array
}) => {
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  
  useEffect(() => {
    // Логируем входящие данные для отладки
    console.log(`FeaturedCars (${title}) - Входящие данные:`, {
      filter,
      limit,
      carsLength: cars.length,
      isNew: cars.filter(c => c.isNew).length,
      isPopular: cars.filter(c => c.isPopular).length,
      status: cars.filter(c => c.status === 'published').length
    });
  
    // If cars are directly provided, use them
    if (cars && cars.length > 0) {
      let result = [...cars]; // Создаем копию массива
      
      // Применяем фильтр, если он указан и если мы не получили уже отфильтрованные данные напрямую
      if (filter === 'new') {
        result = result.filter(car => car.isNew === true);
      } else if (filter === 'popular') {
        result = result.filter(car => car.isPopular === true);
      }
      
      // Выводим только опубликованные автомобили
      result = result.filter(car => car.status === 'published' || car.status === undefined);
      
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
  
  // Если нет автомобилей для отображения, не рендерим компонент
  if (filteredCars.length === 0) {
    return null;
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
