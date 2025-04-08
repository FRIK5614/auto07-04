
import { Car, Order } from '../types/car';

// Базовый URL для API
const BASE_URL = 'https://catalog.tmcavto.ru';

// API URL для работы с базой данных
const API_URL = '/api';

// URL для загрузки изображений
const IMAGE_STORAGE_PREFIX = '/car/image/';

/**
 * Получение данных о всех автомобилях из MySQL базы данных
 */
export const fetchAllCars = async (): Promise<Car[]> => {
  try {
    console.log('[API] Запрос всех автомобилей из базы данных');
    
    const response = await fetch(`${API_URL}/cars/get_cars.php`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка получения данных');
    }
    
    console.log(`[API] Получено ${result.data.length} автомобилей из базы`);
    return result.data;
  } catch (error) {
    console.error("Ошибка при получении данных об автомобилях:", error);
    throw new Error("Не удалось загрузить данные об автомобилях");
  }
};

/**
 * Получение детальной информации об автомобиле по ID из MySQL
 */
export const fetchCarById = async (id: string): Promise<Car | null> => {
  try {
    console.log(`[API] Запрос автомобиля с ID ${id} из базы данных`);
    
    const response = await fetch(`${API_URL}/cars/get_cars.php?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      console.log(`[API] Автомобиль с ID ${id} не найден`);
      return null;
    }
    
    console.log(`[API] Получены данные об автомобиле: ${result.data[0].brand} ${result.data[0].model}`);
    return result.data[0];
  } catch (error) {
    console.error(`Ошибка при получении данных об автомобиле с ID ${id}:`, error);
    throw new Error("Не удалось загрузить данные об автомобиле");
  }
};

/**
 * Загрузка изображения на сервер
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    console.log(`[API] Загрузка файла на сервер: ${file.name}`);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/cars/upload_image.php`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка загрузки изображения');
    }
    
    console.log(`[API] Файл успешно загружен: ${result.data.url}`);
    return result.data.url;
  } catch (error) {
    console.error("Ошибка при загрузке изображения:", error);
    throw new Error("Не удалось загрузить изображение");
  }
};

/**
 * Присвоение изображения автомобилю
 */
export const assignImageToCar = async (carId: string, imagePath: string, alt?: string): Promise<boolean> => {
  try {
    console.log(`[API] Присвоение изображения ${imagePath} автомобилю ${carId}`);
    
    const response = await fetch(`${API_URL}/cars/assign_image.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        carId,
        imageUrl: imagePath,
        alt: alt || 'Изображение автомобиля'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка присвоения изображения');
    }
    
    console.log(`[API] Изображение успешно присвоено автомобилю ${carId}`);
    return true;
  } catch (error) {
    console.error("Ошибка при присвоении изображения автомобилю:", error);
    return false;
  }
};

/**
 * Поиск автомобилей по параметрам
 */
export const searchCars = async (searchParams: Record<string, any>): Promise<Car[]> => {
  try {
    console.log(`[API] Поиск автомобилей с параметрами:`, searchParams);
    
    // Формируем строку запроса из параметров
    const queryParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${API_URL}/cars/get_cars.php?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка поиска автомобилей');
    }
    
    console.log(`[API] Найдено ${result.data.length} автомобилей`);
    return result.data;
  } catch (error) {
    console.error("Ошибка при поиске автомобилей:", error);
    throw new Error("Не удалось выполнить поиск автомобилей");
  }
};

/**
 * Получение списка доступных брендов
 */
export const fetchBrands = async (): Promise<string[]> => {
  try {
    console.log(`[API] Запрос списка брендов из базы данных`);
    
    const response = await fetch(`${API_URL}/brands/get_brands.php`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка получения списка брендов');
    }
    
    console.log(`[API] Получено ${result.data.length} брендов`);
    return result.data;
  } catch (error) {
    console.error("Ошибка при получении списка брендов:", error);
    throw new Error("Не удалось загрузить список брендов");
  }
};

/**
 * Отправка заявки на покупку
 */
export const submitPurchaseRequest = async (formData: Record<string, any>): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[API] Отправка заявки на покупку:`, formData);
    
    const response = await fetch(`${API_URL}/orders/create_order.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[API] Результат отправки заявки:`, result);
    
    return {
      success: result.success,
      message: result.message || (result.success 
        ? "Ваша заявка успешно отправлена. Наш менеджер свяжется с вами в ближайшее время."
        : "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.")
    };
  } catch (error) {
    console.error("Ошибка при отправке заявки:", error);
    return {
      success: false,
      message: "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже."
    };
  }
};

/**
 * Добавление нового автомобиля в базу данных
 */
export const addCar = async (car: Car): Promise<{ success: boolean; message: string; carId?: string }> => {
  try {
    console.log(`[API] Добавление нового автомобиля:`, car);
    
    const response = await fetch(`${API_URL}/cars/add_car.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[API] Результат добавления автомобиля:`, result);
    
    return {
      success: result.success,
      message: result.message || (result.success 
        ? "Автомобиль успешно добавлен в базу данных"
        : "Произошла ошибка при добавлении автомобиля"),
      carId: result.carId
    };
  } catch (error) {
    console.error("Ошибка при добавлении автомобиля:", error);
    return {
      success: false,
      message: "Произошла ошибка при добавлении автомобиля"
    };
  }
};

/**
 * Обновление информации об автомобиле
 */
export const updateCar = async (car: Car): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[API] Обновление информации об автомобиле с ID ${car.id}:`, car);
    
    const response = await fetch(`${API_URL}/cars/update_car.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[API] Результат обновления автомобиля:`, result);
    
    return {
      success: result.success,
      message: result.message || (result.success 
        ? "Информация об автомобиле успешно обновлена"
        : "Произошла ошибка при обновлении информации об автомобиле")
    };
  } catch (error) {
    console.error("Ошибка при обновлении автомобиля:", error);
    return {
      success: false,
      message: "Произошла ошибка при обновлении информации об автомобиле"
    };
  }
};

/**
 * Удаление автомобиля из базы данных
 */
export const deleteCar = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[API] Удаление автомобиля с ID ${id}`);
    
    const response = await fetch(`${API_URL}/cars/delete_car.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[API] Результат удаления автомобиля:`, result);
    
    return {
      success: result.success,
      message: result.message || (result.success 
        ? "Автомобиль успешно удален из базы данных"
        : "Произошла ошибка при удалении автомобиля")
    };
  } catch (error) {
    console.error("Ошибка при удалении автомобиля:", error);
    return {
      success: false,
      message: "Произошла ошибка при удалении автомобиля"
    };
  }
};

/**
 * Регистрация просмотра автомобиля
 */
export const viewCar = async (id: string, userId?: string): Promise<number> => {
  try {
    console.log(`[API] Регистрация просмотра автомобиля с ID ${id}`);
    
    const response = await fetch(`${API_URL}/cars/view.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        carId: id,
        userId: userId || 'anonymous'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка регистрации просмотра');
    }
    
    console.log(`[API] Просмотр зарегистрирован, новое количество просмотров: ${result.data.viewCount}`);
    return result.data.viewCount;
  } catch (error) {
    console.error(`Ошибка при регистрации просмотра автомобиля с ID ${id}:`, error);
    return 0;
  }
};

/**
 * Проверка доступности API
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    console.log('[API] Проверка доступности API');
    
    const response = await fetch(`${API_URL}/status.php`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('[API] API доступно:', result);
    return result.success === true;
  } catch (error) {
    console.error('Ошибка при проверке доступности API:', error);
    return false;
  }
};

/**
 * Получение заказов из базы данных
 */
export const loadOrders = async (): Promise<Order[]> => {
  try {
    console.log('[API] Загрузка заказов из базы данных');
    
    const response = await fetch(`${API_URL}/get_orders.php`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка получения заказов');
    }
    
    console.log(`[API] Получено ${result.data.length} заказов`);
    return result.data;
  } catch (error) {
    console.error('Ошибка при загрузке заказов:', error);
    return [];
  }
};

/**
 * Создание нового заказа в базе данных
 */
export const createOrder = async (order: Order): Promise<string> => {
  try {
    console.log('[API] Создание нового заказа:', order);
    
    const response = await fetch(`${API_URL}/orders/create_order.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка создания заказа');
    }
    
    console.log(`[API] Заказ успешно создан с ID: ${result.orderId}`);
    return result.orderId;
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    throw new Error('Не удалось создать заказ');
  }
};

/**
 * Обновление статуса заказа
 */
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    console.log(`[API] Обновление статуса заказа ${orderId} на ${status}`);
    
    const response = await fetch(`${API_URL}/update_order_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: orderId, status })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка обновления статуса заказа');
    }
    
    console.log(`[API] Статус заказа успешно обновлен`);
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    return false;
  }
};

/**
 * Получение настроек сайта из базы данных
 */
export const getSettings = async (group?: string): Promise<Record<string, any>> => {
  try {
    console.log('[API] Получение настроек сайта');
    
    const url = group ? `${API_URL}/settings/get_settings.php?group=${group}` : `${API_URL}/settings/get_settings.php`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка получения настроек');
    }
    
    console.log(`[API] Настройки успешно получены:`, result.data);
    return result.data;
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    return {};
  }
};

/**
 * Обновление настройки сайта
 */
export const updateSetting = async (key: string, value: string | number | boolean, group: string = 'general', type: string = 'text'): Promise<boolean> => {
  try {
    console.log(`[API] Обновление настройки ${key} на значение ${value}`);
    
    const response = await fetch(`${API_URL}/settings/update_setting.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value, group, type })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка обновления настройки');
    }
    
    console.log(`[API] Настройка ${key} успешно обновлена`);
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении настройки:', error);
    return false;
  }
};

/**
 * Обновление настроек Telegram для уведомлений
 */
export const updateTelegramSettings = async (settings: { 
  telegramToken?: string;
  telegramChannel?: string;
  adminNotifyList?: string;
}): Promise<boolean> => {
  try {
    console.log(`[API] Обновление настроек Telegram`);
    
    const response = await fetch(`${API_URL}/settings/update_telegram_settings.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка обновления настроек Telegram');
    }
    
    console.log(`[API] Настройки Telegram успешно обновлены`);
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении настроек Telegram:', error);
    return false;
  }
};

/**
 * Проверка и инициализация базы данных
 */
export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log('[API] Проверка и инициализация базы данных');
    
    const response = await fetch(`${API_URL}/install.php`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[API] Результат инициализации базы данных:`, result);
    return result.success === true;
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return false;
  }
};

/**
 * Экспортируем функции для совместимости со старым кодом
 */
export const loadOrdersFromJson = loadOrders;
export const saveOrderToJson = createOrder;
export const checkJsonFilesAvailability = checkApiAvailability;
