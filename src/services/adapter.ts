
// Здесь содержатся адаптеры для работы с внешними API

import { Car } from '../types/car';
import { Order } from '../types/car';

const BASE_API_URL = 'https://metallika29.ru/public/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const apiAdapter = {
  // ПОЛУЧЕНИЕ СПИСКА АВТОМОБИЛЕЙ
  async getCars(): Promise<Car[]> {
    try {
      console.log('Fetching cars from API...');
      const response = await fetch(`${BASE_API_URL}/cars/get_cars.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Car[]> = await response.json();
      
      if (!result.success) {
        console.error('API Error:', result.message);
        throw new Error(result.message || 'Ошибка при получении автомобилей');
      }
      
      console.log(`Loaded ${result.data?.length || 0} cars from API`);
      return result.data || [];
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  },

  // ПОЛУЧЕНИЕ ОТДЕЛЬНОГО АВТОМОБИЛЯ ПО ID
  async getCarById(carId: string): Promise<Car> {
    try {
      const cars = await this.getCars();
      const car = cars.find(c => c.id === carId);
      
      if (!car) {
        throw new Error(`Автомобиль с ID ${carId} не найден`);
      }
      
      return car;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      throw error;
    }
  },

  // ДОБАВЛЕНИЕ НОВОГО АВТОМОБИЛЯ
  async addCar(car: Car): Promise<Car> {
    try {
      console.log('Adding new car to API:', car);
      const response = await fetch(`${BASE_API_URL}/cars/add_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<{carId: string}> = await response.json();
      
      if (!result.success) {
        console.error('API Error when adding car:', result.message);
        throw new Error(result.message || 'Ошибка при добавлении автомобиля');
      }
      
      console.log('Car added successfully:', result);
      return car;
    } catch (error) {
      console.error('API add car error:', error);
      throw error;
    }
  },

  // ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕГО АВТОМОБИЛЯ
  async updateCar(car: Car): Promise<Car> {
    try {
      console.log('Updating car in API:', car);
      const response = await fetch(`${BASE_API_URL}/cars/update_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<{carId: string}> = await response.json();
      
      if (!result.success) {
        console.error('API Error when updating car:', result.message);
        throw new Error(result.message || 'Ошибка при обновлении автомобиля');
      }
      
      console.log('Car updated successfully:', result);
      return car;
    } catch (error) {
      console.error('API update car error:', error);
      throw error;
    }
  },

  // УДАЛЕНИЕ АВТОМОБИЛЯ
  async deleteCar(carId: string): Promise<boolean> {
    try {
      console.log('Deleting car from API:', carId);
      const response = await fetch(`${BASE_API_URL}/cars/delete_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: carId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<{carId: string}> = await response.json();
      
      if (!result.success) {
        console.error('API Error when deleting car:', result.message);
        throw new Error(result.message || 'Ошибка при удалении автомобиля');
      }
      
      console.log('Car deleted successfully:', result);
      return true;
    } catch (error) {
      console.error('API delete car error:', error);
      throw error;
    }
  },

  // ОТСЛЕЖИВАНИЕ ПРОСМОТРА АВТОМОБИЛЯ
  async viewCar(carId: string): Promise<void> {
    try {
      console.log('Logging car view in API:', carId);
      await fetch(`${BASE_API_URL}/cars/view.php?id=${carId}`);
    } catch (error) {
      console.error('Error logging car view:', error);
      // Не выбрасываем исключение, так как эта ошибка не должна блокировать просмотр
    }
  },

  // СОЗДАНИЕ ЗАКАЗА
  async createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    try {
      console.log('Creating order in API:', order);
      const response = await fetch(`${BASE_API_URL}/create_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка при создании заказа');
      }
      
      return result.data;
    } catch (error) {
      console.error('API create order error:', error);
      throw error;
    }
  },

  // ПОЛУЧЕНИЕ СПИСКА ЗАКАЗОВ
  async getOrders(): Promise<Order[]> {
    try {
      console.log('Fetching orders from API...');
      const response = await fetch(`${BASE_API_URL}/get_orders.php`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка при получении заказов');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('API get orders error:', error);
      throw error;
    }
  },

  // ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА
  async updateOrderStatus(orderId: string, status: 'new' | 'processing' | 'completed' | 'canceled'): Promise<boolean> {
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      const response = await fetch(`${BASE_API_URL}/update_order_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка при обновлении статуса заказа');
      }
      
      return true;
    } catch (error) {
      console.error('API update order status error:', error);
      throw error;
    }
  },
};
