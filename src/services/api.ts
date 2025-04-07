import { Car } from '../types/car';

// Базовый URL для API
const BASE_URL = 'https://catalog.tmcavto.ru';

// Temporary image storage for demo purposes
const IMAGE_STORAGE_PREFIX = '/car/image/';

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
    
    // Add server paths to images
    const processedCarsData = carsData.map(car => {
      if (car.images && car.images.length > 0) {
        const updatedImages = car.images.map((image, index) => {
          // Replace placeholder with server path
          if (image.url === '/placeholder.svg') {
            return {
              ...image,
              url: `${IMAGE_STORAGE_PREFIX}car-${car.id}-default.jpg`
            };
          }
          return image;
        });
        return { ...car, images: updatedImages };
      }
      return car;
    });
    
    // Добавляем задержку для имитации сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`[API] Получено ${processedCarsData.length} автомобилей`);
    return processedCarsData;
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
    
    // Update images to use server paths
    if (car.images && car.images.length > 0) {
      const updatedImages = car.images.map((image, index) => {
        // Replace placeholder with server path
        if (image.url === '/placeholder.svg') {
          return {
            ...image,
            url: `${IMAGE_STORAGE_PREFIX}car-${car.id}-default.jpg`
          };
        }
        return image;
      });
      car.images = updatedImages;
    }
    
    console.log(`[API] Получены данные об автомобиле: ${car.brand} ${car.model}`);
    return car;
  } catch (error) {
    console.error(`Ошибка при получении данных об автомобиле с ID ${id}:`, error);
    throw new Error("Не удалось загрузить данные об автомобиле");
  }
};

/**
 * Upload image to server
 * In a real app, this would send the file to a server endpoint
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    console.log(`[API] Имитация загрузки файла на сервер: ${file.name}`);
    
    // In a real app, here you would:
    // 1. Create FormData
    // 2. Append the file
    // 3. Send via fetch POST to your endpoint
    
    // For demo purposes, simulate a server-side path
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const serverPath = `${IMAGE_STORAGE_PREFIX}${fileName}`;
    
    // Create an object URL for demo purposes
    const objectUrl = URL.createObjectURL(file);
    
    // Store the mapping between object URL and server path
    const urlMapping = localStorage.getItem('imageUrlMapping') || '{}';
    const mapping = JSON.parse(urlMapping);
    mapping[objectUrl] = serverPath;
    localStorage.setItem('imageUrlMapping', JSON.stringify(mapping));
    
    // Simulate delay for network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[API] Файл успешно загружен на ${serverPath}`);
    return serverPath;
  } catch (error) {
    console.error("Ошибка при загрузке изображения:", error);
    throw new Error("Не удалось загрузить изображение");
  }
};

/**
 * Assign an uploaded image to a car
 */
export const assignImageToCar = async (carId: string, imagePath: string): Promise<boolean> => {
  try {
    console.log(`[API] Присвоение изображения ${imagePath} автомобилю ${carId}`);
    
    // In a real app, this would update a database record
    const carImageMapping = localStorage.getItem('carImageMapping') || '{}';
    const mapping = JSON.parse(carImageMapping);
    mapping[carId] = imagePath;
    localStorage.setItem('carImageMapping', JSON.stringify(mapping));
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  const bodyTypes = ['SUV', 'Седан', 'Кроссовер', 'Хэтчбек'];
  
  const mockCars: Car[] = [];
  
  for (let i = 0; i < count; i++) {
    const brand = chineseBrands[Math.floor(Math.random() * chineseBrands.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const basePrice = Math.floor(Math.random() * 2000000) + 800000;
    const bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
    
    // Create a simple mock car object
    mockCars.push({
      id: `china-${brand}-${model}-${i}`,
      brand,
      model,
      year,
      bodyType,
      colors: ['Белый', 'Черный', 'Серебристый'],
      price: {
        base: basePrice,
        discount: Math.random() > 0.7 ? Math.floor(basePrice * 0.1) : undefined
      },
      engine: {
        type: '4-цилиндровый',
        displacement: 1.5 + Math.floor(Math.random() * 10) / 10,
        power: 120 + Math.floor(Math.random() * 100),
        torque: 200 + Math.floor(Math.random() * 150),
        fuelType: Math.random() > 0.3 ? 'Бензин' : 'Дизель'
      },
      transmission: {
        type: Math.random() > 0.5 ? 'Автоматическая' : 'Механическая',
        gears: 5 + Math.floor(Math.random() * 3)
      },
      drivetrain: Math.random() > 0.6 ? 'Передний' : 'Полный',
      dimensions: {
        length: 4500 + Math.floor(Math.random() * 500),
        width: 1800 + Math.floor(Math.random() * 200),
        height: 1600 + Math.floor(Math.random() * 200),
        wheelbase: 2600 + Math.floor(Math.random() * 200),
        weight: 1500 + Math.floor(Math.random() * 500),
        trunkVolume: 400 + Math.floor(Math.random() * 200)
      },
      performance: {
        acceleration: 8 + Math.random() * 4,
        topSpeed: 180 + Math.floor(Math.random() * 50),
        fuelConsumption: {
          city: 8 + Math.random() * 3,
          highway: 6 + Math.random() * 2,
          combined: 7 + Math.random() * 2
        }
      },
      features: [
        {
          id: `feature-${i}-1`,
          name: 'Климат-контроль',
          category: 'Комфорт',
          isStandard: true
        },
        {
          id: `feature-${i}-2`,
          name: 'Парктроник',
          category: 'Безопасность',
          isStandard: Math.random() > 0.5
        }
      ],
      images: [
        {
          id: `image-${i}-1`,
          url: '/placeholder.svg',
          alt: `${brand} ${model}`
        }
      ],
      description: `${brand} ${model} - современный китайский автомобиль ${bodyType.toLowerCase()} с экономичным расходом топлива и богатой комплектацией.`,
      isNew: Math.random() > 0.7,
      country: 'Китай',
      viewCount: Math.floor(Math.random() * 100)
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
