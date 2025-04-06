import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Loader2, 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  FileText, 
  Upload,
  Save,
  ArrowUpDown,
  FileUp,
  FileDown
} from 'lucide-react';
import { Car } from '@/types/car';

const AdminImport: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { fetchCatalogData, importAllCars, cars: importedCars, loading, error, blockedSources } = useTmcAvtoCatalog();
  const { cars, reloadCars, addCar } = useCars();
  const [importDestination, setImportDestination] = useState<string>('preview');
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [importData, setImportData] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
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
    if (importedCars && importedCars.length > 0) {
      let addedCount = 0;
      
      for (const importedCar of importedCars) {
        try {
          const newCar = {
            id: `imported-${importedCar.id || Date.now()}`,
            brand: importedCar.brand,
            model: importedCar.model,
            year: importedCar.year,
            bodyType: "Седан",
            colors: ["Белый", "Черный"],
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

  const handleExportData = () => {
    if (!cars || cars.length === 0) {
      return;
    }

    let dataStr = '';
    let filename = '';

    if (exportFormat === 'json') {
      dataStr = JSON.stringify(cars, null, 2);
      filename = `cars_export_${new Date().toISOString().slice(0, 10)}.json`;
    } else if (exportFormat === 'csv') {
      const headers = ['id', 'brand', 'model', 'year', 'bodyType', 'price', 'country', 'isNew'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const car of cars) {
        const row = [
          car.id,
          car.brand,
          car.model,
          car.year,
          car.bodyType,
          car.price.base,
          car.country || '',
          car.isNew ? 'true' : 'false'
        ];
        
        const escapedRow = row.map(value => {
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        });
        
        csvRows.push(escapedRow.join(','));
      }
      
      dataStr = csvRows.join('\n');
      filename = `cars_export_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFromText = () => {
    if (!importData.trim()) {
      setImportError('Пожалуйста, вставьте данные для импорта');
      return;
    }

    try {
      const parsedData = JSON.parse(importData);
      
      if (!Array.isArray(parsedData)) {
        setImportError('Данные должны быть массивом автомобилей');
        return;
      }

      for (const item of parsedData) {
        if (!item.brand || !item.model) {
          setImportError('Некоторые автомобили не содержат обязательные поля (brand, model)');
          return;
        }
      }

      let addedCount = 0;
      for (const carData of parsedData) {
        if (!carData.id) {
          carData.id = `imported-${Date.now()}-${addedCount}`;
        }
        
        const completeCar = ensureCompleteCarObject(carData);
        
        addCar(completeCar);
        addedCount++;
      }

      if (addedCount > 0) {
        setImportSuccess(true);
        setImportError(null);
        setImportData('');
        reloadCars();
      } else {
        setImportError('Нет данных для импорта');
      }
    } catch (err) {
      console.error('Error parsing import data:', err);
      setImportError('Ошибка при разборе JSON данных. Убедитесь, что формат корректен.');
    }
  };

  const ensureCompleteCarObject = (carData: Partial<Car>): Car => {
    return {
      id: carData.id || `imported-${Date.now()}`,
      brand: carData.brand || 'Неизвестно',
      model: carData.model || 'Неизвестно',
      year: carData.year || new Date().getFullYear(),
      bodyType: carData.bodyType || "Седан",
      colors: carData.colors || ["Белый", "Черный"],
      price: carData.price || {
        base: 0,
        withOptions: 0
      },
      engine: carData.engine || {
        type: "4-цилиндровый",
        displacement: 2.0,
        power: 150,
        torque: 200,
        fuelType: "Бензин"
      },
      transmission: carData.transmission || {
        type: "Автоматическая",
        gears: 6
      },
      drivetrain: carData.drivetrain || "Передний",
      dimensions: carData.dimensions || {
        length: 4500,
        width: 1800,
        height: 1500,
        wheelbase: 2700,
        weight: 1500,
        trunkVolume: 450
      },
      performance: carData.performance || {
        acceleration: 9.0,
        topSpeed: 200,
        fuelConsumption: {
          city: 8.0,
          highway: 6.0,
          combined: 7.0
        }
      },
      features: carData.features || [
        {
          id: `feature-${Date.now()}-1`,
          name: "Климат-контроль",
          category: "Комфорт",
          isStandard: true
        }
      ],
      images: carData.images || [
        {
          id: `image-${Date.now()}-1`,
          url: "/placeholder.svg",
          alt: `${carData.brand || 'Неизвестно'} ${carData.model || 'Неизвестно'}`
        }
      ],
      description: carData.description || `${carData.brand || 'Неизвестно'} ${carData.model || 'Неизвестно'} ${carData.year || new Date().getFullYear()} года`,
      isNew: carData.isNew || false,
      country: carData.country || "Неизвестно",
      viewCount: carData.viewCount || 0
    };
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Импорт и экспорт данных</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Управление данными автомобилей</CardTitle>
          <CardDescription>
            Импортируйте и экспортируйте каталог автомобилей
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
          
          <Tabs defaultValue="export">
            <TabsList className="mb-4">
              <TabsTrigger value="export"><FileDown className="mr-2 h-4 w-4" />Экспорт</TabsTrigger>
              <TabsTrigger value="import"><FileUp className="mr-2 h-4 w-4" />Импорт</TabsTrigger>
              <TabsTrigger value="tmcavto">TMC Авто</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Экспорт каталога автомобилей</h3>
                  <p className="text-muted-foreground mb-4">
                    Экспортируйте данные об автомобилях для резервного копирования или переноса
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="border p-4 rounded-md">
                      <div className="flex items-center space-x-2 mb-4">
                        <Label htmlFor="export-format">Формат экспорта:</Label>
                        <select 
                          id="export-format"
                          className="border rounded-md px-2 py-1"
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                        >
                          <option value="json">JSON (полный формат)</option>
                          <option value="csv">CSV (базовые поля)</option>
                        </select>
                      </div>
                      
                      <Button 
                        onClick={handleExportData}
                        className="w-full"
                        disabled={!cars || cars.length === 0}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Экспортировать каталог ({cars?.length || 0} автомобилей)
                      </Button>
                    </div>
                    
                    {(!cars || cars.length === 0) && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Нет данных для экспорта</AlertTitle>
                        <AlertDescription>
                          Каталог автомобилей пуст. Добавьте автомобили или импортируйте данные.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="import">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Импорт из JSON</h3>
                  <p className="text-muted-foreground mb-4">
                    Вставьте JSON данные автомобилей для импорта
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="border p-4 rounded-md">
                      <Textarea
                        placeholder="Вставьте JSON данные автомобилей..."
                        className="min-h-[200px] mb-4"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                      />
                      
                      {importError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Ошибка импорта</AlertTitle>
                          <AlertDescription>{importError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {importSuccess && (
                        <Alert className="bg-green-50 border-green-200 mb-4">
                          <AlertTriangle className="h-4 w-4 text-green-500" />
                          <AlertTitle>Импорт успешно завершен</AlertTitle>
                          <AlertDescription>
                            Данные были успешно импортированы в каталог.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        onClick={handleImportFromText}
                        className="w-full"
                        disabled={!importData.trim()}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Импортировать данные
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminImport;
