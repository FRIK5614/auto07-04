
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useCars } from '@/hooks/useCars';

const AdminDashboard: React.FC = () => {
  const { cars, orders } = useCars();

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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика автомобилей</h2>
          <BarChart width={400} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика заказов</h2>
          <BarChart width={400} height={300} data={orderData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
