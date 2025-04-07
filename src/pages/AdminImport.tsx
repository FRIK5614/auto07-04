
import React, { useState, useRef, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
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
  FileDown,
  ImagePlus,
  Trash2,
  FileJson
} from 'lucide-react';
import { Car } from '@/types/car';
import { v4 as uuidv4 } from 'uuid';

const AdminImport: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchCatalogData, importAllCars, cars: importedCars, loading, error, blockedSources } = useTmcAvtoCatalog();
  const { 
    cars, 
    reloadCars, 
    importCarsData, 
    addCar, 
    getUploadedImages, 
    saveUploadedImages 
  } = useCars();
  const [importDestination, setImportDestination] = useState<string>('preview');
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [importData, setImportData] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<{name: string, url: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // При загрузке компонента получаем ранее загруженные изображения
  useEffect(() => {
    if (isAdmin) {
      const fetchImages = async () => {
        const images = getUploadedImages();
        setUploadedImages(images);
      };
      fetchImages();
    }
  }, [isAdmin, getUploadedImages]);

  useEffect(() => {
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
          const carId = `imported-${uuidv4()}`;
          const newCar = {
            id: carId,
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
                id: `feature-${uuidv4()}`,
                name: "Климат-контроль",
                category: "Комфорт",
                isStandard: true
              }
            ],
            images: [
              {
                id: `image-${uuidv4()}`,
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
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
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
      const success = importCarsData(importData);
      
      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setImportData('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Ошибка при импорте данных');
      }
    } catch (err) {
      console.error('Error parsing import data:', err);
      setImportError('Ошибка при разборе JSON данных. Убедитесь, что формат корректен.');
    }
  };

  // Функция для обработки выбора JSON файла
  const handleJsonFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setImportError('Выбранный файл не является JSON файлом');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setImportData(content);
          setImportError(null);
        } catch (err) {
          console.error('Error reading JSON file:', err);
          setImportError('Ошибка при чтении файла JSON');
        }
      };
      
      reader.onerror = () => {
        setImportError('Ошибка при чтении файла');
      };
      
      reader.readAsText(file);
    }
  };
  
  // Функция для импорта из JSON файла
  const handleImportFromFile = async () => {
    setIsImporting(true);
    
    try {
      if (!importData.trim()) {
        setImportError('Нет данных для импорта');
        setIsImporting(false);
        return;
      }
      
      const success = importCarsData(importData);
      
      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setImportData('');
        
        if (jsonFileInputRef.current) {
          jsonFileInputRef.current.value = '';
        }
        
        toast({
          title: "Импорт завершен",
          description: "Данные успешно импортированы из JSON файла"
        });
        
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Ошибка при импорте данных');
      }
    } catch (err) {
      console.error('Error importing from file:', err);
      setImportError('Произошла ошибка при импорте');
    } finally {
      setIsImporting(false);
    }
  };

  // Функция для обработки выбора файлов изображений
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileArray = Array.from(event.target.files);
      setSelectedFiles(fileArray);
    }
  };

  // Функция для удаления изображения
  const handleDeleteImage = (imageName: string) => {
    try {
      const imagesData = localStorage.getItem('carImages');
      if (!imagesData) return;
      
      const images = JSON.parse(imagesData);
      const updatedImages = images.filter((img: { name: string }) => img.name !== imageName);
      
      localStorage.setItem('carImages', JSON.stringify(updatedImages));
      
      // Обновляем отображаемый список
      setUploadedImages(prev => prev.filter(img => img.name !== imageName));
      
      toast({
        title: "Изображение удалено",
        description: `Файл ${imageName} был удален`
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        variant: "destructive",
        title: "Ошибка удаления",
        description: "Не удалось удалить изображение"
      });
    }
  };

  // Функция для загрузки изображений
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      setImportError('Пожалуйста, выберите файлы для загрузки');
      return;
    }

    // Преобразуем файлы в base64 и сохраняем их в localStorage
    setIsUploading(true);
    const processFiles = async () => {
      const files = selectedFiles;
      const imagesData: { name: string, base64: string }[] = [];

      // Считываем все файлы и преобразуем их в base64
      for (const file of files) {
        try {
          const base64 = await readFileAsBase64(file);
          imagesData.push({ name: file.name, base64 });
        } catch (error) {
          console.error('Ошибка при чтении файла:', error);
          toast({
            variant: "destructive",
            title: "Ошибка загрузки",
            description: `Не удалось загрузить файл ${file.name}`
          });
        }
      }

      if (imagesData.length === 0) {
        setImportError('Не удалось загрузить изображения');
        setIsUploading(false);
        return;
      }

      // Сохраняем в localStorage через функцию из хука
      saveUploadedImages(imagesData);

      // Обновляем список загруженных изображений
      const newImages = imagesData.map(img => ({
        name: img.name,
        url: img.base64
      }));
      
      setUploadedImages(prev => [...prev, ...newImages]);

      setImportSuccess(true);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Изображения загружены",
        description: `Успешно загружено ${imagesData.length} изображений`
      });
      
      setTimeout(() => setImportSuccess(false), 3000);
      setIsUploading(false);
    };

    await processFiles();
  };

  // Вспомогательная функция для преобразования файла в base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Ошибка при чтении файла'));
      };
      reader.readAsDataURL(file);
    });
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
          
          <Tabs defaultValue="import">
            <TabsList className="mb-4">
              <TabsTrigger value="export"><FileDown className="mr-2 h-4 w-4" />Экспорт</TabsTrigger>
              <TabsTrigger value="import"><FileUp className="mr-2 h-4 w-4" />Импорт</TabsTrigger>
              <TabsTrigger value="tmcavto">TMC Авто</TabsTrigger>
              <TabsTrigger value="images"><ImagePlus className="mr-2 h-4 w-4" />Изображения</TabsTrigger>
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
                    Вставьте JSON данные автомобилей или загрузите JSON файл для импорта
                  </p>
                  
                  <div className="flex flex-col space-y-6">
                    {/* Импорт из файла */}
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Импорт из JSON файла</h4>
                      <Input
                        ref={jsonFileInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileSelect}
                        className="mb-4"
                      />
                      
                      {importData && (
                        <Alert className="bg-blue-50 border-blue-200 mb-4">
                          <FileJson className="h-4 w-4 text-blue-500" />
                          <AlertTitle>JSON файл загружен</AlertTitle>
                          <AlertDescription>
                            Файл успешно прочитан. Нажмите кнопку импорта для добавления данных.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        onClick={handleImportFromFile}
                        className="w-full"
                        disabled={!importData.trim() || isImporting}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Импорт...
                          </>
                        ) : (
                          <>
                            <FileJson className="mr-2 h-4 w-4" />
                            Импортировать из JSON файла
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Импорт из текста */}
                    <div className="border p-4 rounded-md">
                      <h4 className="font-medium mb-2">Импорт из текста</h4>
                      <Textarea
                        placeholder="Вставьте JSON данные автомобилей..."
                        className="min-h-[200px] mb-4"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                      />
                      
                      <Button 
                        onClick={handleImportFromText}
                        className="w-full"
                        disabled={!importData.trim()}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Импортировать из текста
                      </Button>
                    </div>
                    
                    {importError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Ошибка импорта</AlertTitle>
                        <AlertDescription>{importError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {importSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertTriangle className="h-4 w-4 text-green-500" />
                        <AlertTitle>Импорт успешно завершен</AlertTitle>
                        <AlertDescription>
                          Данные были успешно импортированы в каталог.
                        </AlertDescription>
                      </Alert>
                    )}
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
            
            <TabsContent value="images">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Загрузка изображений</h3>
                  <p className="text-muted-foreground mb-4">
                    Загрузите изображения для использования в каталоге автомобилей
                  </p>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="border p-4 rounded-md">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="mb-4"
                      />
                      
                      {selectedFiles.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Выбрано файлов: {selectedFiles.length}</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedFiles.slice(0, 6).map((file, index) => (
                              <div key={index} className="text-xs truncate">
                                {file.name}
                              </div>
                            ))}
                            {selectedFiles.length > 6 && (
                              <div className="text-xs text-muted-foreground">
                                ...и еще {selectedFiles.length - 6} файлов
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {importSuccess && (
                        <Alert className="bg-green-50 border-green-200 mb-4">
                          <AlertTriangle className="h-4 w-4 text-green-500" />
                          <AlertTitle>Загрузка завершена</AlertTitle>
                          <AlertDescription>
                            Изображения успешно загружены
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        onClick={handleImageUpload}
                        className="w-full"
                        disabled={selectedFiles.length === 0 || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Загрузить изображения
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Отображение загруженных изображений */}
                    {uploadedImages.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Загруженные изображения ({uploadedImages.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="rounded-md overflow-hidden border aspect-square relative group">
                              <img 
                                src={image.url} 
                                alt={image.name} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                                {image.name}
                              </div>
                              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteImage(image.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
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
