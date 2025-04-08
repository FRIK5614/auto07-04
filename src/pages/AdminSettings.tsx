
import React, { useState, useEffect } from 'react';
import { useSettings, SiteSetting } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TelegramSettings from '@/components/admin/TelegramSettings';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { settings, loading: loadingSettings, error, fetchSettings, updateSetting } = useSettings();
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [initializingDb, setInitializingDb] = useState(false);
  const { toast } = useToast();

  // Проверяем и инициализируем таблицу настроек
  useEffect(() => {
    const initSettingsTable = async () => {
      try {
        setInitializingDb(true);
        const response = await fetch('https://metallika29.ru/public/api/init_settings_table.php');
        const result = await response.json();
        
        if (result.success) {
          console.log('Настройки базы данных инициализированы:', result.message);
          // Перезагружаем настройки
          fetchSettings();
        } else {
          console.error('Ошибка инициализации настроек:', result.message);
          toast({
            variant: "destructive",
            title: "Ошибка инициализации настроек",
            description: result.message
          });
        }
      } catch (error) {
        console.error('Ошибка при запросе инициализации:', error);
        toast({
          variant: "destructive",
          title: "Ошибка инициализации",
          description: "Не удалось выполнить инициализацию таблицы настроек"
        });
      } finally {
        setInitializingDb(false);
      }
    };
    
    initSettingsTable();
  }, [fetchSettings, toast]);

  // Функция сохранения настройки
  const handleSaveSetting = async (key: string, value: string | number | boolean, type: string = 'text', group: string = 'main') => {
    setSaving(prev => ({ ...prev, [key]: true }));
    await updateSetting({ key, value, group, type: type as any });
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Настройки системы" />
      
      <div className="container py-8 px-4 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Настройки сайта</h1>
        
        {initializingDb ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Инициализация настроек...</span>
          </div>
        ) : loadingSettings ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="main">
            <TabsList className="mb-6">
              <TabsTrigger value="main">Основные</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              <TabsTrigger value="design">Дизайн</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Общие настройки</CardTitle>
                    <CardDescription>
                      Основные настройки сайта и компании
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Название компании</label>
                      <Input
                        defaultValue={settings?.companyName || ''}
                        onBlur={(e) => handleSaveSetting('companyName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">URL логотипа</label>
                      <Input
                        defaultValue={settings?.companyLogo || ''}
                        onBlur={(e) => handleSaveSetting('companyLogo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Телефон компании</label>
                      <Input
                        defaultValue={settings?.companyPhone || ''}
                        onBlur={(e) => handleSaveSetting('companyPhone', e.target.value)}
                        placeholder="+7 (xxx) xxx-xx-xx"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email компании</label>
                      <Input
                        defaultValue={settings?.companyEmail || ''}
                        onBlur={(e) => handleSaveSetting('companyEmail', e.target.value)}
                        placeholder="info@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Адрес компании</label>
                      <Textarea
                        defaultValue={settings?.companyAddress || ''}
                        onBlur={(e) => handleSaveSetting('companyAddress', e.target.value)}
                        placeholder="Город, улица, дом"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <TelegramSettings />
            </TabsContent>
            
            <TabsContent value="design">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки дизайна</CardTitle>
                    <CardDescription>
                      Настройте внешний вид сайта
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Основной цвет</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          className="w-16 h-10"
                          defaultValue={settings?.primaryColor || '#0078FA'}
                          onChange={(e) => handleSaveSetting('primaryColor', e.target.value, 'color', 'design')}
                        />
                        <Input
                          defaultValue={settings?.primaryColor || '#0078FA'}
                          onBlur={(e) => handleSaveSetting('primaryColor', e.target.value, 'color', 'design')}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Фоновый цвет</label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          className="w-16 h-10"
                          defaultValue={settings?.backgroundColor || '#F5F7FA'}
                          onChange={(e) => handleSaveSetting('backgroundColor', e.target.value, 'color', 'design')}
                        />
                        <Input
                          defaultValue={settings?.backgroundColor || '#F5F7FA'}
                          onBlur={(e) => handleSaveSetting('backgroundColor', e.target.value, 'color', 'design')}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
