
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { Car } from '@/types/car';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Filter, Search, Grid2X2, List } from 'lucide-react';
import CarCard from '@/components/CarCard';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

const Catalog: React.FC = () => {
  const { cars, loading, error, loadCars, getAvailableCountries } = useCars();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Состояние компонента
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortCriterion, setSortCriterion] = useState('yearDesc');
  
  // Фильтры
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000000]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Списки для фильтров
  const availableCountries = getAvailableCountries();
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  useEffect(() => {
    loadCars();
    
    // Инициализация фильтров из URL
    const countryParam = searchParams.get('country');
    const brandsParam = searchParams.get('brands');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const sortParam = searchParams.get('sort');
    const viewParam = searchParams.get('view');
    
    if (countryParam) setSelectedCountry(countryParam);
    if (brandsParam) setSelectedBrands(brandsParam.split(','));
    if (minPriceParam && maxPriceParam) setPriceRange([Number(minPriceParam), Number(maxPriceParam)]);
    if (searchParam) setSearchTerm(searchParam);
    if (pageParam) setCurrentPage(Number(pageParam));
    if (sortParam) setSortCriterion(sortParam);
    if (viewParam && (viewParam === 'grid' || viewParam === 'list')) setViewMode(viewParam);
    
  }, [loadCars]);
  
  // Обновляем доступные бренды при изменении выбранной страны или всех автомобилей
  useEffect(() => {
    const brandsSet = new Set<string>();
    
    const carsToFilter = selectedCountry 
      ? cars.filter(car => car.country === selectedCountry)
      : cars;
    
    carsToFilter.forEach(car => brandsSet.add(car.brand));
    setAvailableBrands(Array.from(brandsSet).sort());
    
  }, [cars, selectedCountry]);
  
  // Применяем фильтры при изменении параметров
  useEffect(() => {
    // Фильтрация по стране
    let result = selectedCountry
      ? cars.filter(car => car.country === selectedCountry)
      : cars;
      
    // Фильтрация по брендам
    if (selectedBrands.length > 0) {
      result = result.filter(car => selectedBrands.includes(car.brand));
    }
    
    // Фильтрация по ценовому диапазону
    result = result.filter(car => {
      const price = car.price.base - (car.price.discount || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Фильтрация по поисковому запросу
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(car => 
        car.brand.toLowerCase().includes(term) || 
        car.model.toLowerCase().includes(term) ||
        (car.description && car.description.toLowerCase().includes(term))
      );
    }
    
    // Сортировка
    result = sortCarsBycriterion(result, sortCriterion);
    
    setFilteredCars(result);
    
    // Обновляем URL с параметрами
    const newSearchParams = new URLSearchParams();
    if (selectedCountry) newSearchParams.set('country', selectedCountry);
    if (selectedBrands.length > 0) newSearchParams.set('brands', selectedBrands.join(','));
    newSearchParams.set('minPrice', priceRange[0].toString());
    newSearchParams.set('maxPrice', priceRange[1].toString());
    if (searchTerm) newSearchParams.set('search', searchTerm);
    newSearchParams.set('page', currentPage.toString());
    newSearchParams.set('sort', sortCriterion);
    newSearchParams.set('view', viewMode);
    
    setSearchParams(newSearchParams);
    
  }, [cars, selectedCountry, selectedBrands, priceRange, searchTerm, sortCriterion, currentPage, viewMode]);
  
  // Сортировка автомобилей
  const sortCarsBycriterion = (carsToSort: Car[], criterion: string): Car[] => {
    switch(criterion) {
      case 'priceAsc':
        return [...carsToSort].sort((a, b) => 
          (a.price.base - (a.price.discount || 0)) - 
          (b.price.base - (b.price.discount || 0)));
      case 'priceDesc':
        return [...carsToSort].sort((a, b) => 
          (b.price.base - (b.price.discount || 0)) - 
          (a.price.base - (a.price.discount || 0)));
      case 'yearDesc':
        return [...carsToSort].sort((a, b) => b.year - a.year);
      case 'yearAsc':
        return [...carsToSort].sort((a, b) => a.year - b.year);
      default:
        return carsToSort;
    }
  };
  
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedBrands([]);
    setCurrentPage(1);
  };
  
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
    setCurrentPage(1);
  };
  
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSortChange = (value: string) => {
    setSortCriterion(value);
  };
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };
  
  // Пагинация
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Каталог автомобилей</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Боковая панель с фильтрами */}
        <div className="w-full md:w-1/4">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Фильтры
              </h2>
              
              <div className="space-y-6">
                {/* Фильтр по стране */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Страна производитель</label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все страны" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все страны</SelectItem>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Фильтр по бренду */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Марка автомобиля</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                    {availableBrands.length === 0 ? (
                      <p className="text-sm text-gray-500">Нет доступных марок</p>
                    ) : (
                      availableBrands.map(brand => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`brand-${brand}`} 
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => handleBrandToggle(brand)}
                          />
                          <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Фильтр по цене */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Цена</label>
                    <span className="text-sm text-gray-500">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <Slider 
                    min={0}
                    max={15000000}
                    step={100000}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={handlePriceRangeChange}
                    className="my-4"
                  />
                </div>
                
                {/* Поиск по названию */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Поиск</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Поиск автомобиля..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedCountry('');
                    setSelectedBrands([]);
                    setPriceRange([0, 15000000]);
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Основная часть с автомобилями */}
        <div className="w-full md:w-3/4">
          {/* Панель управления */}
          <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-600">Найдено автомобилей: <span className="font-semibold">{filteredCars.length}</span></p>
            </div>
            
            <div className="flex gap-4 items-center">
              <Select value={sortCriterion} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Сортировать" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priceAsc">
                    <div className="flex items-center">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Цена (по возрастанию)
                    </div>
                  </SelectItem>
                  <SelectItem value="priceDesc">
                    <div className="flex items-center">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Цена (по убыванию)
                    </div>
                  </SelectItem>
                  <SelectItem value="yearDesc">
                    <div className="flex items-center">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Год (новее)
                    </div>
                  </SelectItem>
                  <SelectItem value="yearAsc">
                    <div className="flex items-center">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Год (старее)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewModeChange('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Список автомобилей */}
          {filteredCars.length === 0 ? (
            <div className="bg-white p-10 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-2">Нет автомобилей по заданным параметрам</h3>
              <p className="text-gray-600">Попробуйте изменить параметры фильтра</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentCars.map(car => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                      {car.images && car.images.length > 0 ? (
                        <img 
                          src={car.images.find(img => img.isMain)?.url || car.images[0].url} 
                          alt={car.brand + ' ' + car.model}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Нет фото</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      <h3 className="text-xl font-semibold mb-1">{car.brand} {car.model}</h3>
                      <p className="text-gray-600 mb-2">Год: {car.year}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <span className="text-gray-500 text-sm">Двигатель:</span>
                          <p>{car.engine.type}, {car.engine.displacement}л, {car.engine.power}л.с.</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Трансмиссия:</span>
                          <p>{car.transmission.type}, {car.drivetrain} привод</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        <div>
                          <span className="text-lg font-bold">
                            {car.price.discount ? (
                              <>
                                <span className="text-red-600">{formatPrice(car.price.base - car.price.discount)}</span>
                                <span className="text-gray-400 text-sm line-through ml-2">{formatPrice(car.price.base)}</span>
                              </>
                            ) : (
                              formatPrice(car.price.base)
                            )}
                          </span>
                        </div>
                        <Button asChild>
                          <a href={`/car/${car.id}`}>Подробнее</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }} 
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    // Показываем первую, последнюю и по 1 странице с каждой стороны от текущей
                    const isVisible = 
                      page === 1 || 
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);
                      
                    // Показываем многоточие только после первой и перед последней страницей
                    const showEllipsisBefore = page === currentPage - 1 && currentPage > 3;
                    const showEllipsisAfter = page === currentPage + 1 && currentPage < totalPages - 2;
                    
                    if (!isVisible) return null;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && <PaginationItem>...</PaginationItem>}
                        <PaginationItem>
                          <Button 
                            variant={page === currentPage ? "default" : "outline"}
                            size="icon"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </PaginationItem>
                        {showEllipsisAfter && <PaginationItem>...</PaginationItem>}
                      </React.Fragment>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }} 
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
