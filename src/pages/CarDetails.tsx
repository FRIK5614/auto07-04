import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComparePanel from "@/components/ComparePanel";
import PurchaseRequestForm from "@/components/PurchaseRequestForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarsProvider } from "@/contexts/CarsContext";
import { useCars } from "@/hooks/useCars";
import { Heart, BarChart2, ChevronRight, ChevronLeft, Share2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};

const CarDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const { getCarById, toggleFavorite, toggleCompare, isFavorite, isInCompare } = useCars();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();
  
  const car = getCarById(id || "");
  
  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Автомобиль не найден</h2>
            <p className="mb-6 text-auto-gray-600">
              К сожалению, информация об этом автомобиле отсутствует в нашей базе данных.
            </p>
            <Button asChild>
              <Link to="/">Вернуться в каталог</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleCallClick = () => {
    navigator.clipboard.writeText("+7 (495) 123-45-67")
      .then(() => {
        toast({
          title: "Номер телефона скопирован",
          description: "+7 (495) 123-45-67",
        });
      })
      .catch(() => {
        window.location.href = "tel:+74951234567";
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-auto-gray-50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-auto-gray-600">
            <Link to="/" className="hover:text-auto-blue-600">Главная</Link>
            <ChevronRight className="h-3 w-3 mx-2" />
            <Link to="/" className="hover:text-auto-blue-600">Каталог</Link>
            <ChevronRight className="h-3 w-3 mx-2" />
            <Link to={`/?brand=${car.brand}`} className="hover:text-auto-blue-600">{car.brand}</Link>
            <ChevronRight className="h-3 w-3 mx-2" />
            <span className="text-auto-gray-900">{car.model}</span>
          </div>
        </div>
      </div>

      {/* Car Title */}
      <div className="bg-white border-b border-auto-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-auto-gray-900">
                {car.brand} {car.model}
              </h1>
              <p className="text-auto-gray-600 mt-1">
                {car.year} • {car.engine.type} {car.engine.displacement}л • {car.engine.power} л.с. • {car.transmission.type}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.share({
                    title: `${car.brand} ${car.model}`,
                    text: `Посмотрите ${car.brand} ${car.model} в нашем каталоге`,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Ссылка скопирована в буфер обмена");
                  });
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Поделиться
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex items-center",
                  isFavorite(car.id) && "text-red-500 hover:text-red-700 border-red-500 hover:bg-red-50"
                )}
                onClick={() => toggleFavorite(car.id)}
              >
                <Heart 
                  className="h-4 w-4 mr-1" 
                  fill={isFavorite(car.id) ? "currentColor" : "none"} 
                />
                {isFavorite(car.id) ? "В избранном" : "В избранное"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex items-center",
                  isInCompare(car.id) && "text-auto-blue-600 hover:text-auto-blue-700 border-auto-blue-600 hover:bg-auto-blue-50"
                )}
                onClick={() => toggleCompare(car.id)}
              >
                <BarChart2 className="h-4 w-4 mr-1" />
                {isInCompare(car.id) ? "В сравнении" : "Сравнить"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Car Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
                {car.isNew && (
                  <Badge className="absolute top-4 left-4 z-10 bg-auto-blue-600">Новинка</Badge>
                )}
                
                <img
                  src={car.images[activeImageIndex].url}
                  alt={car.images[activeImageIndex].alt}
                  className="w-full h-full object-cover"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-auto-gray-700 rounded-full"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-auto-gray-700 rounded-full"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {car.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`w-20 h-20 rounded ${
                      activeImageIndex === index
                        ? "ring-2 ring-auto-blue-600"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="specs">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="specs">Характеристики</TabsTrigger>
                  <TabsTrigger value="features">Комплектация</TabsTrigger>
                  <TabsTrigger value="description">Описание</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specs" className="bg-white p-6 rounded-lg shadow-sm mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-auto-gray-200">
                        Основные характеристики
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Марка</dt>
                          <dd className="font-medium text-auto-gray-900">{car.brand}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Модель</dt>
                          <dd className="font-medium text-auto-gray-900">{car.model}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Год выпуска</dt>
                          <dd className="font-medium text-auto-gray-900">{car.year}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Тип кузова</dt>
                          <dd className="font-medium text-auto-gray-900">{car.bodyType}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-auto-gray-200">
                        Двигатель и трансмиссия
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Тип двигателя</dt>
                          <dd className="font-medium text-auto-gray-900">{car.engine.type}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Объем двигателя</dt>
                          <dd className="font-medium text-auto-gray-900">{car.engine.displacement} л</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Мощность</dt>
                          <dd className="font-medium text-auto-gray-900">{car.engine.power} л.с.</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Крутящий момент</dt>
                          <dd className="font-medium text-auto-gray-900">{car.engine.torque} Нм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Тип топлива</dt>
                          <dd className="font-medium text-auto-gray-900">{car.engine.fuelType}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Коробка передач</dt>
                          <dd className="font-medium text-auto-gray-900">{car.transmission.type}</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Количество передач</dt>
                          <dd className="font-medium text-auto-gray-900">
                            {car.transmission.gears || "Вариатор"}
                          </dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Привод</dt>
                          <dd className="font-medium text-auto-gray-900">{car.drivetrain}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-auto-gray-200">
                        Размеры и масса
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Длина</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.length} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Ширина</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.width} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Высота</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.height} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Колесная база</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.wheelbase} мм</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Масса</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.weight} кг</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Объем багажника</dt>
                          <dd className="font-medium text-auto-gray-900">{car.dimensions.trunkVolume} л</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-auto-gray-200">
                        Динамические характеристики
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Разгон до 100 км/ч</dt>
                          <dd className="font-medium text-auto-gray-900">{car.performance.acceleration} с</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Максимальная скорость</dt>
                          <dd className="font-medium text-auto-gray-900">{car.performance.topSpeed} км/ч</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Расход в городе</dt>
                          <dd className="font-medium text-auto-gray-900">{car.performance.fuelConsumption.city} л/100км</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Расход на трассе</dt>
                          <dd className="font-medium text-auto-gray-900">{car.performance.fuelConsumption.highway} л/100км</dd>
                        </div>
                        <div className="flex justify-between py-1 border-b border-auto-gray-100">
                          <dt className="text-auto-gray-600">Смешанный цикл</dt>
                          <dd className="font-medium text-auto-gray-900">{car.performance.fuelConsumption.combined} л/100км</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="bg-white p-6 rounded-lg shadow-sm mt-4">
                  {car.features.length > 0 ? (
                    <div className="space-y-6">
                      {/* Group features by category */}
                      {Object.entries(
                        car.features.reduce((acc: {[key: string]: typeof car.features}, feature) => {
                          if (!acc[feature.category]) {
                            acc[feature.category] = [];
                          }
                          acc[feature.category].push(feature);
                          return acc;
                        }, {})
                      ).map(([category, features]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-auto-gray-200">
                            {category}
                          </h3>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {features.map(feature => (
                              <li key={feature.id} className="flex items-start">
                                <span className={`inline-block w-4 h-4 rounded-full mt-1 mr-2 ${
                                  feature.isStandard 
                                    ? "bg-green-500" 
                                    : "bg-auto-gray-300"
                                }`}></span>
                                <span>
                                  {feature.name}
                                  {!feature.isStandard && (
                                    <span className="text-auto-gray-500 text-sm"> (опция)</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-auto-gray-600">Информация о комплектации отсутствует.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="description" className="bg-white p-6 rounded-lg shadow-sm mt-4">
                  <div className="prose max-w-none">
                    <p className="text-auto-gray-700 whitespace-pre-line">{car.description}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  {car.price.discount ? (
                    <>
                      <p className="text-3xl font-bold text-auto-blue-700">
                        {formatPrice(car.price.base - car.price.discount)}
                      </p>
                      <p className="text-auto-gray-500 line-through">
                        {formatPrice(car.price.base)}
                      </p>
                      <p className="text-red-600 text-sm font-medium">
                        Выгода: {formatPrice(car.price.discount)}
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-auto-blue-700">
                      {formatPrice(car.price.base)}
                    </p>
                  )}
                </div>
                
                <div className="pt-4 border-t border-auto-gray-200">
                  <Button 
                    className="w-full mb-3 bg-auto-blue-600 hover:bg-auto-blue-700 text-base"
                    onClick={handleCallClick}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Позвонить
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1",
                        isFavorite(car.id) && "text-red-500 hover:text-red-700 border-red-500 hover:bg-red-50"
                      )}
                      onClick={() => toggleFavorite(car.id)}
                    >
                      <Heart 
                        className="mr-2 h-5 w-5" 
                        fill={isFavorite(car.id) ? "currentColor" : "none"} 
                      />
                      В избранное
                    </Button>
                    
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1",
                        isInCompare(car.id) && "text-auto-blue-600 hover:text-auto-blue-700 border-auto-blue-600 hover:bg-auto-blue-50"
                      )}
                      onClick={() => toggleCompare(car.id)}
                    >
                      <BarChart2 className="mr-2 h-5 w-5" />
                      Сравнить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Request Form */}
            <PurchaseRequestForm car={car} />
            
            {/* Colors */}
            {car.colors.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Доступные цвета</h3>
                <div className="flex flex-wrap gap-2">
                  {car.colors.map(color => (
                    <div 
                      key={color} 
                      className="flex flex-col items-center"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-auto-gray-200 mb-1"
                        style={{ 
                          backgroundColor: 
                            color.toLowerCase() === "white" ? "#ffffff" :
                            color.toLowerCase() === "black" ? "#000000" :
                            color.toLowerCase() === "silver" ? "#C0C0C0" :
                            color.toLowerCase() === "red" ? "#FF0000" :
                            color.toLowerCase() === "blue" ? "#0000FF" :
                            color.toLowerCase() === "gray" ? "#808080" : 
                            color
                        }}
                      ></div>
                      <span className="text-xs text-auto-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComparePanel />
      <Footer />
    </div>
  );
};

const CarDetails = () => {
  return (
    <CarsProvider>
      <CarDetailsContent />
    </CarsProvider>
  );
};

export default CarDetails;
