
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Обработка CORS preflight запросов
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    // Если URL не указан, возвращаем ошибку
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL не указан" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Формируем URL для запроса
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

    // Получаем текст ответа
    const text = await response.text();
    
    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({ data: text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
