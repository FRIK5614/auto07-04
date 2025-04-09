
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import SearchFilters from "@/components/SearchFilters";
import ComparePanel from "@/components/ComparePanel";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/useCars";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import SearchFiltersModal from "@/components/SearchFiltersModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const CatalogPage = () => {
  const { filteredCars, filter, setFilter, isLoading, error, loadCars } = useCars();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const itemsPerPage = 20;

  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  
  // Получаем текущие элементы для отображения
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem);

  // Функции для навигации по страницам
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
    // Здесь можно добавить логику сортировки
  };

  const handleRetry = () => {
    loadCars();
  };

  // Генерируем кнопки пагинации
  const renderPaginationItems = () => {
    const items = [];
    
    // Максимальное количество кнопок страниц (не включая prev/next)
    const maxButtonsToShow = 5;
    
    // Расчет диапазона отображаемых страниц
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
    if (endPage - startPage + 1 < maxButtonsToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }
    
    // Добавляем первую страницу и троеточие если нужно
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink isActive={currentPage === 1} onClick={() => goToPage(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationLink className="cursor-default">...</PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Основные страницы
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} onClick={() => goToPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Добавляем последнюю страницу и троеточие если нужно
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationLink className="cursor-default">...</PaginationLink>
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key="last">
          <PaginationLink isActive={currentPage === totalPages} onClick={() => goToPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-auto-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-auto-gray-900">Каталог автомобилей</h1>
            <Button 
              onClick={openFilterModal} 
              variant="outline" 
              className="flex items-center gap-2 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> 
              Фильтры
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Фильтры для десктопной версии */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                <SearchFilters />
              </div>
            </div>
            
            {/* Модальное окно с фильтрами для мобильной версии */}
            <SearchFiltersModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />
            
            {/* Список автомобилей */}
            <div className="md:w-3/4 lg:w-4/5">
              {error ? (
                <ErrorState message={error} onRetry={handleRetry} />
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <p className="text-auto-gray-600">
                          Найдено автомобилей: <span className="font-semibold">{filteredCars.length}</span>
                        </p>
                        <p className="text-auto-gray-500 text-sm">
                          Страница {currentPage} из {totalPages || 1}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-auto-gray-600 mr-2">Сортировать:</span>
                        <select
                          className="bg-white border border-gray-200 rounded px-3 py-1 text-sm"
                          value={sortOption}
                          onChange={(e) => handleSort(e.target.value)}
                        >
                          <option value="default">По умолчанию</option>
                          <option value="priceAsc">Цена: по возрастанию</option>
                          <option value="priceDesc">Цена: по убыванию</option>
                          <option value="yearDesc">Год: новее</option>
                          <option value="yearAsc">Год: старше</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <LoadingState count={8} type="card" />
                  ) : filteredCars.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                      <Car className="h-16 w-16 text-auto-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-auto-gray-700 mb-2">Автомобили не найдены</h3>
                      <p className="text-auto-gray-500 mb-6">
                        По выбранным фильтрам не найдено ни одного автомобиля. Попробуйте изменить параметры поиска.
                      </p>
                      <Button onClick={() => setFilter({})}>Сбросить фильтры</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {currentItems.map(car => (
                          <CarCard key={car.id} car={car} />
                        ))}
                      </div>
                      
                      {totalPages > 1 && (
                        <Pagination className="my-8">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={goToPrevPage} 
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                            
                            {renderPaginationItems()}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={goToNextPage}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ComparePanel />
      <Footer />
    </div>
  );
};

export default CatalogPage;
