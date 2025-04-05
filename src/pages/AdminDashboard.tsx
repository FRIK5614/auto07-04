
import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCars } from '@/hooks/useCars';
import { Card } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { cars, orders } = useCars();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect non-admin users to login
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);
  
  // Initialize empty arrays as fallbacks to prevent rendering errors
  const safeCars = cars || [];
  const safeOrders = orders || [];
  
  useEffect(() => {
    // Log data to debug
    console.log('Admin Dashboard Data:', { cars: safeCars, orders: safeOrders });
    
    if (safeCars.length === 0 && isAdmin) {
      toast({
        title: "Нет данных об автомобилях",
        description: "Каталог автомобилей пуст",
        variant: "destructive"
      });
    }
  }, [safeCars, safeOrders, isAdmin, toast]);

  const salesData = [
    { name: 'Новые', value: safeCars.filter(car => car.isNew).length },
    { name: 'Популярные', value: safeCars.filter(car => car.isPopular).length },
    { name: 'Всего', value: safeCars.length }
  ];

  const orderData = [
    { name: 'Новые', value: safeOrders.filter(order => order.status === 'new').length },
    { name: 'В обработке', value: safeOrders.filter(order => order.status === 'processing').length },
    { name: 'Завершенные', value: safeOrders.filter(order => order.status === 'completed').length }
  ];

  // If not admin, don't render anything (we'll redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика автомобилей</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика заказов</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
