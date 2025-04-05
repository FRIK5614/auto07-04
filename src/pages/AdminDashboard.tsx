
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CarFront, 
  Eye, 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Trash2, 
  FileUp,
  FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { BarChart } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { cars, orders, deleteCar, getMostViewedCars, processOrder } = useCars();
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const mostViewedCars = getMostViewedCars(5);
  
  const totalViews = cars.reduce((sum, car) => sum + (car.viewCount || 0), 0);
  const totalCars = cars.length;
  const totalOrders = orders.length;
  const newOrders = orders.filter(order => order.status === 'new').length;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleFileImport = () => {
    if (!importFile) {
      toast({
        title: "Ошибка",
        description: "Файл не выбран",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would process the file and update the database
    toast({
      title: "Импорт",
      description: `Файл ${importFile.name} успешно импортирован`
    });
    
    // Reset the file input
    setImportFile(null);
  };
  
  const exportCatalog = () => {
    // In a real app, this would generate a file for download
    const dataStr = JSON.stringify(cars, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'cars-catalog.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Экспорт",
      description: "Каталог успешно экспортирован"
    });
  };
  
  const handleDeleteCar = (carId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteCar(carId);
    }
  };
  
  const handleOrderStatusChange = (orderId: string, status: 'processing' | 'completed' | 'canceled') => {
    processOrder(orderId, status);
  };
  
  // Define chart data for statistics
  const viewsData = [
    {
      name: "Просмотры",
      data: mostViewedCars.map(car => ({
        x: `${car.brand} ${car.model}`,
        y: car.viewCount || 0
      }))
    }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground mt-2">
          Управление каталогом автомобилей и другими функциями сайта
        </p>
      </div>
      
      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего автомобилей
            </CardTitle>
            <CarFront className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCars}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Просмотры
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего заказов
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Новые заказы
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newOrders}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
          <TabsTrigger value="cars">Автомобили</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="import">Импорт/Экспорт</TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Самые просматриваемые автомобили</CardTitle>
              <CardDescription>
                Статистика просмотров по автомобилям
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {mostViewedCars.length > 0 ? (
                  <BarChart 
                    data={viewsData}
                    categories={['Просмотры']}
                    index="x"
                    colors={['blue']}
                    valueFormatter={(value) => `${value} просмотров`}
                    yAxisWidth={48}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Нет данных о просмотрах</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cars">
          <Card>
            <CardHeader>
              <CardTitle>Каталог автомобилей</CardTitle>
              <CardDescription>
                Управление автомобилями в каталоге
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Список автомобилей в каталоге</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Марка</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Год</TableHead>
                      <TableHead>Страна</TableHead>
                      <TableHead>Просмотры</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>{car.brand}</TableCell>
                        <TableCell>{car.model}</TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{car.country || 'Не указана'}</TableCell>
                        <TableCell>{car.viewCount || 0}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            maximumFractionDigits: 0
                          }).format(car.price.base)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link to={`/admin/cars/edit/${car.id}`}>
                              <Button variant="outline" size="sm">
                                Редактировать
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteCar(car.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Link to="/admin/cars/add">
                  <Button>Добавить автомобиль</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Заказы</CardTitle>
              <CardDescription>
                Управление заказами клиентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>Список заказов клиентов</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Автомобиль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const car = cars.find(c => c.id === order.carId);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.customerPhone}</TableCell>
                            <TableCell>{order.customerEmail}</TableCell>
                            <TableCell>
                              {car ? `${car.brand} ${car.model}` : 'Неизвестно'}
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status === 'new' ? 'Новый' :
                                order.status === 'processing' ? 'В обработке' :
                                order.status === 'completed' ? 'Завершен' :
                                'Отменен'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {order.status === 'new' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOrderStatusChange(order.id, 'processing')}
                                  >
                                    В обработку
                                  </Button>
                                )}
                                {(order.status === 'new' || order.status === 'processing') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOrderStatusChange(order.id, 'completed')}
                                  >
                                    Завершить
                                  </Button>
                                )}
                                {order.status !== 'canceled' && order.status !== 'completed' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleOrderStatusChange(order.id, 'canceled')}
                                  >
                                    Отменить
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">Нет заказов</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    На данный момент нет заказов от клиентов
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Импорт/Экспорт данных</CardTitle>
              <CardDescription>
                Управление импортом и экспортом данных каталога
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Импорт данных</h3>
                  <div className="flex items-end gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <label htmlFor="catalogFile" className="text-sm font-medium">
                        Выберите файл с каталогом автомобилей
                      </label>
                      <input
                        id="catalogFile"
                        type="file"
                        accept=".json,.csv"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                        onChange={handleFileChange}
                      />
                    </div>
                    <Button 
                      onClick={handleFileImport}
                      disabled={!importFile}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Импортировать
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Поддерживаемые форматы: JSON, CSV. Максимальный размер файла: 10MB
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Экспорт данных</h3>
                  <Button onClick={exportCatalog}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Экспортировать каталог
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Экспорт всего каталога автомобилей в формате JSON
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Другие функции каталога</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/admin/tmcavto-catalog">
                      <Card className="h-full cursor-pointer hover:bg-slate-50 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-base">Каталог TMC Авто</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Управление импортом автомобилей из каталога TMC Авто
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
