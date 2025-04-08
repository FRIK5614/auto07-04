
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/useSettings';
import { useTelegramChannel } from '@/hooks/useTelegramChannel';

interface TelegramMessage {
  id: number;
  date: number;
  text: string;
  photo?: string;
  caption?: string;
}

const HotDeals = () => {
  const { posts, loading, error } = useTelegramChannel('@VoeAVTO');
  const { settings } = useSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const navigateToTelegram = () => {
    window.open('https://t.me/VoeAVTO', '_blank');
  };

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить сообщения из Telegram"
      });
    }
  }, [error, toast]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Горячие предложения</h1>
          <p className="text-gray-600">
            Актуальные предложения из нашего Telegram канала
          </p>
        </div>
        <Button 
          onClick={navigateToTelegram} 
          className="mt-4 md:mt-0"
        >
          Перейти в Telegram
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600">
            Не удалось загрузить сообщения из Telegram канала. Пожалуйста, попробуйте позже.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Нет доступных предложений</p>
            </div>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg text-gray-800">
                      {post.text.substring(0, 100)}{post.text.length > 100 ? '...' : ''}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  
                  {post.photo && (
                    <div className="mb-4">
                      <img 
                        src={post.photo} 
                        alt="Изображение предложения" 
                        className="w-full rounded-md object-cover" 
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
                  
                  <div className="text-gray-600 whitespace-pre-line mb-4">
                    {post.caption || post.text}
                  </div>
                  
                  <Button 
                    onClick={navigateToTelegram} 
                    variant="outline" 
                    size="sm"
                  >
                    Подробнее
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HotDeals;
