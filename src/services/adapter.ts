
// Здесь содержатся адаптеры для работы с внешними API

import { Car } from '../types/car';
import { Order } from '../types/car';

const BASE_API_URL = 'https://metallika29.ru/public/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  trace?: string;
}

export const apiAdapter = {
  // ПОЛУЧЕНИЕ СПИСКА АВТОМОБИЛЕЙ
  async getCars(): Promise<Car[]> {
    try {
      console.log('Fetching cars from API...');
      
      // Добавляем случайный параметр для предотвращения кэширования
      const timestamp = new Date().getTime();
      const response = await fetch(`${BASE_API_URL}/cars/get_cars.php?t=${timestamp}`);
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${text}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<Car[]> = await response.json();
      
      if (!result.success) {
        console.error('API Error:', result.message);
        if (result.trace) {
          console.error('API Error trace:', result.trace);
        }
        throw new Error(result.message || 'Ошибка при получении автомобилей');
      }
      
      if (!result.data || !Array.isArray(result.data)) {
        console.error('Invalid data format received:', result);
        throw new Error('Некорректный формат данных от API');
      }
      
      // Убедимся, что все автомобили имеют статус и id
      const carsWithStatus = result.data.map(car => ({
        ...car,
        id: car.id || crypto.randomUUID(),
        status: car.status || 'published'
      }));
      
      console.log(`Loaded ${carsWithStatus.length} cars from API`);
      
      // Дополнительная проверка структуры данных
      for (const car of carsWithStatus) {
        if (!car.price || typeof car.price !== 'object') {
          car.price = { base: 0 };
        }
        
        if (!car.images || !Array.isArray(car.images)) {
          car.images = [];
        }
      }
      
      return carsWithStatus;
    } catch (error) {
      console.error('API fetch error:', error);
      
      // Возвращаем пустой массив вместо выбрасывания исключения для более стабильной работы UI
      return [];
    }
  },

  // ПОЛУЧЕНИЕ ОТДЕЛЬНОГО АВТОМОБИЛЯ ПО ID
  async getCarById(carId: string): Promise<Car | null> {
    try {
      console.log(`Fetching car with ID ${carId} from API...`);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`${BASE_API_URL}/cars/get_car_by_id.php?id=${carId}&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || `Автомобиль с ID ${carId} не найден`);
      }
      
      if (!result.data) {
        throw new Error(`Нет данных для автомобиля с ID ${carId}`);
      }
      
      // Обеспечим наличие всех необходимых полей
      const car = {
        ...result.data,
        status: result.data.status || 'published',
        images: Array.isArray(result.data.images) ? result.data.images : []
      };
      
      return car;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      
      // Если API не реализован, попробуем получить из списка всех автомобилей
      try {
        const cars = await this.getCars();
        const car = cars.find(c => c.id === carId);
        
        if (!car) {
          console.log(`Car with ID ${carId} not found in the list of all cars`);
          return null;
        }
        
        return car;
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return null;
      }
    }
  },

  // ДОБАВЛЕНИЕ НОВОГО АВТОМОБИЛЯ
  async addCar(car: Car): Promise<Car> {
    try {
      console.log('Adding new car to API:', car);
      
      // Генерируем UUID если его нет
      if (!car.id) {
        car.id = crypto.randomUUID();
      }
      
      // Устанавливаем статус если его нет
      if (!car.status) {
        car.status = 'published';
      }
      
      // Убедимся, что все необходимые поля существуют
      const carToSend = {
        ...car,
        price: car.price || { base: 0 },
        images: car.images || [],
        features: car.features || []
      };
      
      const response = await fetch(`${BASE_API_URL}/cars/add_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carToSend),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<Car> = await response.json();
      
      if (!result.success) {
        console.error('API Error when adding car:', result.message);
        if (result.trace) {
          console.error('API Error trace:', result.trace);
        }
        throw new Error(result.message || 'Ошибка при добавлении автомобиля');
      }
      
      console.log('Car added successfully:', result);
      
      // Возвращаем автомобиль, который был добавлен (с возможными обновлениями с сервера)
      return result.data || car;
    } catch (error) {
      console.error('API add car error:', error);
      throw error;
    }
  },

  // ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕГО АВТОМОБИЛЯ
  async updateCar(car: Car): Promise<Car> {
    try {
      console.log('Updating car in API:', car);
      
      // Устанавливаем статус если его нет
      if (!car.status) {
        car.status = 'published';
      }
      
      const response = await fetch(`${BASE_API_URL}/cars/update_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<{carId: string}> = await response.json();
      
      if (!result.success) {
        console.error('API Error when updating car:', result.message);
        if (result.trace) {
          console.error('API Error trace:', result.trace);
        }
        throw new Error(result.message || 'Ошибка при обновлении автомобиля');
      }
      
      console.log('Car updated successfully:', result);
      // Возвращаем обновленный автомобиль
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
        console.error(`HTTP error! status: ${response.status}, ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      const result: ApiResponse<{carId: string}> = await response.json();
      
      if (!result.success) {
        console.error('API Error when deleting car:', result.message);
        if (result.trace) {
          console.error('API Error trace:', result.trace);
        }
        throw new Error(result.message || 'Ошибка при удалении автомобиля');
      }
      
      console.log('Car deleted successfully:', result);
      return true;
    } catch (error) {
      console.error('API delete car error:', error);
      throw error;
    }
  },

  // УДАЛЕНИЕ ЗАКАЗА
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      console.log(`Deleting order ${orderId}`);
      const response = await fetch(`${BASE_API_URL}/delete_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId }),
      });
      
      if (!response.ok) {
        console.warn(`API endpoint for deleting orders returned status: ${response.status}`);
        return false;
      }
      
      try {
        const result = await response.json();
        return result.success || false;
      } catch (e) {
        console.error('Error parsing delete order response:', e);
        return false;
      }
    } catch (error) {
      console.error('API delete order error:', error);
      return false;
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка при создании заказа');
      }
      
      if (!result.data) {
        // Если API не вернул данные, создаем новый заказ локально
        const newOrder: Order = {
          id: crypto.randomUUID(),
          status: 'new',
          createdAt: new Date().toISOString(),
          ...order
        };
        return newOrder;
      }
      
      return result.data;
    } catch (error) {
      console.error('API create order error:', error);
      
      // В случае ошибки создаем локальный заказ для корректной работы UI
      const newOrder: Order = {
        id: crypto.randomUUID(),
        status: 'new',
        createdAt: new Date().toISOString(),
        ...order
      };
      return newOrder;
    }
  },

  // ПОЛУЧЕНИЕ СПИСКА ЗАКАЗОВ
  async getOrders(): Promise<Order[]> {
    try {
      console.log('Fetching orders from API...');
      
      // Добавляем случайный параметр для предотвращения кэширования
      const timestamp = new Date().getTime();
      const response = await fetch(`${BASE_API_URL}/get_orders.php?t=${timestamp}`);
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`HTTP error when fetching orders! Status: ${response.status}, Response: ${text}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('API Error when getting orders:', result.message);
        throw new Error(result.message || 'Ошибка при получении заказов');
      }
      
      if (!result.data) {
        console.warn('API returned no orders data');
        return [];
      }
      
      console.log(`Loaded ${result.data.length || 0} orders from API`);
      return result.data || [];
    } catch (error) {
      console.error('API get orders error:', error);
      // Возвращаем пустой массив вместо выбрасывания исключения
      return [];
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
      
      if (!response.ok) {
        console.warn(`API endpoint for updating order status returned status: ${response.status}`);
        return false;
      }
      
      try {
        const result = await response.json();
        return result.success || false;
      } catch (e) {
        console.error('Error parsing update order status response:', e);
        return false;
      }
    } catch (error) {
      console.error('API update order status error:', error);
      return false;
    }
  },

  // ЗАГРУЗКА ИЗОБРАЖЕНИЯ
  async uploadImage(file: File, carId?: string): Promise<{ url: string; id: string; isMain: boolean }> {
    try {
      console.log('Uploading image for car', carId);
      
      const formData = new FormData();
      formData.append('image', file);
      
      if (carId) {
        formData.append('carId', carId);
      }
      
      const response = await fetch(`${BASE_API_URL}/images/upload.php`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`HTTP error when uploading image! Status: ${response.status}, Response: ${text}`);
        throw new Error(`HTTP error! status: ${response.status}, ${text}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('API Error when uploading image:', result.message);
        throw new Error(result.message || 'Ошибка при загрузке изображения');
      }
      
      console.log('Image uploaded successfully:', result);
      
      if (!result.data) {
        throw new Error('API did not return image data');
      }
      
      return {
        url: result.data.url,
        id: result.data.id,
        isMain: result.data.isMain || false
      };
    } catch (error) {
      console.error('API upload image error:', error);
      throw error;
    }
  }
};
