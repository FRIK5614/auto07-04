
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Save, ArrowRightCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSettings, SiteSetting } from '@/hooks/useSettings';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const telegramFormSchema = z.object({
  telegram_bot_token: z.string().min(1, 'Токен бота обязателен'),
  telegram_admin_usernames: z.string().optional(),
  telegram_channel_id: z.string().optional(),
});

type TelegramFormValues = z.infer<typeof telegramFormSchema>;

export const TelegramSettings: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{success: boolean; message: string} | null>(null);

  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      telegram_bot_token: settings.telegram_bot_token || '',
      telegram_admin_usernames: settings.telegram_admin_usernames || '',
      telegram_channel_id: settings.telegram_channel_id || 'VoeAVTO',
    },
  });

  const testBotToken = async () => {
    if (!form.getValues('telegram_bot_token')) {
      setTokenTestResult({
        success: false,
        message: 'Пожалуйста, введите токен бота Telegram'
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/telegram/test_bot_token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: form.getValues('telegram_bot_token')
        }),
      });

      const data = await response.json();
      
      setTokenTestResult({
        success: data.success,
        message: data.message
      });

    } catch (error) {
      setTokenTestResult({
        success: false,
        message: 'Произошла ошибка при тестировании токена бота'
      });
      console.error('Error testing bot token:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: TelegramFormValues) => {
    setIsSaving(true);
    
    try {
      // Обновляем настройки токена бота
      await updateSetting({
        key: 'telegram_bot_token',
        value: data.telegram_bot_token,
        type: 'text',
        group: 'telegram'
      });

      // Обновляем список имен пользователей админов
      await updateSetting({
        key: 'telegram_admin_usernames',
        value: data.telegram_admin_usernames,
        type: 'textarea',
        group: 'telegram'
      });

      // Обновляем ID канала
      await updateSetting({
        key: 'telegram_channel_id',
        value: data.telegram_channel_id,
        type: 'text',
        group: 'telegram'
      });

    } catch (error) {
      console.error('Error saving Telegram settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Настройки Telegram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="telegram_bot_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Токен бота Telegram</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="1234567890:ABCDefGhIJklMNoPQrsTUVwxyZ" 
                        {...field} 
                        type="password" 
                        autoComplete="off" 
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testBotToken}
                      disabled={isSaving || !field.value}
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Проверить
                    </Button>
                  </div>
                  <FormDescription>
                    Токен бота, полученный от @BotFather в Telegram
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tokenTestResult && (
              <Alert variant={tokenTestResult.success ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {tokenTestResult.success ? "Успешно" : "Ошибка"}
                </AlertTitle>
                <AlertDescription>
                  {tokenTestResult.message}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="telegram_channel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID канала Telegram</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VoeAVTO" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Идентификатор канала Telegram без символа @ (например: VoeAVTO)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telegram_admin_usernames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram-аккаунты для уведомлений</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="username1, username2, username3" 
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Список имен пользователей Telegram, которым будут отправляться уведомления о новых заказах.
                    Укажите имена пользователей без символа @, разделенные запятыми.
                  </FormDescription>
                  <FormMessage />

                  {field.value && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.split(',').map((username, index) => {
                        const trimmedUsername = username.trim();
                        if (!trimmedUsername) return null;
                        return (
                          <Badge key={index} variant="outline">
                            @{trimmedUsername}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Сохранить настройки
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <a 
                  href="https://t.me/VoeAVTO" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Перейти в канал 
                  <ArrowRightCircle className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </form>
        </Form>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Как настроить Telegram бота</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Откройте Telegram и найдите бота <strong>@BotFather</strong></li>
            <li>Отправьте команду <code>/newbot</code> и следуйте инструкциям для создания нового бота</li>
            <li>После создания бота вы получите токен, который нужно скопировать в поле выше</li>
            <li>Напишите что-нибудь созданному боту, чтобы активировать диалог</li>
            <li>Добавьте бота в ваш канал или группу и назначьте его администратором</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
