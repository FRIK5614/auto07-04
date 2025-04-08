
import { useState, useCallback, useEffect } from 'react';
import { Order } from '@/types/car';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateTelegramSettings } from '@/services/api';

interface TelegramSettings {
  telegramToken: string;
  telegramChannel: string;
  adminNotifyList: string;
}

export const useTelegramNotifications = () => {
  const [settings, setSettings] = useState<TelegramSettings>({
    telegramToken: '',
    telegramChannel: '',
    adminNotifyList: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Загрузка настроек из базы данных
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const telegramSettings = await getSettings('telegram');
      
      if (telegramSettings) {
        setSettings({
          telegramToken: telegramSettings.telegramToken || '',
          telegramChannel: telegramSettings.telegramChannel || '',
          adminNotifyList: telegramSettings.adminNotifyList || ''
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при загрузке настроек Telegram:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Загружаем настройки при первой инициализации
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Обновление настроек в базе данных
  const updateSettings = useCallback(async (newSettings: Partial<TelegramSettings>) => {
    setIsLoading(true);
    try {
      const success = await updateTelegramSettings({
        ...newSettings
      });
      
      if (success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...newSettings
        }));
        
        toast({
          title: "Настройки обновлены",
          description: "Настройки Telegram успешно сохранены"
        });
        
        return true;
      } else {
        throw new Error("Не удалось обновить настройки");
      }
    } catch (error) {
      console.error('Ошибка при обновлении настроек Telegram:', error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки Telegram"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Отправка уведомления о новом заказе
  const notifyNewOrder = useCallback(async (order: Order) => {
    try {
      if (!settings.telegramToken || !settings.telegramChannel) {
        console.log('Настройки Telegram не заданы, уведомление не отправлено');
        return false;
      }
      
      const formattedMessage = formatOrderMessage(order);
      
      // В настоящем приложении здесь был бы запрос к API телеграм или вашему серверу
      console.log(`[Telegram] Отправка уведомления в канал ${settings.telegramChannel}`);
      console.log(`[Telegram] Сообщение: ${formattedMessage}`);
      
      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('[Telegram] Уведомление отправлено успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при отправке уведомления в Telegram:', error);
      return false;
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    loadSettings,
    updateSettings,
    notifyNewOrder
  };
};

// Вспомогательная функция для форматирования сообщения о заказе
const formatOrderMessage = (order: Order): string => {
  return `
🚗 *Новый заказ*
📝 ID: ${order.id}
👤 Клиент: ${order.customerName}
📞 Телефон: ${order.customerPhone}
📧 Email: ${order.customerEmail || 'Не указан'}
🚘 ID автомобиля: ${order.carId}
${order.message ? `💬 Комментарий: ${order.message}` : ''}
⏱ Дата: ${new Date(order.createdAt).toLocaleString()}
  `.trim();
};
