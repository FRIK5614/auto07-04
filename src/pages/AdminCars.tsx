import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Plus, Delete, Edit, Save, ExternalLink, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Car } from '@/types/car';

const AdminCars: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { 
    cars, 
    loadCars, 
    deleteCar, 
    addCar, 
    updateCar,
    uploadCarImage,
    fetchCarImages,
    addImageByUrl
  } = useCars();
  
  const { toast } = useToast();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      loadCars();
    }
  }, [isAdmin, navigate, loadCars]);

  const handleAddCar = () => {
    const newCar: Car = {
      id: Date.now().toString(),
      brand: 'Новый бренд',
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
    addCar(newCar);
  };

  const handleDeleteCar = (carId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteCar(carId);
    }
  };

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
  };

  const handleSaveCar = () => {
    if (selectedCar) {
      updateCar(selectedCar);
      setSelectedCar(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field: string) => {
    if (selectedCar) {
      setSelectedCar({ ...selectedCar, [field]: e.target.value });
    }
  };

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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car.id} className="bg-white shadow rounded-md p-4">
            <h2 className="text-lg font-semibold">{car.brand} {car.model}</h2>
            <p className="text-gray-600">Год: {car.year}</p>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Редактировать автомобиль</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brand">
                  Бренд
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="brand"
                  type="text"
                  value={selectedCar.brand}
                  onChange={(e) => handleChange(e, 'brand')}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
                  Модель
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="model"
                  type="text"
                  value={selectedCar.model}
                  onChange={(e) => handleChange(e, 'model')}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
                  Год
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="year"
                  type="number"
                  value={selectedCar.year}
                  onChange={(e) => handleChange(e, 'year')}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="ghost" onClick={() => setSelectedCar(null)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveCar}>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;
