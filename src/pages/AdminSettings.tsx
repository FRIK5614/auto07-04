
import React, { useState, useEffect } from 'react';
import { useSettings, SiteSetting } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const { settings, loading: loadingSettings, error, fetchSettings, updateSetting } = useSettings();
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Функция сохранения настройки
  const handleSaveSetting = async (key: string, value: string | number | boolean, type: string = 'text', group: string = 'main') => {
    setSaving(prev => ({ ...prev, [key]: true }));
    await updateSetting({ key, value, group, type: type as any });
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="container py-8 px-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Настройки сайта</h1>
      
      {loadingSettings ? (
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
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                  <CardDescription>
                    Настройте уведомления о новых заказах
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Список Telegram ID администраторов для уведомлений</label>
                    <Textarea
                      defaultValue={settings?.adminNotifyList || ''}
                      onBlur={(e) => handleSaveSetting('adminNotifyList', e.target.value, 'textarea', 'notifications')}
                      placeholder="123456789,987654321"
                      className="h-24"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Укажите Telegram ID администраторов через запятую, которые будут получать уведомления о новых заказах
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Telegram канал</label>
                    <Input
                      defaultValue={settings?.telegramChannel || '@VoeAVTO'}
                      onBlur={(e) => handleSaveSetting('telegramChannel', e.target.value, 'text', 'notifications')}
                      placeholder="@your_channel"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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
  );
};

export default AdminSettings;
