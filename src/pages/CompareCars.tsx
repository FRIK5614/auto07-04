import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarsProvider } from "@/contexts/CarsContext";
import { useCars } from "@/hooks/useCars";
import { X, Check, Minus, AlertCircle, ArrowUpDown, Car } from "lucide-react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};

const ComparisonTable = ({ category, items }: { category: string; items: { label: string; values: (string | number | boolean | null)[] }[] }) => {
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  const toggleHighlight = () => {
    setHighlightDifferences(!highlightDifferences);
  };

  const allSame = (values: (string | number | boolean | null)[]) => {
    return values.every(val => val === values[0]);
  };

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-auto-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">{category}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleHighlight}
          className={`text-sm ${highlightDifferences ? "bg-auto-blue-50 border-auto-blue-200" : ""}`}
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          {highlightDifferences ? "Скрыть различия" : "Показать различия"}
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {items.map((item, idx) => {
              const hasDifferences = !allSame(item.values);
              const highlightRow = highlightDifferences && hasDifferences;
              
              return (
                <tr 
                  key={idx} 
                  className={`
                    border-b border-auto-gray-100 last:border-0
                    ${highlightRow ? "bg-auto-blue-50" : ""}
                  `}
                >
                  <td className="py-3 px-4 font-medium">{item.label}</td>
                  {item.values.map((value, i) => (
                    <td 
                      key={i} 
                      className={`py-3 px-4 text-center ${
                        highlightRow ? "font-medium text-auto-blue-700" : ""
                      }`}
                    >
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <Minus className="h-5 w-5 text-auto-gray-400 mx-auto" />
                        )
                      ) : value !== null ? (
                        value
                      ) : (
                        <span className="text-auto-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompareEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-auto-gray-100 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="h-8 w-8 text-auto-gray-400" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Список сравнения пуст</h3>
    <p className="text-auto-gray-600 max-w-md mb-6">
      Добавьте автомобили в список сравнения, чтобы увидеть их различия и сходства.
    </p>
    <Button asChild>
      <Link to="/">Перейти в каталог</Link>
    </Button>
  </div>
);

const CompareAddMore = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-auto-gray-300 rounded-lg bg-auto-gray-50">
    <Car className="h-12 w-12 text-auto-gray-400 mb-4" />
    <p className="text-auto-gray-600 text-center mb-4">
      Добавьте еще автомобили для сравнения
    </p>
    <Button asChild variant="outline">
      <Link to="/">Добавить автомобиль</Link>
    </Button>
  </div>
);

const ComparisonCarCard = ({ index, car, onRemove }: { index: number; car: any; onRemove: () => void }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-auto-gray-100"
    >
      <X className="h-4 w-4 text-auto-gray-600" />
    </button>
    
    <div className="h-40 overflow-hidden">
      <img
        src={car.images[0].url}
        alt={car.images[0].alt}
        className="w-full h-full object-cover"
      />
    </div>
    
    <div className="p-4">
      <h3 className="font-semibold mb-1 text-lg">
        <Link to={`/car/${car.id}`} className="hover:text-auto-blue-600 transition-colors">
          {car.brand} {car.model}
        </Link>
      </h3>
      <p className="text-auto-gray-600 text-sm mb-2">
        {car.year} • {car.engine.displacement}л • {car.bodyType}
      </p>
      
      <div className="font-bold text-auto-blue-700 text-lg">
        {formatPrice(car.price.base)}
      </div>
    </div>
  </div>
);

const ComparisonCarsHeader = ({ cars, onRemoveCar }: { cars: any[]; onRemoveCar: (index: number) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="hidden md:flex items-end pb-4">
      <h2 className="text-xl font-bold">Сравнение</h2>
    </div>
    
    {cars.map((car, index) => (
      <ComparisonCarCard
        key={car.id}
        index={index}
        car={car}
        onRemove={() => onRemoveCar(index)}
      />
    ))}
    
    {cars.length < 3 && (
      <CompareAddMore />
    )}
  </div>
);

const CompareContent = () => {
  const { comparisonCars, removeFromCompare, clearCompare } = useCars();
  
  if (comparisonCars.length === 0) {
    return <CompareEmptyState />;
  }

  const handleRemoveCar = (index: number) => {
    removeFromCompare(comparisonCars[index].id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section with car cards */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Сравнение автомобилей</h1>
        <Button 
          variant="outline" 
          onClick={clearCompare}
          className="text-auto-gray-700"
        >
          Очистить все
        </Button>
      </div>
      
      <ComparisonCarsHeader 
        cars={comparisonCars} 
        onRemoveCar={handleRemoveCar} 
      />
      
      {/* Comparison tabs */}
      <div className="mt-8">
        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="engine">Двигатель</TabsTrigger>
            <TabsTrigger value="dimensions">Размеры</TabsTrigger>
            <TabsTrigger value="features">Комплектация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <ComparisonTable 
              category="Основная информация" 
              items={[
                { 
                  label: "Марка", 
                  values: comparisonCars.map(car => car.brand) 
                },
                { 
                  label: "Модель", 
                  values: comparisonCars.map(car => car.model) 
                },
                { 
                  label: "Год выпуска", 
                  values: comparisonCars.map(car => car.year) 
                },
                { 
                  label: "Тип кузова", 
                  values: comparisonCars.map(car => car.bodyType) 
                },
                { 
                  label: "Цена", 
                  values: comparisonCars.map(car => formatPrice(car.price.base)) 
                },
                { 
                  label: "Новый автомобиль", 
                  values: comparisonCars.map(car => car.isNew) 
                }
              ]} 
            />
            
            <ComparisonTable 
              category="Динамические характеристики" 
              items={[
                { 
                  label: "Разгон до 100 км/ч", 
                  values: comparisonCars.map(car => car.performance.acceleration + " с") 
                },
                { 
                  label: "Максимальная скорость", 
                  values: comparisonCars.map(car => car.performance.topSpeed + " км/ч") 
                },
                { 
                  label: "Расход в городе", 
                  values: comparisonCars.map(car => car.performance.fuelConsumption.city + " л/100км") 
                },
                { 
                  label: "Расход на трассе", 
                  values: comparisonCars.map(car => car.performance.fuelConsumption.highway + " л/100км") 
                },
                { 
                  label: "Смешанный цикл", 
                  values: comparisonCars.map(car => car.performance.fuelConsumption.combined + " л/100км") 
                }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="engine" className="mt-4">
            <ComparisonTable 
              category="Двигатель и трансмиссия" 
              items={[
                { 
                  label: "Тип двигателя", 
                  values: comparisonCars.map(car => car.engine.type) 
                },
                { 
                  label: "Объем двигателя", 
                  values: comparisonCars.map(car => car.engine.displacement + " л") 
                },
                { 
                  label: "Мощность", 
                  values: comparisonCars.map(car => car.engine.power + " л.с.") 
                },
                { 
                  label: "Крутящий момент", 
                  values: comparisonCars.map(car => car.engine.torque + " Нм") 
                },
                { 
                  label: "Тип топлива", 
                  values: comparisonCars.map(car => car.engine.fuelType) 
                },
                { 
                  label: "Коробка передач", 
                  values: comparisonCars.map(car => car.transmission.type) 
                },
                { 
                  label: "Количество передач", 
                  values: comparisonCars.map(car => car.transmission.gears || "Вариатор") 
                },
                { 
                  label: "Привод", 
                  values: comparisonCars.map(car => car.drivetrain) 
                }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="dimensions" className="mt-4">
            <ComparisonTable 
              category="Размеры и масса" 
              items={[
                { 
                  label: "Длина", 
                  values: comparisonCars.map(car => car.dimensions.length + " мм") 
                },
                { 
                  label: "Ширина", 
                  values: comparisonCars.map(car => car.dimensions.width + " мм") 
                },
                { 
                  label: "Высота", 
                  values: comparisonCars.map(car => car.dimensions.height + " мм") 
                },
                { 
                  label: "Колесная база", 
                  values: comparisonCars.map(car => car.dimensions.wheelbase + " мм") 
                },
                { 
                  label: "Масса", 
                  values: comparisonCars.map(car => car.dimensions.weight + " кг") 
                },
                { 
                  label: "Объем багажника", 
                  values: comparisonCars.map(car => car.dimensions.trunkVolume + " л") 
                }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="features" className="mt-4">
            {/* Get all unique feature categories across all cars */}
            {(() => {
              const allCategories = Array.from(
                new Set(
                  comparisonCars.flatMap(car => 
                    car.features.map(feature => feature.category)
                  )
                )
              );
              
              // For each category, get all unique features
              return allCategories.map(category => {
                const allFeatureNames = Array.from(
                  new Set(
                    comparisonCars.flatMap(car => 
                      car.features
                        .filter(feature => feature.category === category)
                        .map(feature => feature.name)
                    )
                  )
                );
                
                const items = allFeatureNames.map(featureName => {
                  return {
                    label: featureName,
                    values: comparisonCars.map(car => {
                      const feature = car.features.find(
                        f => f.name === featureName && f.category === category
                      );
                      return feature ? feature.isStandard : null;
                    })
                  };
                });
                
                return (
                  <ComparisonTable 
                    key={category}
                    category={category} 
                    items={items} 
                  />
                );
              });
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const CompareCars = () => {
  return (
    <CarsProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-auto-gray-50 py-8">
          <CompareContent />
        </div>
        <Footer />
      </div>
    </CarsProvider>
  );
};

export default CompareCars;
