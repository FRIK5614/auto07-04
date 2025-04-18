import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { TelegramSettings } from '@/components/admin/TelegramSettings';
import SettingField from '@/components/admin/SettingField';
import { Separator } from '@/components/ui/separator';

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, children }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { settings, loading, updateSetting, fetchSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleSettingChange = (setting: any) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [setting.key]: setting
    }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    
    try {
      const promises = Object.values(unsavedChanges).map(setting => 
        updateSetting(setting)
      );
      
      await Promise.all(promises);
      setUnsavedChanges({});
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
    setUnsavedChanges({});
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Настройки сайта</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSettings}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Обновить
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={saveChanges}
            disabled={isSaving || Object.keys(unsavedChanges).length === 0}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить изменения
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Загрузка настроек...</span>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="design">Дизайн</TabsTrigger>
            <TabsTrigger value="features">Функционал</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <SettingsGroup title="Основные">
              <SettingField
                label="Название сайта"
                name="site_title"
                value={unsavedChanges['site_title']?.value ?? settings.site_title ?? 'Автокаталог'}
                onChange={handleSettingChange}
                group="general"
              />
              <SettingField
                label="Описание сайта"
                name="site_description"
                value={unsavedChanges['site_description']?.value ?? settings.site_description ?? 'Каталог автомобилей'}
                type="textarea"
                onChange={handleSettingChange}
                group="general"
              />
            </SettingsGroup>
            
            <SettingsGroup title="Контакты">
              <SettingField
                label="Email для связи"
                name="contact_email"
                value={unsavedChanges['contact_email']?.value ?? settings.contact_email ?? ''}
                onChange={handleSettingChange}
                group="general"
              />
              <SettingField
                label="Телефон"
                name="contact_phone"
                value={unsavedChanges['contact_phone']?.value ?? settings.contact_phone ?? ''}
                onChange={handleSettingChange}
                group="general"
              />
              <SettingField
                label="Адрес"
                name="contact_address"
                value={unsavedChanges['contact_address']?.value ?? settings.contact_address ?? ''}
                type="textarea"
                onChange={handleSettingChange}
                group="general"
              />
            </SettingsGroup>
          </TabsContent>
          
          <TabsContent value="catalog">
            <SettingsGroup title="Параметры каталога">
              <SettingField
                label="Количество автомобилей на странице"
                name="catalog_items_per_page"
                value={unsavedChanges['catalog_items_per_page']?.value ?? settings.catalog_items_per_page ?? 12}
                type="number"
                onChange={handleSettingChange}
                group="catalog"
              />
              <SettingField
                label="Показывать цены"
                name="show_prices"
                value={unsavedChanges['show_prices']?.value ?? settings.show_prices ?? true}
                type="boolean"
                onChange={handleSettingChange}
                group="catalog"
              />
              <SettingField
                label="Показывать фильтры"
                name="show_filters"
                value={unsavedChanges['show_filters']?.value ?? settings.show_filters ?? true}
                type="boolean"
                onChange={handleSettingChange}
                group="catalog"
              />
            </SettingsGroup>
            
            <SettingsGroup title="Главная страница">
              <SettingField
                label="Количество популярных автомобилей"
                name="homepage_featured_cars"
                value={unsavedChanges['homepage_featured_cars']?.value ?? settings.homepage_featured_cars ?? 6}
                type="number"
                onChange={handleSettingChange}
                group="homepage"
              />
              <SettingField
                label="Заголовок блока популярных автомобилей"
                name="homepage_featured_title"
                value={unsavedChanges['homepage_featured_title']?.value ?? settings.homepage_featured_title ?? 'Популярные автомобили'}
                onChange={handleSettingChange}
                group="homepage"
              />
            </SettingsGroup>
          </TabsContent>
          
          <TabsContent value="design">
            <SettingsGroup title="Цвета">
              <SettingField
                label="Основной цвет"
                name="primary_color"
                value={unsavedChanges['primary_color']?.value ?? settings.primary_color ?? '#9b87f5'}
                type="color"
                onChange={handleSettingChange}
                group="design"
              />
              <SettingField
                label="Дополнительный цвет"
                name="secondary_color"
                value={unsavedChanges['secondary_color']?.value ?? settings.secondary_color ?? '#7E69AB'}
                type="color"
                onChange={handleSettingChange}
                group="design"
              />
            </SettingsGroup>
            
            <SettingsGroup title="Логотип">
              <SettingField
                label="URL логотипа"
                name="logo_url"
                value={unsavedChanges['logo_url']?.value ?? settings.logo_url ?? ''}
                onChange={handleSettingChange}
                group="design"
                description="Укажите полный URL к изображению логотипа"
              />
              <SettingField
                label="Альтернативный текст логотипа"
                name="logo_alt"
                value={unsavedChanges['logo_alt']?.value ?? settings.logo_alt ?? 'Логотип'}
                onChange={handleSettingChange}
                group="design"
              />
            </SettingsGroup>
          </TabsContent>
          
          <TabsContent value="features">
            <SettingsGroup title="Функциональность">
              <SettingField
                label="Включить сравнение автомобилей"
                name="enable_comparison"
                value={unsavedChanges['enable_comparison']?.value ?? settings.enable_comparison ?? true}
                type="boolean"
                onChange={handleSettingChange}
                group="features"
              />
              <SettingField
                label="Включить избранное"
                name="enable_favorites"
                value={unsavedChanges['enable_favorites']?.value ?? settings.enable_favorites ?? true}
                type="boolean"
                onChange={handleSettingChange}
                group="features"
              />
              <SettingField
                label="Включить форму заказа"
                name="enable_orders"
                value={unsavedChanges['enable_orders']?.value ?? settings.enable_orders ?? true}
                type="boolean"
                onChange={handleSettingChange}
                group="features"
              />
              <Separator className="my-4" />
              <SettingField
                label="Email для уведомлений о новых заказах"
                name="order_notification_email"
                value={unsavedChanges['order_notification_email']?.value ?? settings.order_notification_email ?? ''}
                onChange={handleSettingChange}
                group="features"
              />
            </SettingsGroup>
          </TabsContent>

          <TabsContent value="telegram">
            <TelegramSettings />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminSettings;
