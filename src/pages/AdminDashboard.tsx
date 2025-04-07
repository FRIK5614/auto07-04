import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCars } from '@/hooks/useCars';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, CloudUpload } from 'lucide-react';
import { checkJsonFilesAvailability } from '@/services/api';

const AdminDashboard: React.FC = () => {
  const { cars, orders, loading, syncOrders } = useCars();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jsonFileStatus, setJsonFileStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    const checkJsonStatus = async () => {
      try {
        const isAvailable = await checkJsonFilesAvailability();
        setJsonFileStatus(isAvailable ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Error checking JSON files availability:', error);
        setJsonFileStatus('unavailable');
      }
    };
    
    checkJsonStatus();
  }, []);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);
  
  const safeCars = cars || [];
  const safeOrders = orders || [];
  
  useEffect(() => {
    console.log('Admin Dashboard Data:', { cars: safeCars, orders: safeOrders, loading });
    
    if (safeCars.length === 0 && !loading && isAdmin) {
      toast({
        title: "Нет данных об автомобилях",
        description: "Каталог автомобилей пуст",
        variant: "destructive"
      });
    }
  }, [safeCars, safeOrders, isAdmin, toast, loading]);

  const handleSyncOrders = async () => {
    try {
      setSyncStatus('syncing');
      await syncOrders();
      setSyncStatus('success');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error syncing orders:', error);
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Загрузка данных...</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const salesData = [
    { name: 'Новые', value: safeCars.filter(car => car.isNew).length },
    { name: 'Популярные', value: safeCars.filter(car => car.isPopular).length },
    { name: 'Всего', value: safeCars.length }
  ];

  const orderData = [
    { name: 'Новые', value: safeOrders.filter(order => order.status === 'new').length },
    { name: 'В обработке', value: safeOrders.filter(order => order.status === 'processing').length },
    { name: 'Завершенные', value: safeOrders.filter(order => order.status === 'completed').length }
  ];

  const syncStatusData = [
    { name: 'Синхронизированы', value: safeOrders.filter(order => order.syncStatus === 'synced').length },
    { name: 'Ожидают', value: safeOrders.filter(order => order.syncStatus === 'pending').length },
    { name: 'Ошибки', value: safeOrders.filter(order => order.syncStatus === 'failed').length }
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncOrders}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-1.5"
          >
            <CloudUpload className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>
              {syncStatus === 'syncing' 
                ? 'Синхронизация...' 
                : syncStatus === 'success'
                  ? 'Синхронизировано'
                  : syncStatus === 'error'
                    ? 'Ошибка синхронизации'
                    : 'Синхронизировать'
              }
            </span>
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            JSON файловое хранилище
          </CardTitle>
          <CardDescription>
            Статус хранилища заказов и автомобилей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Статус JSON-файлов:</div>
              <div className="flex items-center">
                {jsonFileStatus === 'checking' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Проверка
                  </Badge>
                )}
                {jsonFileStatus === 'available' && (
                  <Badge variant="default" className="bg-green-500">Доступны</Badge>
                )}
                {jsonFileStatus === 'unavailable' && (
                  <Badge variant="destructive">Недоступны</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Всего заказов в JSON:</div>
              <div className="text-2xl font-bold">
                {safeOrders.filter(order => order.syncStatus === 'synced').length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Несинхронизированных:</div>
              <div className="text-2xl font-bold">
                {safeOrders.filter(order => order.syncStatus !== 'synced').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика автомобилей</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Статус заказов</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Синхронизация JSON</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={syncStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
