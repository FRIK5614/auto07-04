
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardCards from "@/components/admin/DashboardCards";
import RecentOrders from "@/components/admin/RecentOrders";
import CarStatistics from "@/components/admin/CarStatistics";
import { checkApiAvailability } from "@/services/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SetupDatabaseCard from "@/components/admin/SetupDatabaseCard";

const AdminDashboard = () => {
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const available = await checkApiAvailability();
        setApiAvailable(available);
      } catch (error) {
        console.error('Ошибка при проверке API:', error);
        setApiAvailable(false);
      }
    };
    
    checkApi();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Панель управления" />
        <div className="flex-1 overflow-y-auto p-4">
          {apiAvailable === null ? (
            <div className="text-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Проверка подключения к API...</p>
            </div>
          ) : apiAvailable ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">API подключен</AlertTitle>
              <AlertDescription className="text-green-600">
                Соединение с API установлено успешно. Система готова к работе.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-700">API недоступен</AlertTitle>
                <AlertDescription className="text-red-600">
                  Не удалось подключиться к API. Убедитесь, что сервер запущен и доступен.
                </AlertDescription>
              </Alert>
              
              <div className="mb-6">
                <Button 
                  onClick={() => checkApiAvailability().then(setApiAvailable)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Проверить соединение снова
                </Button>
              </div>
            </>
          )}

          {apiAvailable && (
            <>
              <SetupDatabaseCard />
              <DashboardCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <RecentOrders />
                </div>
                <div className="lg:col-span-1">
                  <CarStatistics />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
