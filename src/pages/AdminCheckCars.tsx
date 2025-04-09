
import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database } from 'lucide-react';

interface CarBasicInfo {
  id: string;
  brand: string;
  model: string;
  year: number;
  bodyType: string;
  price: string;
  engine: string;
  transmission: string;
  status: string;
  imageUrl: string | null;
}

interface CheckCarsResponse {
  success: boolean;
  totalCars: number;
  message: string;
  cars: CarBasicInfo[];
}

const AdminCheckCars: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckCarsResponse | null>(null);

  // Проверяем авторизацию админа
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const checkCars = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check_cars.php');
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        toast({
          title: "Проверка завершена",
          description: data.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.message || "Не удалось проверить наличие автомобилей в БД"
        });
      }
    } catch (error) {
      console.error("Ошибка при проверке автомобилей:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось подключиться к API для проверки автомобилей"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // При первом рендере выполняем проверку
    checkCars();
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Проверка автомобилей в базе данных</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg">
          {result && (
            <span>
              Найдено автомобилей: {result.totalCars}
            </span>
          )}
        </div>
        
        <Button 
          onClick={checkCars} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Проверка...' : 'Обновить'}
        </Button>
      </div>
      
      {result && (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="list">Список автомобилей</TabsTrigger>
            <TabsTrigger value="debug">Отладочная информация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.cars.map(car => (
                <Card key={car.id} className="overflow-hidden">
                  {car.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={car.imageUrl} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{car.brand} {car.model}</CardTitle>
                      <Badge variant={car.status === 'published' ? 'default' : 'secondary'}>
                        {car.status === 'published' ? 'Опубликован' : 'Черновик'}
                      </Badge>
                    </div>
                    <CardDescription>{car.year} · {car.bodyType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{car.price}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Двигатель:</span> {car.engine}
                      </div>
                      <div>
                        <span className="text-gray-500">КПП:</span> {car.transmission}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {result.cars.length === 0 && (
              <div className="text-center p-8">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-lg font-semibold">В базе данных нет автомобилей</p>
                <p className="text-gray-500">Добавьте автомобили через административную панель</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle>Отладочная информация</CardTitle>
                <CardDescription>Данные полученные от API</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-[500px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminCheckCars;
