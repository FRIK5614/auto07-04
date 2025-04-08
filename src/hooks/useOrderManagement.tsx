
import { useState, useCallback } from 'react';
import { Order } from '@/types/car';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/services/api';

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const syncOrders = useCallback(async (showNotification = true) => {
    setLoading(true);
    try {
      console.info('Начало синхронизации заказов с JSON...');
      const response = await api.get('/get_orders.php');
      
      if (response.success && Array.isArray(response.orders)) {
        console.info(`Получено ${response.orders.length} заказов из JSON-файлов`);
        setOrders(response.orders);
        
        if (showNotification) {
          toast({
            title: "Заказы обновлены",
            description: `Загружено заказов: ${response.orders.length}`
          });
        }
        
        console.info('Синхронизация заказов успешно завершена');
        return response.orders;
      } else {
        throw new Error(response.message || 'Ошибка при получении заказов');
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
      const response = await api.post('/update_order_status.php', {
        orderId,
        status: newStatus
      });
      
      if (response.success) {
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
        throw new Error(response.message || 'Не удалось обновить статус заказа');
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

  // New function to delete an order
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

  return {
    orders,
    loading,
    syncOrders,
    processOrder,
    deleteOrder
  };
};
