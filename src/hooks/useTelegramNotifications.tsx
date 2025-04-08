
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { Order } from '@/types/car';

export const useTelegramNotifications = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const TELEGRAM_TOKEN = '7816899565:AAF_OIH114D1Ijlg_r6_xAq1un5jy5X4w7Y';
  const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
  const TELEGRAM_CHANNEL = '@VoeAVTO'; // Канал по умолчанию

  // Проверка поля adminNotifyList из настроек
  const getNotificationRecipients = useCallback(() => {
    const adminList = settings?.adminNotifyList;
    
    if (!adminList || adminList === '') {
      // Если список администраторов не настроен, отправляем только в канал
      return [TELEGRAM_CHANNEL];
    }
    
    // Разделяем список (предполагается, что администраторы перечислены через запятую)
    const recipients = adminList.split(',').map(id => id.trim());
    recipients.push(TELEGRAM_CHANNEL); // Добавляем основной канал
    
    return recipients;
  }, [settings]);

  const notifyNewOrder = useCallback(async (order: Order) => {
    try {
      setLoading(true);
      
      // Получаем список получателей
      const recipients = getNotificationRecipients();
      
      // Формируем сообщение
      const message = `
📋 *Новый заказ!*
  
🚗 *Автомобиль:* ${order.carDetails?.make || ''} ${order.carDetails?.model || ''}
💰 *Цена:* ${order.amount?.toLocaleString() || 'Не указана'} руб.
👤 *Клиент:* ${order.customerName || 'Имя не указано'}
☎️ *Телефон:* ${order.customerPhone || 'Не указан'}
📝 *Комментарий:* ${order.customerComment || 'Без комментария'}
      `;
      
      // Отправляем сообщения всем получателям
      const sendPromises = recipients.map(recipient => {
        // Если это канал или группа, используем sendMessage
        const sendMethod = recipient.startsWith('@') ? 'sendMessage' : 'sendMessage';
        const chatId = recipient;
        
        return fetch(`${TELEGRAM_API_BASE}/${sendMethod}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      });
      
      // Ждем завершения всех запросов
      await Promise.all(sendPromises);
      
      console.log(`Уведомление о новом заказе успешно отправлено ${recipients.length} получателям`);
      
      return true;
    } catch (err) {
      console.error('Ошибка при отправке уведомления в Telegram:', err);
      
      toast({
        variant: "destructive",
        title: "Ошибка уведомления",
        description: "Не удалось отправить уведомление в Telegram"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [getNotificationRecipients, toast]);

  return {
    notifyNewOrder,
    loading
  };
};
