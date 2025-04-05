
import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useTmcAvtoCatalog } from '@/hooks/useTmcAvtoCatalog';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Loader2, RefreshCw, Database, AlertTriangle, FileText } from 'lucide-react';

const AdminImport: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { fetchCatalogData, importAllCars, cars: importedCars, loading, error, blockedSources } = useTmcAvtoCatalog();
  const { reloadCars, addCar } = useCars();
  const [importDestination, setImportDestination] = React.useState<string>('preview');
  
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleImport = async () => {
    const data = await importAllCars();
    console.log('Imported data:', data);
  };
  
  const handleImportToCatalog = async () => {
    // Convert imported cars to your application's car format and add them
    if (importedCars && importedCars.length > 0) {
      let addedCount = 0;
      
      for (const importedCar of importedCars) {
        try {
          // Create a new car object in the format expected by the app
          const newCar = {
            id: `imported-${importedCar.id || Date.now()}`,
            brand: importedCar.brand,
            model: importedCar.model,
            year: importedCar.year,
            bodyType: "Седан", // Default value
            colors: ["Белый", "Черный"], // Default values
            price: {
              base: importedCar.price || 0,
              withOptions: 0
            },
            engine: {
              type: "4-цилиндровый",
              displacement: 2.0,
              power: 150,
              torque: 200,
              fuelType: "Бензин"
            },
            transmission: {
              type: "Автоматическая",
              gears: 6
            },
            drivetrain: "Передний",
            dimensions: {
              length: 4500,
              width: 1800,
              height: 1500,
              wheelbase: 2700,
              weight: 1500,
              trunkVolume: 450
            },
            performance: {
              acceleration: 9.0,
              topSpeed: 200,
              fuelConsumption: {
                city: 8.0,
                highway: 6.0,
                combined: 7.0
              }
            },
            features: [
              {
                id: `feature-${Date.now()}-1`,
                name: "Климат-контроль",
                category: "Комфорт",
                isStandard: true
              }
            ],
            images: [
              {
                id: `image-${Date.now()}-1`,
                url: importedCar.imageUrl || "/placeholder.svg",
                alt: `${importedCar.brand} ${importedCar.model}`
              }
            ],
            description: `${importedCar.brand} ${importedCar.model} ${importedCar.year} года`,
            isNew: false,
            country: importedCar.country || "Неизвестно",
            viewCount: 0
          };
          
          addCar(newCar);
          addedCount++;
        } catch (err) {
          console.error("Error adding car:", err);
        }
      }
      
      if (addedCount > 0) {
        await reloadCars();
      }
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Импорт данных</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Импорт из внешних источников</CardTitle>
          <CardDescription>
            Импортируйте данные из TMC Авто и других источников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockedSources.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200 mb-6">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Обнаружены заблокированные источники</AlertTitle>
              <AlertDescription>
                Некоторые источники данных недоступны. Проверьте подключение или используйте другие источники.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="tmcavto">
            <TabsList className="mb-4">
              <TabsTrigger value="tmcavto">TMC Авто</TabsTrigger>
              <TabsTrigger value="file">Файлы</TabsTrigger>
              <TabsTrigger value="manual">Ручной ввод</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tmcavto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Импорт из TMC Авто</h3>
                  <p className="text-muted-foreground mb-4">
                    Получите данные о автомобилях из каталога TMC Авто
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="border p-4 rounded-md">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox 
                          id="import-destination" 
                          checked={importDestination === 'catalog'}
                          onCheckedChange={(checked) => {
                            setImportDestination(checked ? 'catalog' : 'preview');
                          }}
                        />
                        <Label htmlFor="import-destination">
                          Импортировать в каталог автомобилей
                        </Label>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button 
                          onClick={handleImport} 
                          disabled={loading}
                          className="flex-1"
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
                        
                        {importedCars && importedCars.length > 0 && importDestination === 'catalog' && (
                          <Button 
                            onClick={handleImportToCatalog}
                            disabled={loading}
                          >
                            <Database className="mr-2 h-4 w-4" />
                            Добавить в каталог ({importedCars.length})
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Ошибка импорта</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {importedCars && importedCars.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Импортировано {importedCars.length} автомобилей</h4>
                        <p className="text-sm text-muted-foreground">
                          {importDestination === 'preview' 
                            ? 'Для добавления в каталог отметьте опцию "Импортировать в каталог автомобилей"' 
                            : 'Нажмите "Добавить в каталог" для сохранения данных'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="file">
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Импорт из файлов</h3>
                <p className="text-muted-foreground mb-4">
                  Функция пока находится в разработке
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="manual">
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ручной ввод данных</h3>
                <p className="text-muted-foreground mb-4">
                  Функция пока находится в разработке
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminImport;
