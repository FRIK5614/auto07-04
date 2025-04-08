
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RecentOrders = () => {
  const orders = [
    {
      id: "OR-3882",
      customer: "Алексей Петров",
      date: "2023-12-10",
      amount: "₽2,580,000",
      status: "completed"
    },
    {
      id: "OR-3881",
      customer: "Екатерина Смирнова",
      date: "2023-12-09",
      amount: "₽1,865,000",
      status: "processing"
    },
    {
      id: "OR-3880",
      customer: "Иван Соколов",
      date: "2023-12-08",
      amount: "₽3,420,000",
      status: "pending"
    },
    {
      id: "OR-3879",
      customer: "Мария Иванова",
      date: "2023-12-07",
      amount: "₽1,950,000",
      status: "completed"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Завершен</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">В обработке</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Ожидает</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Отменен</Badge>;
      default:
        return <Badge className="bg-gray-500">Неизвестно</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Последние заказы</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/orders">Все заказы</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 font-medium text-gray-500">ID</th>
                <th className="pb-2 font-medium text-gray-500">Клиент</th>
                <th className="pb-2 font-medium text-gray-500">Дата</th>
                <th className="pb-2 font-medium text-gray-500">Сумма</th>
                <th className="pb-2 font-medium text-gray-500">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3">{order.id}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">{order.amount}</td>
                  <td className="py-3">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
