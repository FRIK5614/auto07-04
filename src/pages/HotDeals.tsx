
import React, { useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TelegramPost {
  id: number;
  date: number;
  message: string;
  photo?: string;
}

const HotDeals: React.FC = () => {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  
  const channelUsername = 'VoeAVTO'; // Hardcoded for now, can be moved to settings
  
  useEffect(() => {
    const fetchPosts = async () => {
      if (!settings.telegram_bot_token) {
        setError('Токен бота Telegram не настроен. Пожалуйста, настройте его в панели администратора.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/telegram/get_channel_posts.php?channel=${channelUsername}`);
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.posts || []);
        } else {
          setError(data.message || 'Не удалось загрузить посты из Telegram');
        }
      } catch (err) {
        console.error('Error fetching Telegram posts:', err);
        setError('Произошла ошибка при загрузке данных из Telegram');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [settings.telegram_bot_token]);
  
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Горячие предложения</h1>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <a href="https://t.me/VoeAVTO" target="_blank" rel="noopener noreferrer">
              <span>Перейти в Telegram канал</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Загрузка публикаций...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>
              {error}
              {!settings.telegram_bot_token && (
                <div className="mt-2">
                  <Link to="/admin/settings" className="underline">
                    Перейти к настройкам Telegram
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <Alert className="my-4">
            <AlertTitle>Нет публикаций</AlertTitle>
            <AlertDescription>
              В настоящее время нет доступных публикаций в канале Telegram.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {formatDate(post.date)}
                  </div>
                  {post.photo && (
                    <div className="mb-4">
                      <img 
                        src={post.photo} 
                        alt="Изображение публикации" 
                        className="rounded-md max-h-80 w-auto"
                      />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{post.message}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HotDeals;
