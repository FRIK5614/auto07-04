
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Download } from 'lucide-react';
import TmcAvtoCatalog from '@/components/TmcAvtoCatalog';
import { useToast } from '@/hooks/use-toast';

const AdminImport: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { 
    loadCars, 
    importCarsData,
    exportCarsData
  } = useCars();
  
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('json');
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
  };

  const handleJsonImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const data = JSON.parse(jsonData);
      const result = importCarsData(data);
      
      if (result && typeof result === 'object' && 'success' in result && 'failed' in result) {
        setImportResult(result);
        toast({
          title: "Импорт завершен",
          description: `Успешно импортировано: ${result.success}, не удалось: ${result.failed}`
        });
      } else {
        setImportResult({ success: 0, failed: 0 });
        toast({
          variant: "destructive",
          title: "Ошибка импорта",
          description: "Неожиданный формат результата"
        });
      }
    } catch (error) {
      console.error('Error importing JSON data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Неверный формат JSON"
      });
    } finally {
      setIsImporting(false);
      // Перезагружаем список автомобилей после импорта
      loadCars();
    }
  };

  const handleGetJsonTemplate = () => {
    try {
      const templateData = [
        {
          "id": "template_car_1",
          "brand": "Марка автомобиля",
          "model": "Модель автомобиля",
          "year": 2023,
          "bodyType": "седан",
          "colors": ["#FFFFFF", "#000000"],
          "price": {
            "base": 1500000,
            "discount": 100000
          },
          "engine": {
            "type": "бензин",
            "displacement": 2.0,
            "power": 150,
            "torque": 200,
            "fuelType": "АИ-95"
          },
          "transmission": {
            "type": "автомат",
            "gears": 6
          },
          "drivetrain": "передний",
          "dimensions": {
            "length": 4500,
            "width": 1800,
            "height": 1400,
            "wheelbase": 2700,
            "weight": 1500,
            "trunkVolume": 450
          },
          "performance": {
            "acceleration": 9.0,
            "topSpeed": 220,
            "fuelConsumption": {
              "city": 10.0,
              "highway": 6.0,
              "combined": 8.0
            }
          },
          "features": [
            {
              "id": "feature_1",
              "name": "Климат-контроль",
              "category": "Комфорт",
              "isStandard": true
            },
            {
              "id": "feature_2",
              "name": "Подогрев сидений",
              "category": "Комфорт",
              "isStandard": false
            }
          ],
          "images": [],
          "description": "Описание автомобиля",
          "isNew": true,
          "country": "Германия"
        }
      ];
      
      const templateStr = JSON.stringify(templateData, null, 2);
      
      // Добавляем шаблон в текстовое поле
      setJsonData(templateStr);
      
      toast({
        title: "Шаблон загружен",
        description: "Шаблон данных для импорта загружен в поле ввода"
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сгенерировать шаблон"
      });
    }
  };

  const handleExportAll = () => {
    try {
      const exportData = exportCarsData();
      const jsonString = JSON.stringify(exportData, null, 2);
      
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
        description: "Все автомобили экспортированы в JSON файл"
      });
    } catch (error) {
      console.error('Error exporting cars:', error);
      toast({
        variant: "destructive",
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать автомобили"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Импорт автомобилей</h1>
      
      <Tabs defaultValue="json" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="tmc">TMC Avto Catalog</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Импорт данных</CardTitle>
            <CardDescription>Выберите способ импорта данных об автомобилях</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="json" className="mt-0">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">JSON данные</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGetJsonTemplate}
                    >
                      Загрузить шаблон
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportAll}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Экспортировать все
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={jsonData}
                  onChange={handleJsonChange}
                  placeholder="Вставьте JSON данные сюда"
                  rows={8}
                />
                <Button onClick={handleJsonImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Импорт...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Импортировать
                    </>
                  )}
                </Button>
                {importResult && (
                  <div className="mt-4">
                    <p>
                      Успешно импортировано: {importResult.success}, не удалось: {importResult.failed}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tmc" className="mt-0">
              <TmcAvtoCatalog />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default AdminImport;
