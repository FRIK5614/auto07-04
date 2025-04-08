
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
      console.info('Начало синхронизации заказов с JSON...');
      const response = await apiService.loadOrdersFromJson();
      
      if (Array.isArray(response)) {
        console.info(`Получено ${response.length} заказов из JSON-файлов`);
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
      // For now, we'll just update the order locally
      // In a real implementation, we would call the API
      
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

  // Function to delete an order
  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      // Since we don't have a backend endpoint for deletion, we'll handle it client-side
      // In a real app, you'd make an API call to delete the order
      
      // Remove the order from the local state
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
      // Save the order to JSON
      const jsonFilePath = await apiService.saveOrderToJson(order);
      console.log("Order saved to JSON, path:", jsonFilePath);
      
      // Update the order with the JSON file path
      const updatedOrder = {
        ...order,
        jsonFilePath,
        syncStatus: 'synced' as const
      };
      
      // Add the order to the local state
      setOrders(current => [...current, updatedOrder]);
      
      // Отправляем уведомление в Telegram
      await notifyNewOrder(updatedOrder);
      
      return true;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [notifyNewOrder]);

  return {
    orders,
    loading,
    syncOrders,
    processOrder,
    deleteOrder,
    createOrder
  };
};
