
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTelegramNotifications } from "@/hooks/useTelegramNotifications";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  telegramToken: z.string().min(1, "Токен не может быть пустым"),
  telegramChannel: z.string().min(1, "ID канала не может быть пустым"),
  adminNotifyList: z.string()
});

type TelegramFormValues = z.infer<typeof formSchema>;

const TelegramSettings = () => {
  const { settings, isLoading, updateSettings } = useTelegramNotifications();
  const [isSaving, setIsSaving] = useState(false);

  // Инициализируем форму
  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegramToken: "",
      telegramChannel: "",
      adminNotifyList: ""
    }
  });

  // Обновляем форму при загрузке настроек
  useEffect(() => {
    if (settings) {
      form.reset({
        telegramToken: settings.telegramToken || "",
        telegramChannel: settings.telegramChannel || "",
        adminNotifyList: settings.adminNotifyList || ""
      });
    }
  }, [settings, form]);

  const handleSave = async (data: TelegramFormValues) => {
    setIsSaving(true);
    try {
      await updateSettings({
        telegramToken: data.telegramToken,
        telegramChannel: data.telegramChannel,
        adminNotifyList: data.adminNotifyList
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки уведомлений Telegram</CardTitle>
        <CardDescription>
          Настройте интеграцию с Telegram для получения уведомлений о новых заказах
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="telegramToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Токен Telegram бота</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите токен Telegram бота"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telegramChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID канала или чата</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: @my_channel или -1001234567890"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="adminNotifyList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Список администраторов для уведомлений</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: 123456789,987654321"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Введите ID пользователей Telegram через запятую
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить настройки"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramSettings;
