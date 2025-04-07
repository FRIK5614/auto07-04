
import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Plus, Delete, Edit, Save, FileDown, FileUp, X, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import CarImageUploader from '@/components/CarImageUploader';

import { Car as CarType } from '@/types/car';

const AdminCars: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { 
    cars, 
    loadCars, 
    deleteCar, 
    addCar, 
    updateCar,
    exportCarsData
  } = useCars();
  
  const { toast } = useToast();
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);

  // Load cars when component mounts
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      loadCars();
    }
  }, [isAdmin, navigate, loadCars]);

  // Handle adding a new car
  const handleAddCar = () => {
    const newCar: CarType = {
      id: `car_${Date.now()}`,
      brand: 'Новая марка',
      model: 'Новая модель',
      year: new Date().getFullYear(),
      bodyType: 'седан',
      colors: ['#FFFFFF'],
      price: { base: 0 },
      engine: { type: 'бензин', displacement: 2.0, power: 150, torque: 200, fuelType: 'АИ-95' },
      transmission: { type: 'автомат', gears: 6 },
      drivetrain: 'передний',
      dimensions: { length: 4500, width: 1800, height: 1400, wheelbase: 2700, weight: 1500, trunkVolume: 450 },
      performance: { acceleration: 9.0, topSpeed: 220, fuelConsumption: { city: 10.0, highway: 6.0, combined: 8.0 } },
      features: [],
      images: [],
      description: 'Описание нового автомобиля',
      isNew: true,
    };

    try {
      const result = addCar(newCar);
      if (result) {
        toast({
          title: "Успешно",
          description: "Автомобиль добавлен"
        });
        loadCars();
        handleEditCar(newCar);
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось добавить автомобиль"
        });
      }
    } catch (error) {
      console.error('Error adding car:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при добавлении автомобиля"
      });
    }
  };

  // Handle deleting a car
  const handleDeleteCar = (carId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteCar(carId);
      toast({
        title: "Успешно",
        description: "Автомобиль удален"
      });
    }
  };

  // Handle editing a car
  const handleEditCar = (car: CarType) => {
    setSelectedCar(car);
  };

  // Handle saving an edited car
  const handleSaveCar = async () => {
    if (selectedCar) {
      setLoading(true);
      try {
        const result = await updateCar(selectedCar);
        if (result) {
          toast({
            title: "Успешно",
            description: "Автомобиль обновлен"
          });
          setSelectedCar(null);
          loadCars();
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось обновить автомобиль"
          });
        }
      } catch (error) {
        console.error('Error updating car:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Произошла ошибка при обновлении автомобиля"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle basic field changes
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (selectedCar) {
      setSelectedCar({ ...selectedCar, [field]: e.target.value });
    }
  };

  // Handle price field changes
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (selectedCar && selectedCar.price) {
      const value = e.target.value ? Number(e.target.value) : 0;
      setSelectedCar({
        ...selectedCar,
        price: {
          ...selectedCar.price,
          [field]: value
        }
      });
    }
  };

  // Handle engine field changes
  const handleEngineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    if (selectedCar && selectedCar.engine) {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setSelectedCar({
        ...selectedCar,
        engine: {
          ...selectedCar.engine,
          [field]: value
        }
      });
    }
  };

  // Handle transmission field changes
  const handleTransmissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    if (selectedCar && selectedCar.transmission) {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setSelectedCar({
        ...selectedCar,
        transmission: {
          ...selectedCar.transmission,
          [field]: value
        }
      });
    }
  };

  // Handle dimensions field changes
  const handleDimensionsChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (selectedCar && selectedCar.dimensions) {
      setSelectedCar({
        ...selectedCar,
        dimensions: {
          ...selectedCar.dimensions,
          [field]: Number(e.target.value)
        }
      });
    }
  };

  // Handle performance field changes
  const handlePerformanceChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (selectedCar && selectedCar.performance) {
      if (field.startsWith('fuelConsumption.')) {
        const subField = field.split('.')[1];
        setSelectedCar({
          ...selectedCar,
          performance: {
            ...selectedCar.performance,
            fuelConsumption: {
              ...selectedCar.performance.fuelConsumption,
              [subField]: Number(e.target.value)
            }
          }
        });
      } else {
        setSelectedCar({
          ...selectedCar,
          performance: {
            ...selectedCar.performance,
            [field]: Number(e.target.value)
          }
        });
      }
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (selectedCar) {
      setSelectedCar({
        ...selectedCar,
        [field]: checked
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    if (selectedCar) {
      setSelectedCar({
        ...selectedCar,
        [field]: value
      });
    }
  };

  // Handle image update
  const handleImageUpdate = () => {
    if (selectedCar) {
      loadCars();
      // Refresh the selected car data to show new images
      const updatedCar = cars.find(c => c.id === selectedCar.id);
      if (updatedCar) {
        setSelectedCar(updatedCar);
      }
    }
  };

  // Handle export of cars as JSON
  const handleExportCars = () => {
    try {
      const jsonData = exportCarsData();
      const jsonString = JSON.stringify(jsonData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `cars-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Экспорт завершен",
        description: "Данные автомобилей экспортированы в JSON файл"
      });
    } catch (error) {
      console.error('Error exporting cars:', error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные автомобилей"
      });
    }
  };
  
  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Управление автомобилями</h1>
      
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleAddCar}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить автомобиль
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleExportCars} 
            variant="outline"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Экспорт автомобилей
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/import')}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Импорт автомобилей
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car.id} className="bg-white shadow rounded-md p-4">
            <h2 className="text-lg font-semibold">{car.brand} {car.model}</h2>
            <p className="text-gray-600">Год: {car.year}</p>
            {car.images && car.images.length > 0 && (
              <img 
                src={car.images.find(img => img.isMain)?.url || car.images[0]?.url} 
                alt={car.brand + ' ' + car.model}
                className="w-full h-40 object-cover my-2 rounded"
              />
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditCar(car)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDeleteCar(car.id)}
              >
                <Delete className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedCar && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Редактировать автомобиль: {selectedCar.brand} {selectedCar.model}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedCar(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <Tabs 
              defaultValue="basic" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="engine">Двигатель</TabsTrigger>
                <TabsTrigger value="dimensions">Размеры</TabsTrigger>
                <TabsTrigger value="performance">Производительность</TabsTrigger>
                <TabsTrigger value="images">Фотографии</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Бренд</FormLabel>
                    <Input
                      value={selectedCar.brand}
                      onChange={(e) => handleBasicChange(e, 'brand')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Модель</FormLabel>
                    <Input
                      value={selectedCar.model}
                      onChange={(e) => handleBasicChange(e, 'model')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Год</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.year}
                      onChange={(e) => handleBasicChange(e, 'year')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Тип кузова</FormLabel>
                    <Select 
                      value={selectedCar.bodyType} 
                      onValueChange={(value) => handleSelectChange('bodyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Тип кузова" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="седан">Седан</SelectItem>
                        <SelectItem value="хэтчбек">Хэтчбек</SelectItem>
                        <SelectItem value="универсал">Универсал</SelectItem>
                        <SelectItem value="внедорожник">Внедорожник</SelectItem>
                        <SelectItem value="кроссовер">Кроссовер</SelectItem>
                        <SelectItem value="купе">Купе</SelectItem>
                        <SelectItem value="кабриолет">Кабриолет</SelectItem>
                        <SelectItem value="пикап">Пикап</SelectItem>
                        <SelectItem value="минивэн">Минивэн</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Привод</FormLabel>
                    <Select 
                      value={selectedCar.drivetrain} 
                      onValueChange={(value) => handleSelectChange('drivetrain', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Привод" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="передний">Передний</SelectItem>
                        <SelectItem value="задний">Задний</SelectItem>
                        <SelectItem value="полный">Полный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Страна производитель</FormLabel>
                    <Input
                      value={selectedCar.country || ''}
                      onChange={(e) => handleBasicChange(e, 'country')}
                      placeholder="Например: Германия"
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Базовая цена</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.price.base}
                      onChange={(e) => handlePriceChange(e, 'base')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Скидка</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.price.discount || 0}
                      onChange={(e) => handlePriceChange(e, 'discount')}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <FormLabel>Описание</FormLabel>
                    <Textarea
                      value={selectedCar.description}
                      onChange={(e) => handleBasicChange(e, 'description')}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={selectedCar.isNew}
                      onChange={(e) => handleCheckboxChange('isNew', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isNew" className="text-sm">Новый автомобиль</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={selectedCar.isPopular || false}
                      onChange={(e) => handleCheckboxChange('isPopular', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isPopular" className="text-sm">Популярный автомобиль</label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="engine" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Тип двигателя</FormLabel>
                    <Select 
                      value={selectedCar.engine.type} 
                      onValueChange={(value) => setSelectedCar({
                        ...selectedCar,
                        engine: { ...selectedCar.engine, type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Тип двигателя" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="бензин">Бензиновый</SelectItem>
                        <SelectItem value="дизель">Дизельный</SelectItem>
                        <SelectItem value="гибрид">Гибридный</SelectItem>
                        <SelectItem value="электро">Электрический</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Объем двигателя (л)</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedCar.engine.displacement}
                      onChange={(e) => handleEngineChange(e, 'displacement')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Мощность (л.с.)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.engine.power}
                      onChange={(e) => handleEngineChange(e, 'power')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Крутящий момент (Нм)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.engine.torque}
                      onChange={(e) => handleEngineChange(e, 'torque')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Тип топлива</FormLabel>
                    <Input
                      value={selectedCar.engine.fuelType}
                      onChange={(e) => handleEngineChange(e, 'fuelType')}
                      placeholder="АИ-95"
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Тип трансмиссии</FormLabel>
                    <Select 
                      value={selectedCar.transmission.type} 
                      onValueChange={(value) => setSelectedCar({
                        ...selectedCar,
                        transmission: { ...selectedCar.transmission, type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Тип трансмиссии" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="механика">Механическая</SelectItem>
                        <SelectItem value="автомат">Автоматическая</SelectItem>
                        <SelectItem value="робот">Роботизированная</SelectItem>
                        <SelectItem value="вариатор">Вариатор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Количество передач</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.transmission.gears}
                      onChange={(e) => handleTransmissionChange(e, 'gears')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dimensions" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Длина (мм)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.length}
                      onChange={(e) => handleDimensionsChange(e, 'length')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Ширина (мм)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.width}
                      onChange={(e) => handleDimensionsChange(e, 'width')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Высота (мм)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.height}
                      onChange={(e) => handleDimensionsChange(e, 'height')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Колесная база (мм)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.wheelbase}
                      onChange={(e) => handleDimensionsChange(e, 'wheelbase')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Масса (кг)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.weight}
                      onChange={(e) => handleDimensionsChange(e, 'weight')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Объем багажника (л)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.dimensions.trunkVolume}
                      onChange={(e) => handleDimensionsChange(e, 'trunkVolume')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Разгон до 100 км/ч (сек)</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedCar.performance.acceleration}
                      onChange={(e) => handlePerformanceChange(e, 'acceleration')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Максимальная скорость (км/ч)</FormLabel>
                    <Input
                      type="number"
                      value={selectedCar.performance.topSpeed}
                      onChange={(e) => handlePerformanceChange(e, 'topSpeed')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Расход топлива в городе (л/100км)</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedCar.performance.fuelConsumption.city}
                      onChange={(e) => handlePerformanceChange(e, 'fuelConsumption.city')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Расход топлива на трассе (л/100км)</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedCar.performance.fuelConsumption.highway}
                      onChange={(e) => handlePerformanceChange(e, 'fuelConsumption.highway')}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Расход топлива смешанный (л/100км)</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedCar.performance.fuelConsumption.combined}
                      onChange={(e) => handlePerformanceChange(e, 'fuelConsumption.combined')}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="pt-4">
                {selectedCar.id && (
                  <CarImageUploader 
                    carId={selectedCar.id} 
                    onImageUpload={handleImageUpdate}
                  />
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedCar(null)}>
                Отмена
              </Button>
              <Button 
                onClick={handleSaveCar}
                disabled={loading}
              >
                {loading ? (
                  <>Сохранение...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;
