
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramNotifications } from "@/hooks/useTelegramNotifications";
import { Loader2 } from "lucide-react";

const TelegramSettings = () => {
  const { settings, isLoading, updateSettings } = useTelegramNotifications();
  const [token, setToken] = useState("");
  const [channel, setChannel] = useState("");
  const [adminList, setAdminList] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Обновляем состояние формы при загрузке настроек
    setToken(settings.telegramToken);
    setChannel(settings.telegramChannel);
    setAdminList(settings.adminNotifyList);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        telegramToken: token,
        telegramChannel: channel,
        adminNotifyList: adminList
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
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="token">Токен Telegram бота</Label>
              <Input
                id="token"
                type="text"
                placeholder="Введите токен Telegram бота"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="channel">ID канала или чата</Label>
              <Input
                id="channel"
                type="text"
                placeholder="Например: @my_channel или -1001234567890"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="adminList">Список администраторов для уведомлений</Label>
              <Input
                id="adminList"
                type="text"
                placeholder="Например: 123456789,987654321"
                value={adminList}
                onChange={(e) => setAdminList(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Введите ID пользователей Telegram через запятую
              </p>
            </div>
            
            <Button 
              onClick={handleSave} 
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramSettings;
