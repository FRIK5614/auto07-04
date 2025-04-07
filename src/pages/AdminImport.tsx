import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useCars } from '@/hooks/useCars';
import { useTmcAvtoCatalog } from '@/hooks/useTmcAvtoCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Database, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import TmcAvtoCatalog from '@/components/TmcAvtoCatalog';
import { useToast } from '@/hooks/use-toast';

const AdminImport: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { 
    loadCars, 
    importCarsData,
    uploadCarImage,
    addImageByUrl
  } = useCars();
  
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('json');
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [tmcCatalogVisible, setTmcCatalogVisible] = useState(false);
  const [tmcCatalogCars, setTmcCatalogCars] = useState<any[]>([]);
  const [tmcCatalogLoading, setTmcCatalogLoading] = useState(false);
  const [tmcCatalogError, setTmcCatalogError] = useState<string | null>(null);
  const [tmcCatalogPage, setTmcCatalogPage] = useState(1);
  const [tmcCatalogTotalPages, setTmcCatalogTotalPages] = useState(1);
  const [tmcCatalogSearchTerm, setTmcCatalogSearchTerm] = useState('');
  const [tmcCatalogItemsPerPage, setTmcCatalogItemsPerPage] = useState(10);

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
      const { success, failed } = await importCarsData(data);
      
      setImportResult({ success, failed });
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано: ${success}, не удалось: ${failed}`
      });
    } catch (error) {
      console.error('Error importing JSON data:', error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: "Неверный формат JSON"
      });
    } finally {
      setIsImporting(false);
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
                <Label htmlFor="json-data">JSON данные</Label>
                <Textarea
                  id="json-data"
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
