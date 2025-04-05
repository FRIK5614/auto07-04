
import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCars } from '@/hooks/useCars';
import { Card } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { cars, orders } = useCars();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  // Redirect non-admin users to login
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);
  
  // Make sure we have data before proceeding
  if (!cars || !orders) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  const salesData = [
    { name: 'Новые', value: cars.filter(car => car.isNew).length },
    { name: 'Популярные', value: cars.filter(car => car.isPopular).length },
    { name: 'Всего', value: cars.length }
  ];

  const orderData = [
    { name: 'Новые', value: orders.filter(order => order.status === 'new').length },
    { name: 'В обработке', value: orders.filter(order => order.status === 'processing').length },
    { name: 'Завершенные', value: orders.filter(order => order.status === 'completed').length }
  ];

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
