
import React, { useState, useEffect } from 'react';
import { useCars } from '@/hooks/useCars';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/car';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Check, 
  Clock, 
  X, 
  AlertCircle, 
  RefreshCw,
  Phone,
  Mail,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-500 whitespace-nowrap"><AlertCircle className="w-3 h-3 mr-1" /> Новый</Badge>;
    case 'processing':
      return <Badge variant="secondary" className="whitespace-nowrap"><Clock className="w-3 h-3 mr-1" /> В обработке</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 whitespace-nowrap"><Check className="w-3 h-3 mr-1" /> Завершен</Badge>;
    case 'canceled':
      return <Badge variant="destructive" className="whitespace-nowrap"><X className="w-3 h-3 mr-1" /> Отменен</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const OrderCard = ({ 
  order, 
  car, 
  onStatusChange, 
  onDeleteOrder 
}: { 
  order: Order; 
  car: ReturnType<typeof useCars>['getCarById'] extends (id: string) => infer R ? R : never;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
}) => {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted/20 p-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="text-sm text-right">ID: {order.id.substring(0, 8)}</div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${order.customerPhone}`} className="text-primary">
                {order.customerPhone}
              </a>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${order.customerEmail}`} className="text-primary text-sm">
                {order.customerEmail}
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 pt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2-2c-.7-.6-1.7-1-3-1H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h1" />
              <path d="M9 17h6" />
              <circle cx="9" cy="17" r="2" />
              <circle cx="15" cy="17" r="2" />
            </svg>
            <span>
              {car ? `${car.brand} ${car.model}` : 'Автомобиль не найден'}
            </span>
          </div>
          
          {order.message && (
            <div className="text-sm border-t pt-2 mt-2 text-muted-foreground">
              <p>{order.message}</p>
            </div>
          )}
        </div>
        
        <div className="bg-muted/10 p-3 border-t">
          <div className="flex flex-wrap gap-2">
            {order.status === 'new' && (
              <Button 
                size="sm" 
                onClick={() => onStatusChange(order.id, 'processing')}
                className="flex-1"
              >
                В обработку
              </Button>
            )}
            {order.status === 'processing' && (
              <Button 
                size="sm" 
                variant="default" 
                className="bg-green-500 hover:bg-green-600 flex-1"
                onClick={() => onStatusChange(order.id, 'completed')}
              >
                Завершить
              </Button>
            )}
            {(order.status === 'new' || order.status === 'processing') && (
              <Button 
                size="sm" 
                variant="destructive"
                className="flex-1"
                onClick={() => onStatusChange(order.id, 'canceled')}
              >
                Отменить
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-none"
              onClick={() => onDeleteOrder(order.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminOrders: React.FC = () => {
  const { orders, getCarById, processOrder, syncOrders, deleteOrder } = useCars();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isSyncing, setIsSyncing] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth >= 768 ? 'table' : 'card');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
    
    const loadOrders = async () => {
      setIsSyncing(true);
      try {
        await syncOrders(false); // Загружаем заказы без уведомления
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setIsSyncing(false);
      }
    };
    
    loadOrders(); // Загружаем заказы при первой загрузке страницы
  }, [isAdmin, navigate, syncOrders]);

  if (!isAdmin) {
    return null;
  }

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      await syncOrders(true); // Явный запрос с уведомлением
      toast({
        title: "Синхронизация завершена",
        description: "Заказы успешно обновлены"
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка синхронизации",
        description: "Не удалось обновить заказы"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    processOrder(orderId, newStatus);
  };

  const confirmDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteOrder = () => {
    if (orderToDelete) {
      try {
        deleteOrder(orderToDelete);
        toast({
          title: "Заказ удален",
          description: "Заказ был успешно удален"
        });
      } catch (error) {
        console.error("Error deleting order:", error);
        toast({
          variant: "destructive",
          title: "Ошибка при удалении",
          description: "Не удалось удалить заказ"
        });
      }
      setOrderToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Управление заказами</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Список заказов</CardTitle>
            <Button 
              onClick={handleSyncOrders}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Нет заказов для отображения</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Управление заказами</h1>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-lg">Список заказов</CardTitle>
              <div className="text-xs text-muted-foreground">
                Всего заказов: {orders.length}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden sm:flex">
                <Button 
                  onClick={() => setViewMode('card')}
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-r-none"
                >
                  Карточки
                </Button>
                <Button 
                  onClick={() => setViewMode('table')}
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-l-none"
                >
                  Таблица
                </Button>
              </div>
              
              <Button 
                onClick={handleSyncOrders}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Обновить</span>
                <span className="inline sm:hidden">Обн.</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-4">
            {viewMode === 'card' ? (
              <div className="space-y-1">
                {orders.map((order) => {
                  const car = getCarById(order.carId);
                  return (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      car={car} 
                      onStatusChange={handleStatusChange} 
                      onDeleteOrder={confirmDeleteOrder}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead className="hidden sm:table-cell">Контакты</TableHead>
                      <TableHead>Автомобиль</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const car = getCarById(order.carId);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(order.createdAt), 'dd.MM.yy HH:mm', { locale: ru })}
                          </TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div>{order.customerPhone}</div>
                            <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                          </TableCell>
                          <TableCell>
                            {car ? `${car.brand} ${car.model}` : 'Не найден'}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end flex-wrap gap-1">
                              {order.status === 'new' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusChange(order.id, 'processing')}
                                  className="h-8 px-2"
                                >
                                  В обработку
                                </Button>
                              )}
                              {order.status === 'processing' && (
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="bg-green-500 hover:bg-green-600 h-8 px-2"
                                  onClick={() => handleStatusChange(order.id, 'completed')}
                                >
                                  Завершить
                                </Button>
                              )}
                              {(order.status === 'new' || order.status === 'processing') && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="h-8 px-2"
                                  onClick={() => handleStatusChange(order.id, 'canceled')}
                                >
                                  Отменить
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => confirmDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление заказа</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить заказ? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteOrder} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
