
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

// Функция для извлечения тестового представления из HTML
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
  
  const TELEGRAM_TOKEN = '7816899565:AAF_OIH114D1Ijlg_r6_xAq1un5jy5X4w7Y';
  const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  useEffect(() => {
    const fetchTelegramPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Используем getUpdates для получения последних сообщений
        const response = await fetch(`${TELEGRAM_API_BASE}/getUpdates`);
        const data: TelegramChannelResponse = await response.json();
        
        if (!data.ok) {
          throw new Error(data.description || 'Failed to fetch Telegram posts');
        }
        
        // Фильтруем только сообщения из каналов (channel_post)
        const channelPosts = data.result
          ?.filter(update => update.channel_post && 
                  (update.channel_post.chat.username === channelName.replace('@', '') || 
                   update.channel_post.chat.title === channelName))
          ?.map(update => {
            const post = update.channel_post;
            let photoUrl = undefined;
            let caption = undefined;
            
            // Если есть фотография
            if (post.photo && post.photo.length > 0) {
              // Выбираем фото с наилучшим качеством (последнее в массиве)
              const bestPhoto = post.photo[post.photo.length - 1];
              photoUrl = `${TELEGRAM_API_BASE}/getFile?file_id=${bestPhoto.file_id}`;
            }
            
            // Если есть подпись к фото
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
          }) || [];
        
        // Сортируем по дате (самые свежие сначала)
        const sortedPosts = channelPosts.sort((a, b) => b.date - a.date);
        
        setPosts(sortedPosts);
        console.log('Загружено постов из Telegram:', sortedPosts.length);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        console.error('Ошибка при загрузке постов из Telegram:', errorMessage);
        setError(errorMessage);
        
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
  }, [channelName, toast]);

  return { posts, loading, error };
};
