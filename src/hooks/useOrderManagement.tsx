
import { useState, useCallback, useEffect } from 'react';
import { Order } from '@/types/car';
import { useToast } from "@/hooks/use-toast";
import { apiAdapter } from '@/services/adapter';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const syncOrders = useCallback(async (showNotification = true) => {
    setLoading(true);
    try {
      console.info('Начало синхронизации заказов из БД...');
      
      // Используем API для загрузки заказов из БД
      const response = await apiAdapter.getOrders();
      
      if (Array.isArray(response)) {
        console.info(`Получено ${response.length} заказов из БД`);
        setOrders(response);
        
        if (showNotification) {
          toast({
            title: "Заказы обновлены",
            description: `Загружено заказов: ${response.length}`
          });
        }
        
        console.info('Синхронизация заказов успешно завершена');
        return response;
      } else {
        throw new Error('Ошибка при получении заказов');
      }
    } catch (error) {
      console.error('Ошибка при синхронизации заказов:', error);
      
      if (showNotification) {
        toast({
          variant: "destructive",
          title: "Ошибка синхронизации",
          description: "Не удалось синхронизировать заказы"
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const processOrder = useCallback(async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    try {
      // Вызываем API для обновления статуса заказа в БД
      const success = await apiAdapter.updateOrderStatus(orderId, newStatus);
      
      if (success) {
        // Обновляем локальный список заказов
        setOrders(current => 
          current.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        toast({
          title: "Статус заказа обновлен",
          description: `Заказ ${orderId.substring(0, 8)} помечен как "${newStatus}"`
        });
        
        return true;
      } else {
        throw new Error('Не удалось обновить статус заказа');
      }
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус заказа"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      // Вызываем API для удаления заказа из БД
      await apiAdapter.deleteOrder(orderId); // Предполагается, что такой метод есть или будет добавлен
      
      // Удаляем заказ из локального состояния
      setOrders(current => current.filter(order => order.id !== orderId));
      
      toast({
        title: "Заказ удален",
        description: `Заказ ${orderId.substring(0, 8)} успешно удален`
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить заказ"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createOrder = useCallback(async (order: Order) => {
    setLoading(true);
    try {
      console.log("Creating order:", order);
      
      // Используем API для сохранения заказа в БД
      const createdOrder = await apiAdapter.createOrder({
        carId: order.carId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        message: order.message
      });
      
      // Добавляем заказ в локальное состояние
      setOrders(current => [...current, createdOrder]);
      
      return true;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем заказы при первом рендере
  useEffect(() => {
    syncOrders(false);
  }, [syncOrders]);

  return {
    orders,
    loading,
    syncOrders,
    processOrder,
    deleteOrder,
    createOrder
  };
};
