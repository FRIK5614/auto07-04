
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setupDatabase } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Database } from "lucide-react";

const SetupDatabaseCard = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleSetupDatabase = async () => {
    setIsSettingUp(true);
    try {
      const success = await setupDatabase();
      if (success) {
        setSetupStatus('success');
        toast({
          title: "База данных настроена",
          description: "База данных успешно настроена и готова к работе",
        });
      } else {
        setSetupStatus('error');
        toast({
          variant: "destructive",
          title: "Ошибка настройки БД",
          description: "Не удалось настроить базу данных. Проверьте логи сервера.",
        });
      }
    } catch (error) {
      console.error("Ошибка при настройке базы данных:", error);
      setSetupStatus('error');
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при настройке базы данных",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-6 w-6" />
          Настройка базы данных
        </CardTitle>
        <CardDescription>
          Проверка и инициализация структуры базы данных
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {setupStatus === 'success' ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>База данных настроена успешно</span>
            </div>
          ) : setupStatus === 'error' ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Ошибка при настройке базы данных</span>
            </div>
          ) : (
            <Button
              onClick={handleSetupDatabase}
              disabled={isSettingUp}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSettingUp ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Настройка...
                </>
              ) : (
                "Настроить базу данных"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupDatabaseCard;
