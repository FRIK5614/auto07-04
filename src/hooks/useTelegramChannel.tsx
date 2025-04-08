
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

interface TelegramPost {
  id: number;
  date: number;
  text: string;
  photo?: string;
  caption?: string;
}

interface TelegramChannelResponse {
  ok: boolean;
  result?: any[];
  description?: string;
}

// Функция для извлечения текстового представления из HTML
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
};

export const useTelegramChannel = (channelName: string) => {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  
  // Получаем токен из настроек или используем резервный
  const TELEGRAM_TOKEN = settings?.telegramToken || '7816899565:AAF_OIH114D1Ijlg_r6_xAq1un5jy5X4w7Y';
  const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
  
  // Используем канал из настроек или резервное значение
  const channelUsername = settings?.telegramChannel || channelName.replace('@', '');

  useEffect(() => {
    const fetchTelegramPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Загрузка постов из канала: ${channelUsername}`);
        
        // Используем метод getUpdates для получения сообщений из канала
        const response = await fetch(`${TELEGRAM_API_BASE}/getUpdates`);
        const data: TelegramChannelResponse = await response.json();
        
        console.log('Ответ API Telegram:', data);
        
        if (!data.ok) {
          throw new Error(data.description || 'Не удалось получить данные из Telegram');
        }
        
        // Альтернативный подход: использовать метод getChat для получения chat_id, затем получить сообщения
        const chatResponse = await fetch(`${TELEGRAM_API_BASE}/getChat?chat_id=@${channelUsername}`);
        const chatData = await chatResponse.json();
        console.log('Информация о канале:', chatData);
        
        // Пытаемся получить сообщения из канала
        const chatId = chatData.ok ? chatData.result.id : null;
        let channelPosts: TelegramPost[] = [];
        
        if (chatId) {
          const messagesResponse = await fetch(`${TELEGRAM_API_BASE}/getUpdates?allowed_updates=["channel_post"]&limit=10`);
          const messagesData = await messagesResponse.json();
          console.log('Сообщения канала:', messagesData);
          
          // Фильтруем только сообщения из указанного канала
          channelPosts = messagesData.ok ? 
            messagesData.result
              .filter((update: any) => update.channel_post && 
                      (update.channel_post.chat.username === channelUsername || 
                      update.channel_post.chat.title?.includes(channelUsername)))
              .map((update: any) => {
                const post = update.channel_post;
                let photoUrl = undefined;
                let caption = undefined;
                
                // Если есть фото
                if (post.photo && post.photo.length > 0) {
                  const bestPhoto = post.photo[post.photo.length - 1];
                  photoUrl = `${TELEGRAM_API_BASE}/getFile?file_id=${bestPhoto.file_id}`;
                }
                
                // Если есть подпись
                if (post.caption) {
                  caption = stripHtml(post.caption);
                }
                
                return {
                  id: post.message_id,
                  date: post.date,
                  text: post.text ? stripHtml(post.text) : (caption || ''),
                  photo: photoUrl,
                  caption: caption !== post.text ? caption : undefined
                };
              }) : [];
        }
        
        // Если не удалось получить посты, создадим тестовые данные
        if (channelPosts.length === 0) {
          const now = Math.floor(Date.now() / 1000);
          channelPosts = [
            {
              id: 1,
              date: now,
              text: 'Новое поступление автомобилей из Японии! Доступны для заказа.',
              photo: 'https://via.placeholder.com/600x400?text=Автомобили+из+Японии'
            },
            {
              id: 2,
              date: now - 86400, // вчера
              text: 'Специальное предложение на модели 2023 года. Скидки до 15%!',
              photo: 'https://via.placeholder.com/600x400?text=Специальное+предложение'
            },
            {
              id: 3,
              date: now - 86400 * 2, // позавчера
              text: 'Новое поступление запчастей для Toyota и Lexus. В наличии и под заказ.',
              photo: 'https://via.placeholder.com/600x400?text=Запчасти'
            }
          ];
        }
        
        // Сортируем по дате (новые сначала)
        const sortedPosts = channelPosts.sort((a, b) => b.date - a.date);
        
        setPosts(sortedPosts);
        console.log('Загружено постов:', sortedPosts.length);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        console.error('Ошибка при загрузке постов из Telegram:', errorMessage);
        setError(errorMessage);
        
        // Создаем тестовые данные при ошибке
        const now = Math.floor(Date.now() / 1000);
        const fallbackPosts = [
          {
            id: 1,
            date: now,
            text: 'Новое поступление автомобилей из Японии! Доступны для заказа.',
            photo: 'https://via.placeholder.com/600x400?text=Автомобили+из+Японии'
          },
          {
            id: 2,
            date: now - 86400, // вчера
            text: 'Специальное предложение на модели 2023 года. Скидки до 15%!',
            photo: 'https://via.placeholder.com/600x400?text=Специальное+предложение'
          }
        ];
        setPosts(fallbackPosts);
        
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: `Не удалось загрузить посты из Telegram: ${errorMessage}`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTelegramPosts();
    
    // Обновляем данные каждые 5 минут
    const intervalId = setInterval(fetchTelegramPosts, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [channelName, toast, channelUsername, TELEGRAM_API_BASE, settings?.telegramToken]);

  return { posts, loading, error };
};
