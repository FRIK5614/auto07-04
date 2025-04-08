
import React from "react";
import { useLocation } from "react-router-dom";
import { Settings, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
}

const AdminHeader = ({ title }: AdminHeaderProps) => {
  const location = useLocation();
  
  // Функция для получения более подробного заголовка на основе пути
  const getDetailedTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Панель управления';
      case '/admin/cars':
        return 'Управление автомобилями';
      case '/admin/orders':
        return 'Заказы клиентов';
      case '/admin/import':
        return 'Импорт данных';
      case '/admin/settings':
        return 'Настройки системы';
      default:
        return title;
    }
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 border-b flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{getDetailedTitle()}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="ml-2">
          <User size={20} />
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
