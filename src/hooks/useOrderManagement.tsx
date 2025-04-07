
import { useCars as useGlobalCars } from "../contexts/CarsContext";
import { Order } from "../types/car";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const API_BASE_URL = '/api';

export const useOrderManagement = () => {
  const {
    getCarById,
    orders,
    syncOrders: contextSyncOrders,
    processOrder: contextProcessOrder
  } = useGlobalCars();
  
  const { toast } = useToast();

  const getOrderCreationDate = (order: Order) => {
    try {
      return format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch (error) {
      console.error('Error formatting order date:', error);
      return 'Неизвестно';
    }
  };

  const fetchOrdersFromServer = async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders.php`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('Ошибка получения заказов с сервера:', result.message || 'Неизвестная ошибка');
        return [];
      }
    } catch (error) {
      console.error('Ошибка при запросе заказов с сервера:', error);
      return [];
    }
  };

  const serverSyncOrders = async (): Promise<boolean> => {
    try {
      console.log('Начало синхронизации заказов с сервером');
      
      const serverOrders = await fetchOrdersFromServer();
      console.log(`Получено ${serverOrders.length} заказов с сервера`);
      
      if (serverOrders.length > 0) {
        // Теперь мы обновляем контекст через contextSyncOrders
        // вместо localStorage
        contextSyncOrders(serverOrders);
        console.log('Заказы успешно синхронизированы с сервером');
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка синхронизации заказов с сервером:', error);
      return false;
    }
  };

  const updateOrderStatusOnServer = async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_order_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Статус заказа ${orderId} обновлен на сервере до ${status}`);
        return true;
      } else {
        console.error('Ошибка обновления статуса заказа на сервере:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Ошибка запроса к серверу при обновлении статуса заказа:', error);
      return false;
    }
  };

  const createOrder = async (order: Order): Promise<boolean> => {
    try {
      console.log(`Начало создания заказа ${order.id}`);
      
      const apiUrl = `${API_BASE_URL}/create_order.php`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Заказ ${order.id} успешно создан на сервере`);
        
        // После успешного создания заказа на сервере, синхронизируем заказы
        await serverSyncOrders();
        
        return true;
      } else {
        throw new Error(result.message || 'Ошибка при создании заказа на сервере');
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка создания заказа",
        description: "Не удалось создать заказ. Пожалуйста, попробуйте позже."
      });
      
      return false;
    }
  };

  const processOrderWithServer = async (orderId: string, newStatus: Order['status']): Promise<boolean> => {
    try {
      const serverUpdateSuccess = await updateOrderStatusOnServer(orderId, newStatus);
      
      if (serverUpdateSuccess) {
        // Execute without checking return value since it's void
        contextProcessOrder(orderId, newStatus);
        
        toast({
          title: "Статус заказа обновлен",
          description: `Заказ #${orderId.substring(0, 8)} теперь в статусе "${newStatus}"`
        });
        
        return true;
      } else {
        contextProcessOrder(orderId, newStatus);
        
        toast({
          variant: "destructive",
          title: "Синхронизация не выполнена",
          description: "Статус заказа обновлен локально, но не на сервере"
        });
        
        return false;
      }
    } catch (error) {
      console.error("Ошибка при обработке заказа:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка обновления статуса",
        description: "Не удалось обновить статус заказа"
      });
      
      return false;
    }
  };

  const exportOrdersToCsv = () => {
    if (!orders || orders.length === 0) {
      return '';
    }

    const headers = [
      'ID', 'Дата создания', 'Статус', 'Имя клиента', 
      'Телефон', 'Email', 'ID автомобиля', 'Марка', 'Модель', 'Синхронизация', 'JSON файл'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const order of orders) {
      const car = getCarById(order.carId);
      const row = [
        order.id,
        getOrderCreationDate(order),
        order.status,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.carId,
        car ? car.brand : 'Н/Д',
        car ? car.model : 'Н/Д',
        order.syncStatus || 'Н/Д',
        order.jsonFilePath || 'Н/Д'
      ];
      
      const escapedRow = row.map(value => {
        const strValue = String(value).replace(/"/g, '""');
        return value.includes(',') || value.includes('"') || value.includes('\n') 
          ? `"${strValue}"` 
          : strValue;
      });
      
      csvRows.push(escapedRow.join(','));
    }
    
    return csvRows.join('\n');
  };
  
  const syncOrders = async (): Promise<boolean> => {
    try {
      const success = await serverSyncOrders();
      
      if (success) {
        toast({
          title: "Синхронизация завершена",
          description: "Заказы успешно синхронизированы с сервером"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка синхронизации",
          description: "Не удалось синхронизировать заказы с сервером"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Ошибка синхронизации заказов:", error);
      toast({
        variant: "destructive",
        title: "Ошибка синхронизации",
        description: "Не удалось синхронизировать заказы"
      });
      return false;
    }
  };

  return {
    orders,
    getOrders: () => orders,
    createOrder,
    processOrder: processOrderWithServer,
    exportOrdersToCsv,
    getOrderCreationDate,
    syncOrders,
    fetchOrdersFromServer
  };
};
