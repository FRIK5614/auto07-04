
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import FeaturedCars from '../components/FeaturedCars';
import { Car } from '../types/car';
import { Link } from 'react-router-dom';
import { useCarManagement } from '../hooks/useCarManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  const { 
    cars, 
    loading, 
    error,
    getNewCars,
    getPopularCars,
    forceReloadCars
  } = useCarManagement();
  
  const [newCars, setNewCars] = useState<Car[]>([]);
  const [popularCars, setPopularCars] = useState<Car[]>([]);
  const [isLoadingNew, setIsLoadingNew] = useState<boolean>(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Принудительно загружаем данные с сервера при первой загрузке
  useEffect(() => {
    const loadAllCarsData = async () => {
      try {
        await forceReloadCars();
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setLoadError("Не удалось загрузить данные с сервера");
      }
    };
    
    loadAllCarsData();
  }, [forceReloadCars]);

  // Загружаем новые автомобили после получения всех данных
  useEffect(() => {
    setIsLoadingNew(true);
    try {
      // Получаем новые автомобили через специальную функцию
      const newCarsList = getNewCars(6);
      console.log("Новые автомобили:", newCarsList.length);
      setNewCars(newCarsList);
    } catch (err) {
      console.error("Ошибка при загрузке новых автомобилей:", err);
    } finally {
      setIsLoadingNew(false);
    }
  }, [getNewCars, cars]);

  // Загружаем популярные автомобили после получения всех данных
  useEffect(() => {
    setIsLoadingPopular(true);
    try {
      // Получаем популярные автомобили через специальную функцию
      const popularCarsList = getPopularCars(6);
      console.log("Популярные автомобили:", popularCarsList.length);
      setPopularCars(popularCarsList);
    } catch (err) {
      console.error("Ошибка при загрузке популярных автомобилей:", err);
    } finally {
      setIsLoadingPopular(false);
    }
  }, [getPopularCars, cars]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Автосалон VoeVoe</h1>
            <p className="mt-2 text-xl text-gray-600">Качественные автомобили по доступным ценам</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/catalog" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-semibold mb-2">Каталог автомобилей</h3>
              <p className="text-gray-600">Большой выбор автомобилей различных марок и моделей</p>
            </Link>
            
            <Link to="/hot-deals" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-semibold mb-2">Горячие предложения</h3>
              <p className="text-gray-600">Лучшие предложения и скидки на автомобили</p>
            </Link>
            
            <Link to="/favorites" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-semibold mb-2">Избранное</h3>
              <p className="text-gray-600">Сохраненные автомобили для сравнения</p>
            </Link>
            
            <Link to="/compare" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-semibold mb-2">Сравнение</h3>
              <p className="text-gray-600">Сравнивайте характеристики разных моделей</p>
            </Link>
          </div>
        </div>
      </div>
      
      {isLoadingNew ? (
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Новые поступления</h2>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      ) : (
        <FeaturedCars 
          title="Новые поступления" 
          subtitle="Автомобили, недавно поступившие в наш автосалон" 
          filter="new"
          cars={cars}
        />
      )}
      
      {isLoadingPopular ? (
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Популярные модели</h2>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      ) : (
        <FeaturedCars 
          title="Популярные модели" 
          subtitle="Наиболее востребованные автомобили среди наших клиентов" 
          filter="popular"
          cars={cars}
        />
      )}
      
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">О нашем автосалоне</h2>
            <p className="text-gray-600">Мы предлагаем широкий выбор автомобилей и услуг</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Качественные автомобили</h3>
              <p className="text-gray-600">
                Мы тщательно отбираем автомобили для нашего салона, 
                проверяя их техническое состояние и историю.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Выгодные условия</h3>
              <p className="text-gray-600">
                Предлагаем конкурентные цены, гибкие условия оплаты,
                кредитование и лизинг.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Полное сопровождение</h3>
              <p className="text-gray-600">
                Наши специалисты помогут с оформлением документов,
                страхованием и постановкой на учет.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/catalog" className="px-8 flex items-center justify-center">
                Все автомобили
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
