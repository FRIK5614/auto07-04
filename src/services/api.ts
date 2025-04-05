
import { Car } from '../types/car';

// Базовый URL для API
const BASE_URL = 'https://catalog.tmcavto.ru';

/**
 * Получение данных о всех автомобилях
 * Примечание: Это имитация API запроса. В реальном приложении здесь будет настоящий запрос
 * к API сервера, который обрабатывает данные с catalog.tmcavto.ru
 */
export const fetchAllCars = async (): Promise<Car[]> => {
  try {
    // В реальном приложении здесь будет запрос к вашему бэкенду
    // Например: const response = await fetch(`${BASE_URL}/api/cars`);
    // Но сейчас мы используем временные данные из локальных файлов
    console.log(`[API] Имитация запроса к ${BASE_URL}/api/cars`);
    
    // Для тестирования используем существующие данные
    // В будущем здесь будет реальный API запрос
    const { carsData } = await import('../data/carsData');
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`[API] Получено ${carsData.length} автомобилей`);
    return carsData;
  } catch (error) {
    console.error("Ошибка при получении данных об автомобилях:", error);
    throw new Error("Не удалось загрузить данные об автомобилях");
  }
};

/**
 * Получение детальной информации об автомобиле по ID
 */
export const fetchCarById = async (id: string): Promise<Car | null> => {
  try {
    // В реальном приложении здесь будет запрос к бэкенду
    // Например: const response = await fetch(`${BASE_URL}/api/cars/${id}`);
    console.log(`[API] Имитация запроса к ${BASE_URL}/api/cars/${id}`);
    
    // Для тестирования используем существующие данные
    const { carsData } = await import('../data/carsData');
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const car = carsData.find(car => car.id === id);
    
    if (!car) {
      console.log(`[API] Автомобиль с ID ${id} не найден`);
      return null;
    }
    
    console.log(`[API] Получены данные об автомобиле: ${car.brand} ${car.model}`);
    return car;
  } catch (error) {
    console.error(`Ошибка при получении данных об автомобиле с ID ${id}:`, error);
    throw new Error("Не удалось загрузить данные об автомобиле");
  }
};

/**
 * Поиск автомобилей по параметрам
 */
export const searchCars = async (searchParams: Record<string, any>): Promise<Car[]> => {
  try {
    // В реальном приложении здесь будет запрос к бэкенду с параметрами поиска
    // Например: const response = await fetch(`${BASE_URL}/api/cars/search?${new URLSearchParams(searchParams)}`);
    console.log(`[API] Имитация поиска автомобилей с параметрами:`, searchParams);
    
    // Для тестирования используем существующие данные
    const { carsData } = await import('../data/carsData');
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Здесь можно добавить фильтрацию по параметрам
    // Но сейчас просто возвращаем все автомобили
    console.log(`[API] Найдено ${carsData.length} автомобилей`);
    return carsData;
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
    // В реальном приложении здесь будет запрос к бэкенду
    console.log(`[API] Имитация запроса к ${BASE_URL}/api/brands`);
    
    // Для тестирования используем существующие данные
    const { carsData } = await import('../data/carsData');
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const brands = [...new Set(carsData.map(car => car.brand))];
    
    console.log(`[API] Получено ${brands.length} брендов`);
    return brands;
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
    // В реальном приложении здесь будет запрос к бэкенду
    // Например: const response = await fetch(`${BASE_URL}/api/purchase-requests`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    console.log(`[API] Имитация отправки заявки на покупку:`, formData);
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[API] Заявка успешно отправлена`);
    return {
      success: true,
      message: "Ваша заявка успешно отправлена. Наш менеджер свяжется с вами в ближайшее время."
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
 * Генерация мок-данных о автомобилях для Китая
 * Это служебная функция для создания тестовых данных, когда реальные данные недоступны
 */
export const generateMockCarsForChina = (count: number = 10): Car[] => {
  const chineseBrands = ['Geely', 'BYD', 'Great Wall', 'Chery', 'Haval', 'JAC', 'Lifan', 'Dongfeng', 'Foton', 'Changan'];
  const models = ['Atlas', 'Coolray', 'Tugella', 'Tang', 'Han', 'Hovel H6', 'Jolion', 'Tiggo 7 Pro', 'Tiggo 8', 'Arrizo 5'];
  const years = [2020, 2021, 2022, 2023, 2024];
  
  const mockCars: Car[] = [];
  
  for (let i = 0; i < count; i++) {
    const brand = chineseBrands[Math.floor(Math.random() * chineseBrands.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const price = Math.floor(Math.random() * 2000000) + 800000;
    
    mockCars.push({
      id: `china-${brand}-${model}-${i}`,
      brand,
      model,
      year,
      price,
      country: 'Китай',
      imageUrl: '/placeholder.svg',
      detailUrl: '#'
    });
  }
  
  return mockCars;
};

/**
 * Обходное решение для получения данных о автомобилях из определенной страны
 * Эта функция пытается использовать API, но если запрос заблокирован, возвращает тестовые данные
 */
export const fetchCarsByCountryWithFallback = async (country: string): Promise<Car[]> => {
  try {
    // Пытаемся получить реальные данные
    console.log(`[API] Пытаемся получить автомобили из ${country}`);
    
    // Здесь будет реальный запрос к API
    // Но пока используем тестовые данные
    if (country === 'Китай') {
      return generateMockCarsForChina(15);
    }
    
    // Для других стран используем существующие данные
    const { carsData } = await import('../data/carsData');
    return carsData.filter(car => car.country === country);
  } catch (error) {
    console.error(`Ошибка при получении автомобилей из ${country}:`, error);
    
    // Возвращаем тестовые данные в случае ошибки
    if (country === 'Китай') {
      console.log(`[API] Использование тестовых данных для Китая`);
      return generateMockCarsForChina(15);
    }
    
    // Для других стран возвращаем пустой массив
    return [];
  }
};
