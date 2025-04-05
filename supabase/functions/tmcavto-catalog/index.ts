
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  country: string; // Япония, Корея, Китай
  imageUrl: string;
  detailUrl: string;
}

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, action } = await req.json();
    
    if (!url && !action) {
      return new Response(
        JSON.stringify({ error: "URL или действие не указаны" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Если указано действие импорта
    if (action === 'import') {
      const countries = [
        { name: 'Япония', url: '/cars/japan' },
        { name: 'Корея', url: '/cars/korea' },
        { name: 'Китай', url: '/cars/china' }
      ];
      
      console.log("Начинаем импорт автомобилей...");
      const allCars: Car[] = [];
      
      // Импортируем автомобили из каждой страны
      for (const country of countries) {
        console.log(`Импорт автомобилей из ${country.name}: ${country.url}`);
        const cars = await importCarsFromCountry(country.name, country.url);
        console.log(`Импортировано ${cars.length} автомобилей из ${country.name}`);
        allCars.push(...cars);
      }
      
      console.log(`Всего импортировано: ${allCars.length} автомобилей`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: allCars,
          total: allCars.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Если нужно получить данные по конкретному URL
    const targetUrl = url.startsWith('http') 
      ? url 
      : `https://catalog.tmcavto.ru${url.startsWith('/') ? url : '/' + url}`;
    
    console.log(`Отправка запроса к: ${targetUrl}`);
    
    // Выполняем запрос к сайту catalog.tmcavto.ru
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Проверяем статус ответа
    if (!response.ok) {
      console.error(`Ошибка при запросе к ${targetUrl}: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: `Ошибка при запросе: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Получаем HTML ответа
    const html = await response.text();
    
    // Если запрос был на страницу с автомобилями, парсим данные
    if (url.includes('/cars/')) {
      const cars = parseCarsFromHTML(html, url.includes('/japan') ? 'Япония' : url.includes('/korea') ? 'Корея' : 'Китай');
      
      return new Response(
        JSON.stringify({ data: cars }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({ data: html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Произошла ошибка:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Произошла неизвестная ошибка' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Функция для импорта автомобилей из определенной страны
async function importCarsFromCountry(country: string, countryUrl: string): Promise<Car[]> {
  try {
    const targetUrl = `https://catalog.tmcavto.ru${countryUrl}`;
    console.log(`Запрос к ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      console.error(`Ошибка при запросе к ${targetUrl}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const html = await response.text();
    console.log(`Получен HTML (${html.length} символов) для ${country}`);
    
    // Для отладки - сохраняем первые 200 символов HTML
    console.log(`Начало HTML: ${html.substring(0, 200)}...`);
    
    const cars = parseCarsFromHTML(html, country);
    console.log(`Распарсено ${cars.length} автомобилей из ${country}`);
    
    return cars;
  } catch (error) {
    console.error(`Ошибка при импорте автомобилей из ${country}:`, error);
    return [];
  }
}

// Функция для парсинга HTML и извлечения данных об автомобилях
function parseCarsFromHTML(html: string, country: string): Car[] {
  const cars: Car[] = [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  if (!doc) {
    console.error("Не удалось создать DOM из HTML");
    return cars;
  }
  
  // Печатаем структуру документа для отладки
  console.log(`Парсинг HTML для ${country}`);
  
  // Пробуем различные селекторы для карточек автомобилей
  let carCards = doc.querySelectorAll(".car-card");
  
  if (carCards.length === 0) {
    console.log("Селектор .car-card не найден, пробуем .catalog-item");
    carCards = doc.querySelectorAll(".catalog-item");
  }
  
  if (carCards.length === 0) {
    console.log("Селектор .catalog-item не найден, пробуем .item");
    carCards = doc.querySelectorAll(".item");
  }
  
  if (carCards.length === 0) {
    console.log("Селектор .item не найден, пробуем .product-item");
    carCards = doc.querySelectorAll(".product-item");
  }
  
  console.log(`Найдено ${carCards.length} карточек автомобилей`);
  
  // Если карточки не найдены, пытаемся найти другие элементы
  if (carCards.length === 0) {
    const allDivs = doc.querySelectorAll("div");
    console.log(`Всего найдено ${allDivs.length} div элементов`);
    
    // Выводим классы первых 10 div элементов для отладки
    for (let i = 0; i < Math.min(10, allDivs.length); i++) {
      const div = allDivs[i];
      console.log(`Div ${i}: class="${div.getAttribute("class")}", id="${div.getAttribute("id")}"`);
    }
  }
  
  carCards.forEach((card, index) => {
    try {
      // Логи для отладки структуры карточки
      console.log(`Обработка карточки ${index + 1}`);
      
      // Ищем заголовок (бренд + модель)
      let brandModelElement = card.querySelector(".car-title");
      if (!brandModelElement) {
        brandModelElement = card.querySelector(".item-title");
      }
      if (!brandModelElement) {
        brandModelElement = card.querySelector("h3");
      }
      if (!brandModelElement) {
        brandModelElement = card.querySelector("h2");
      }
      
      const brandModel = brandModelElement ? brandModelElement.textContent.trim() : '';
      console.log(`Бренд и модель: "${brandModel}"`);
      
      // Разбиваем на бренд и модель
      let brand = "Неизвестно";
      let model = "Неизвестно";
      
      if (brandModel) {
        const parts = brandModel.split(/\s+/);
        if (parts.length >= 1) {
          brand = parts[0];
          model = parts.slice(1).join(' ') || "Неизвестно";
        }
      }
      
      // Ищем цену
      let priceElement = card.querySelector(".car-price");
      if (!priceElement) {
        priceElement = card.querySelector(".price");
      }
      if (!priceElement) {
        priceElement = card.querySelector(".item-price");
      }
      
      const priceText = priceElement ? priceElement.textContent.replace(/[^\d]/g, '') : '0';
      const price = parseInt(priceText, 10) || 0;
      console.log(`Цена: ${price}`);
      
      // Ищем год
      let yearElement = card.querySelector(".car-year");
      if (!yearElement) {
        yearElement = card.querySelector(".year");
      }
      if (!yearElement) {
        yearElement = card.querySelector(".item-year");
      }
      
      const yearText = yearElement ? yearElement.textContent.replace(/[^\d]/g, '') : '2020';
      const year = parseInt(yearText, 10) || 2020;
      console.log(`Год: ${year}`);
      
      // Ищем изображение
      let imageElement = card.querySelector("img");
      const imageSrc = imageElement ? imageElement.getAttribute("src") : '';
      console.log(`Изображение: ${imageSrc}`);
      
      const imageUrl = imageSrc ? (imageSrc.startsWith('http') ? imageSrc : `https://catalog.tmcavto.ru${imageSrc}`) : '';
      
      // Ищем ссылку на детали
      let linkElement = card.querySelector("a");
      const detailLink = linkElement ? linkElement.getAttribute("href") : '';
      console.log(`Ссылка на детали: ${detailLink}`);
      
      const detailUrl = detailLink ? (detailLink.startsWith('http') ? detailLink : `https://catalog.tmcavto.ru${detailLink}`) : '';
      
      // Создаем объект автомобиля
      cars.push({
        id: `${country}-${brand}-${model}-${index}`,
        brand: brand,
        model: model,
        year: year,
        price: price,
        country: country,
        imageUrl: imageUrl,
        detailUrl: detailUrl
      });
      
      console.log(`Автомобиль добавлен: ${brand} ${model}, ${year}, ${price} руб.`);
    } catch (error) {
      console.error('Ошибка при парсинге карточки автомобиля:', error);
    }
  });
  
  console.log(`Всего распарсено ${cars.length} автомобилей из ${country}`);
  return cars;
}
