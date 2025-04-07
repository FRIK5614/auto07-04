
import { Car, Order } from "../types/car";

const API_BASE_URL = '/api';

// Интерфейс для адаптера API
interface ApiAdapter {
  // Автомобили
  getCars: () => Promise<Car[]>;
  getCarById: (id: string) => Promise<Car | null>;
  addCar: (car: Car) => Promise<boolean>;
  updateCar: (car: Car) => Promise<boolean>;
  deleteCar: (id: string) => Promise<boolean>;
  viewCar: (id: string) => Promise<number>;
  
  // Заказы
  getOrders: () => Promise<Order[]>;
  createOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<boolean>;
  
  // Избранное и сравнение
  getFavorites: (userId?: string) => Promise<{ carIds: string[], cars: Car[] }>;
  updateFavorite: (carId: string, action: 'add' | 'remove' | 'toggle', userId?: string) => Promise<boolean>;
  getComparisons: (userId?: string) => Promise<{ carIds: string[], cars: Car[] }>;
  updateComparison: (carId: string, action: 'add' | 'remove' | 'toggle', userId?: string) => Promise<boolean>;
  
  // Изображения
  uploadImage: (file: File, carId?: string) => Promise<{ url: string, filename: string } | null>;
  assignImageToCar: (carId: string, imageUrl: string, alt?: string) => Promise<boolean>;
  
  // Импорт
  importCarsFromTmcAvto: (cars: any[]) => Promise<{ imported: number, errors: string[] }>;
}

// Реализация адаптера для PHP API
const phpApiAdapter: ApiAdapter = {
  // ===== Автомобили =====
  getCars: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/get_cars.php`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('Ошибка получения автомобилей:', result.message || 'Неизвестная ошибка');
        return [];
      }
    } catch (error) {
      console.error('Ошибка при запросе автомобилей:', error);
      return [];
    }
  },
  
  getCarById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/get_cars.php?id=${id}`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        return result.data[0];
      } else {
        console.error('Автомобиль не найден:', result.message || 'Неизвестная ошибка');
        return null;
      }
    } catch (error) {
      console.error('Ошибка при запросе автомобиля:', error);
      return null;
    }
  },
  
  addCar: async (car: Car) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/add_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка добавления автомобиля:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе добавления автомобиля:', error);
      return false;
    }
  },
  
  updateCar: async (car: Car) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/update_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка обновления автомобиля:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе обновления автомобиля:', error);
      return false;
    }
  },
  
  deleteCar: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/delete_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка удаления автомобиля:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе удаления автомобиля:', error);
      return false;
    }
  },
  
  viewCar: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/view.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId: id }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data && typeof result.data.viewCount === 'number') {
        return result.data.viewCount;
      } else {
        console.error('Ошибка при регистрации просмотра автомобиля:', result.message || 'Неизвестная ошибка');
        return 0;
      }
    } catch (error) {
      console.error('Ошибка при запросе регистрации просмотра автомобиля:', error);
      return 0;
    }
  },
  
  // ===== Заказы =====
  getOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders.php`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('Ошибка получения заказов:', result.message || 'Неизвестная ошибка');
        return [];
      }
    } catch (error) {
      console.error('Ошибка при запросе заказов:', error);
      return [];
    }
  },
  
  createOrder: async (order: Order) => {
    try {
      const response = await fetch(`${API_BASE_URL}/create_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка создания заказа:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе создания заказа:', error);
      return false;
    }
  },
  
  updateOrderStatus: async (id: string, status: Order['status']) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_order_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка обновления статуса заказа:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе обновления статуса заказа:', error);
      return false;
    }
  },
  
  // ===== Избранное и сравнение =====
  getFavorites: async (userId?: string) => {
    try {
      const url = userId ? `${API_BASE_URL}/users/favorites.php?userId=${userId}` : `${API_BASE_URL}/users/favorites.php`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('Ошибка получения избранных автомобилей:', result.message || 'Неизвестная ошибка');
        return { carIds: [], cars: [] };
      }
    } catch (error) {
      console.error('Ошибка при запросе избранных автомобилей:', error);
      return { carIds: [], cars: [] };
    }
  },
  
  updateFavorite: async (carId: string, action: 'add' | 'remove' | 'toggle', userId?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/favorites.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId, action, userId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка обновления избранного:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе обновления избранного:', error);
      return false;
    }
  },
  
  getComparisons: async (userId?: string) => {
    try {
      const url = userId ? `${API_BASE_URL}/users/compare.php?userId=${userId}` : `${API_BASE_URL}/users/compare.php`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('Ошибка получения автомобилей для сравнения:', result.message || 'Неизвестная ошибка');
        return { carIds: [], cars: [] };
      }
    } catch (error) {
      console.error('Ошибка при запросе автомобилей для сравнения:', error);
      return { carIds: [], cars: [] };
    }
  },
  
  updateComparison: async (carId: string, action: 'add' | 'remove' | 'toggle', userId?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/compare.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId, action, userId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка обновления сравнения:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе обновления сравнения:', error);
      return false;
    }
  },
  
  // ===== Изображения =====
  uploadImage: async (file: File, carId?: string) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      if (carId) {
        formData.append('carId', carId);
      }
      
      const response = await fetch(`${API_BASE_URL}/images/upload.php`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          url: result.data.url,
          filename: result.data.filename,
        };
      } else {
        console.error('Ошибка загрузки изображения:', result.message || 'Неизвестная ошибка');
        return null;
      }
    } catch (error) {
      console.error('Ошибка при запросе загрузки изображения:', error);
      return null;
    }
  },
  
  assignImageToCar: async (carId: string, imageUrl: string, alt?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/assign_to_car.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId, imageUrl, alt }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Ошибка привязки изображения к автомобилю:', result.message || 'Неизвестная ошибка');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при запросе привязки изображения к автомобилю:', error);
      return false;
    }
  },
  
  // ===== Импорт =====
  importCarsFromTmcAvto: async (cars: any[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/import/tmcavto.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cars }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          imported: result.data.imported,
          errors: result.data.errors,
        };
      } else {
        console.error('Ошибка импорта автомобилей из TMC Avto:', result.message || 'Неизвестная ошибка');
        return { imported: 0, errors: [result.message || 'Неизвестная ошибка'] };
      }
    } catch (error) {
      console.error('Ошибка при запросе импорта автомобилей из TMC Avto:', error);
      return { imported: 0, errors: [(error as Error).message] };
    }
  },
};

// По умолчанию используем PHP API адаптер
export const apiAdapter: ApiAdapter = phpApiAdapter;
