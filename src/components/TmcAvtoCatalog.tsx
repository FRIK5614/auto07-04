
import { useState } from 'react';
import { useTmcAvtoCatalog, Car } from '@/hooks/useTmcAvtoCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorState from '@/components/ErrorState';
import { Loader2, Download, RefreshCw, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const TmcAvtoCatalog = () => {
  const [url, setUrl] = useState('/cars/japan');
  const [responseData, setResponseData] = useState<string | null>(null);
  const { fetchCatalogData, importAllCars, loading, error, cars, logs } = useTmcAvtoCatalog();
  const [activeTab, setActiveTab] = useState('catalog');
  const [showLogs, setShowLogs] = useState(false);

  const handleFetch = async () => {
    const data = await fetchCatalogData({ url });
    if (data) {
      setResponseData(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  };

  const handleImport = async () => {
    setShowLogs(true);
    await importAllCars();
  };

  const getCountryFilter = (country: string) => {
    return cars.filter(car => car.country === country);
  };

  const japanCars = getCountryFilter('Япония');
  const koreaCars = getCountryFilter('Корея');
  const chinaCars = getCountryFilter('Китай');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Каталог автомобилей TMC Авто</CardTitle>
          <CardDescription>
            Импорт и просмотр данных с catalog.tmcavto.ru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="catalog">Каталог</TabsTrigger>
              <TabsTrigger value="import">Импорт данных</TabsTrigger>
            </TabsList>
            
            <TabsContent value="catalog">
              {cars.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Общий каталог: {cars.length} авто</h3>
                    <Button 
                      onClick={handleImport} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Обновить данные
                    </Button>
                  </div>
                  
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">Все ({cars.length})</TabsTrigger>
                      <TabsTrigger value="japan">Япония ({japanCars.length})</TabsTrigger>
                      <TabsTrigger value="korea">Корея ({koreaCars.length})</TabsTrigger>
                      <TabsTrigger value="china">Китай ({chinaCars.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      <CarTable cars={cars} />
                    </TabsContent>
                    
                    <TabsContent value="japan">
                      <CarTable cars={japanCars} />
                    </TabsContent>
                    
                    <TabsContent value="korea">
                      <CarTable cars={koreaCars} />
                    </TabsContent>
                    
                    <TabsContent value="china">
                      <CarTable cars={chinaCars} />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">В каталоге пока нет данных</p>
                  <Button onClick={handleImport} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Импортировать данные
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="import">
              <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Импорт всех автомобилей</h3>
                    <p className="text-muted-foreground mb-4">
                      Автоматически импортирует все автомобили из Японии, Кореи и Китая.
                    </p>
                    <Button 
                      onClick={handleImport} 
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Импорт...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Импортировать все автомобили
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Импорт по URL</h3>
                    <p className="text-muted-foreground mb-4">
                      Укажите конкретный путь для импорта данных с catalog.tmcavto.ru
                    </p>
                    <div className="flex gap-2 mb-4">
                      <Input 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Введите путь, например: /cars/toyota"
                        className="flex-1"
                        disabled={loading}
                      />
                      <Button onClick={handleFetch} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Получить
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {loading && (
                  <Alert className="bg-blue-50 border-blue-200 my-4">
                    <Loader2 className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                    <AlertTitle>Импорт в процессе</AlertTitle>
                    <AlertDescription>
                      Идёт импорт данных. Пожалуйста, подождите. Это может занять некоторое время.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Ошибка импорта</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <div className="mt-2">
                      <Button onClick={handleImport} variant="outline" size="sm">
                        Повторить
                      </Button>
                    </div>
                  </Alert>
                )}

                {cars.length > 0 && !loading && !error && (
                  <Alert className="bg-green-50 border-green-200 my-4">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <AlertTitle>Импорт успешно завершен</AlertTitle>
                    <AlertDescription>
                      Импортировано {cars.length} автомобилей.
                    </AlertDescription>
                  </Alert>
                )}

                {showLogs && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Логи парсинга:</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowLogs(!showLogs)}
                      >
                        {showLogs ? 'Скрыть логи' : 'Показать логи'}
                      </Button>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {logs && logs.length > 0 ? (
                          logs.map((log, index) => (
                            <div key={index}>{log}</div>
                          ))
                        ) : responseData ? (
                          responseData
                        ) : (
                          "Нет доступных логов"
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface CarTableProps {
  cars: Car[];
}

const CarTable = ({ cars }: CarTableProps) => {
  if (cars.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">Нет данных для отображения</p>;
  }
  
  return (
    <Table>
      <TableCaption>Список импортированных автомобилей</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Страна</TableHead>
          <TableHead>Бренд</TableHead>
          <TableHead>Модель</TableHead>
          <TableHead>Год</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Фото</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cars.map((car) => (
          <TableRow key={car.id}>
            <TableCell>{car.country}</TableCell>
            <TableCell>{car.brand}</TableCell>
            <TableCell>{car.model}</TableCell>
            <TableCell>{car.year}</TableCell>
            <TableCell>
              {car.price ? new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0
              }).format(car.price) : 'Не указана'}
            </TableCell>
            <TableCell>
              {car.imageUrl ? (
                <a href={car.detailUrl} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={car.imageUrl} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-16 h-12 object-cover rounded" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </a>
              ) : (
                'Нет фото'
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TmcAvtoCatalog;
