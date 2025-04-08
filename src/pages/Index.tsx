
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCars from "@/components/FeaturedCars";
import SearchFilters from "@/components/SearchFilters";
import CarCard from "@/components/CarCard";
import ComparePanel from "@/components/ComparePanel";
import PurchaseRequestForm from "@/components/PurchaseRequestForm";
import SearchFiltersModal from "@/components/SearchFiltersModal";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/useCars";
import { CarsProvider } from "@/contexts/CarsContext";
import { ChevronDown, Car, CarFront, Settings, UserRound } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const IndexContent = () => {
  const { cars, filteredCars, setFilter, filter, sortCars, reloadCars } = useCars();
  const [searchParams] = useSearchParams();
  const [visibleCars, setVisibleCars] = useState(12);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const consultFormRef = useRef<HTMLDivElement>(null);
  const [sortedCars, setSortedCars] = useState(filteredCars);
  const [sortOption, setSortOption] = useState('default');
  
  // Загрузить автомобили при первом рендере
  useEffect(() => {
    reloadCars();
  }, [reloadCars]);

  // Обновить фильтр при изменении параметров URL
  useEffect(() => {
    const newFilter: any = { ...filter };
    
    const bodyType = searchParams.get("bodyType");
    if (bodyType) {
      newFilter.bodyTypes = [bodyType];
    }
    
    if (searchParams.get("filter") === "new") {
      newFilter.isNew = true;
    }
    
    const brand = searchParams.get("brand");
    if (brand) {
      newFilter.brands = [brand];
    }
    
    setFilter(newFilter);
  }, [searchParams, setFilter, filter]);

  // Сортировка автомобилей
  useEffect(() => {
    if (typeof sortCars === 'function') {
      const sorted = sortCars([...filteredCars], sortOption);
      setSortedCars(sorted);
    } else {
      setSortedCars(filteredCars);
    }
  }, [filteredCars, sortCars, sortOption]);

  const loadMore = () => {
    setVisibleCars(prev => prev + 12);
  };
  
  // Фильтруем новые и популярные автомобили
  const newCars = cars.filter(car => car.isNew && car.status === 'published');
  const popularCars = cars.filter(car => car.isPopular && car.status === 'published');

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const scrollToConsultForm = () => {
    consultFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (option: string) => {
    setSortOption(option);
  };
  
  // Текст для отображения текущей сортировки
  const getSortLabel = (option: string) => {
    switch (option) {
      case 'priceAsc': return 'По цене (возр.)';
      case 'priceDesc': return 'По цене (убыв.)';
      case 'yearDesc': return 'По году (новые)';
      case 'yearAsc': return 'По году (старые)';
      default: return 'По умолчанию';
    }
  };

  // Добавляем данные для демонстрации, если автомобилей мало
  const ensureData = (cars: any[], label: string) => {
    if (cars.length < 3) {
      console.log(`Недостаточно автомобилей для секции "${label}". Текущее количество:`, cars.length);
    }
    return cars;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="relative bg-gradient-to-r from-auto-blue-900 to-auto-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Найдите автомобиль своей мечты
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                Более 1000 моделей автомобилей с подробными характеристиками, ценами и возможностью сравнения
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Button 
                  size="lg" 
                  className="bg-white text-auto-blue-800 hover:bg-blue-50 w-full"
                  asChild
                >
                  <Link to="/catalog">
                    <Car className="mr-2 h-5 w-5" />
                    Все автомобили
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-auto-blue-500 text-white hover:bg-auto-blue-600 w-full"
                  onClick={openFilterModal}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Подбор по параметрам
                </Button>
              </div>
              <div className="mt-4">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-auto-blue-800 w-full sm:w-auto"
                  onClick={scrollToConsultForm}
                >
                  <UserRound className="mr-2 h-5 w-5" />
                  Подобрать через специалиста
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-auto-blue-500 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-auto-blue-500 rounded-full opacity-40"></div>
                <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-auto-blue-500 rounded-full opacity-30"></div>
                <div className="bg-auto-blue-800/30 backdrop-blur-sm rounded-lg p-4 relative z-10">
                  <img
                    src="/placeholder.svg"
                    alt="Автомобиль"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="w-full h-auto"
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      <SearchFiltersModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />

      <section className="py-12 bg-auto-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-auto-blue-50 rounded-full flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-auto-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Большой выбор</h3>
              <p className="text-auto-gray-600">
                Более 1000 моделей автомобилей от всех ведущих производителей с подробным описанием.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-auto-blue-50 rounded-full flex items-center justify-center mb-4">
                <CarFront className="h-8 w-8 text-auto-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Детальное сравнение</h3>
              <p className="text-auto-gray-600">
                Сравнивайте до 3 автомобилей одновременно по всем техническим характеристикам.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-auto-blue-50 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-auto-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Удобный подбор</h3>
              <p className="text-auto-gray-600">
                Используйте фильтры для выбора автомобиля по любым параметрам и характеристикам.
              </p>
            </div>
          </div>
        </div>
      </section>

      {ensureData(newCars, "Новые поступления").length > 0 && (
        <FeaturedCars 
          cars={newCars} 
          title="Новые поступления" 
          subtitle="Самые свежие модели в нашем каталоге"
        />
      )}
      
      {ensureData(popularCars, "Популярные модели").length > 0 && (
        <FeaturedCars 
          cars={popularCars} 
          title="Популярные модели" 
          subtitle="Автомобили, которые чаще всего выбирают наши пользователи"
        />
      )}

      <section className="py-12 bg-auto-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-auto-gray-900">Каталог автомобилей</h2>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 lg:w-1/5">
              <SearchFilters />
            </div>
            
            <div className="md:w-3/4 lg:w-4/5">
              {sortedCars.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg text-center">
                  <Car className="h-16 w-16 text-auto-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-auto-gray-700 mb-2">Автомобили не найдены</h3>
                  <p className="text-auto-gray-500 mb-6">
                    По выбранным фильтрам не найдено ни одного автомобиля. Попробуйте изменить параметры поиска.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-auto-gray-600">
                      Найдено автомобилей: <span className="font-semibold">{sortedCars.length}</span>
                    </p>
                    <div className="flex items-center">
                      <span className="text-sm text-auto-gray-600 mr-2">Сортировать:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center">
                            {getSortLabel(sortOption)} <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSortChange('default')}>
                            По умолчанию
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSortChange('priceAsc')}>
                            По цене (возр.)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSortChange('priceDesc')}>
                            По цене (убыв.)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSortChange('yearDesc')}>
                            По году (новые)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSortChange('yearAsc')}>
                            По году (старые)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCars.slice(0, visibleCars).map(car => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                  
                  {visibleCars < sortedCars.length && (
                    <div className="mt-8 flex justify-center">
                      <Button 
                        onClick={loadMore} 
                        variant="outline" 
                        className="px-8"
                      >
                        Показать еще
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" ref={consultFormRef}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold mb-4 text-auto-gray-900">
                Нужна консультация?
              </h2>
              <p className="text-lg text-auto-gray-600 mb-6">
                Заполните форму, и наш менеджер свяжется с вами в ближайшее время, чтобы ответить на все ваши вопросы и помочь с выбором автомобиля.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-auto-blue-100 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-auto-blue-600 font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-auto-gray-900">Профессиональная консультация</h4>
                    <p className="text-auto-gray-600">Наши эксперты помогут выбрать автомобиль под ваши потребности</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-auto-blue-100 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-auto-blue-600 font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-auto-gray-900">Индивидуальный подбор</h4>
                    <p className="text-auto-gray-600">Учтем все ваши пожелания и бюджет при выборе автомобиля</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-auto-blue-100 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-auto-blue-600 font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-auto-gray-900">Быстрый ответ</h4>
                    <p className="text-auto-gray-600">Мы свяжемся с вами в течение 30 минут в рабочее время</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="md:w-1/2">
              <PurchaseRequestForm />
            </div>
          </div>
        </div>
      </section>

      <ComparePanel />
    </div>
  );
};

const Index = () => {
  return (
    <CarsProvider>
      <IndexContent />
    </CarsProvider>
  );
};

export default Index;
