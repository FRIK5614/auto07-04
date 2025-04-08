
import { useState, useCallback } from 'react';
import { Order } from '@/types/car';
import { useToast } from "@/hooks/use-toast";
import * as apiService from '@/services/api';
import { useTelegramNotifications } from '@/hooks/useTelegramNotifications';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { notifyNewOrder } = useTelegramNotifications();

  const syncOrders = useCallback(async (showNotification = true) => {
    setLoading(true);
    try {
      console.info('Начало синхронизации заказов с базой данных...');
      const response = await apiService.loadOrders();
      
      if (Array.isArray(response)) {
        console.info(`Получено ${response.length} заказов из базы данных`);
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
      // Вызываем API для обновления статуса в базе данных
      const success = await apiService.updateOrderStatus(orderId, newStatus);
      
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
      // В реальном приложении здесь будет вызов API для удаления заказа из базы данных
      // const success = await apiService.deleteOrder(orderId);
      
      // Пока API для удаления не реализовано, удаляем только из локального состояния
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
      console.log("Создание заказа:", order);
      
      // Создаем заказ в базе данных через API
      const orderId = await apiService.createOrder(order);
      
      // Добавляем заказ в локальное состояние
      const newOrder = {
        ...order,
        id: orderId,
        syncStatus: 'synced' as const
      };
      
      setOrders(current => [...current, newOrder]);
      
      // Отправляем уведомление в Telegram
      await notifyNewOrder(newOrder);
      
      toast({
        title: "Заказ создан",
        description: "Заказ успешно создан и сохранен в базе данных"
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
  }, [notifyNewOrder, toast]);

  return {
    orders,
    loading,
    syncOrders,
    processOrder,
    deleteOrder,
    createOrder
  };
};
