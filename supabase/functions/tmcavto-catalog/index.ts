
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
      
      const allCars: Car[] = [];
      
      // Импортируем автомобили из каждой страны
      for (const country of countries) {
        console.log(`Импорт автомобилей из ${country.name}...`);
        const cars = await importCarsFromCountry(country.name, country.url);
        allCars.push(...cars);
      }
      
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
    return parseCarsFromHTML(html, country);
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
    return cars;
  }
  
  // Находим все карточки автомобилей
  const carCards = doc.querySelectorAll(".car-card");
  
  carCards.forEach((card, index) => {
    try {
      const brandModelElement = card.querySelector(".car-title");
      const brandModel = brandModelElement ? brandModelElement.textContent.trim() : '';
      
      const [brand, model] = brandModel.split(' ', 2);
      
      const priceElement = card.querySelector(".car-price");
      const priceText = priceElement ? priceElement.textContent.replace(/[^\d]/g, '') : '0';
      const price = parseInt(priceText, 10) || 0;
      
      const yearElement = card.querySelector(".car-year");
      const yearText = yearElement ? yearElement.textContent.replace(/[^\d]/g, '') : '2020';
      const year = parseInt(yearText, 10) || 2020;
      
      const imageElement = card.querySelector("img");
      const imageSrc = imageElement ? imageElement.getAttribute("src") : '';
      const imageUrl = imageSrc ? (imageSrc.startsWith('http') ? imageSrc : `https://catalog.tmcavto.ru${imageSrc}`) : '';
      
      const linkElement = card.querySelector("a");
      const detailLink = linkElement ? linkElement.getAttribute("href") : '';
      const detailUrl = detailLink ? (detailLink.startsWith('http') ? detailLink : `https://catalog.tmcavto.ru${detailLink}`) : '';
      
      cars.push({
        id: `${country}-${brand}-${model}-${index}`,
        brand: brand || 'Неизвестно',
        model: model || 'Неизвестно',
        year: year,
        price: price,
        country: country,
        imageUrl: imageUrl,
        detailUrl: detailUrl
      });
    } catch (error) {
      console.error('Ошибка при парсинге карточки автомобиля:', error);
    }
  });
  
  return cars;
}
