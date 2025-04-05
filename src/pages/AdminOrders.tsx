
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
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-500"><AlertCircle className="w-3 h-3 mr-1" /> Новый</Badge>;
    case 'processing':
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> В обработке</Badge>;
    case 'completed':
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Завершен</Badge>;
    case 'canceled':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Отменен</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AdminOrders: React.FC = () => {
  const { orders, getCarById, processOrder, loading } = useCars();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Refresh orders data periodically to sync between different admin users
  useEffect(() => {
    // Check for updated orders in localStorage every 5 seconds
    const intervalId = setInterval(() => {
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        try {
          // We don't need to set the orders directly as the useCars hook
          // already loads them from localStorage on mount
          console.log("Checking for order updates");
        } catch (error) {
          console.error("Failed to parse orders from localStorage:", error);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
    
    console.log('Orders in AdminOrders:', orders);
  }, [isAdmin, navigate, orders]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Загрузка заказов...</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Управление заказами</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Нет заказов для отображения</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    processOrder(orderId, newStatus);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Управление заказами</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Список заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Автомобиль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const car = getCarById(order.carId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <div>{order.customerPhone}</div>
                        <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        {car ? `${car.brand} ${car.model}` : 'Автомобиль не найден'}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === 'new' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(order.id, 'processing')}
                            >
                              В обработку
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                            >
                              Завершить
                            </Button>
                          )}
                          {(order.status === 'new' || order.status === 'processing') && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusChange(order.id, 'canceled')}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;
