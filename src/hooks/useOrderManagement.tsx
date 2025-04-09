
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
        
        // Сортируем заказы по дате (новые сверху)
        const sortedOrders = [...response].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setOrders(sortedOrders);
        
        if (showNotification) {
          toast({
            title: "Заказы обновлены",
            description: `Загружено заказов: ${sortedOrders.length}`
          });
        }
        
        console.info('Синхронизация заказов успешно завершена');
        return sortedOrders;
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
      console.log(`Обработка заказа ${orderId}, новый статус: ${newStatus}`);
      
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
      console.log(`Удаление заказа ${orderId}`);
      
      // Вызываем API для удаления заказа из БД
      const success = await apiAdapter.deleteOrder(orderId);
      
      if (success) {
        // Удаляем заказ из локального состояния
        setOrders(current => current.filter(order => order.id !== orderId));
        
        toast({
          title: "Заказ удален",
          description: `Заказ ${orderId.substring(0, 8)} успешно удален`
        });
        
        return true;
      } else {
        throw new Error('Не удалось удалить заказ');
      }
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

  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    setLoading(true);
    try {
      console.log("Creating order:", orderData);
      
      // Используем API для сохранения заказа в БД
      const createdOrder = await apiAdapter.createOrder(orderData);
      
      // Добавляем заказ в локальное состояние
      setOrders(current => [createdOrder, ...current]);
      
      toast({
        title: "Заказ создан",
        description: "Новый заказ успешно создан"
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать заказ"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
