
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, ShoppingCart, TrendingUp } from "lucide-react";

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Всего автомобилей</p>
            <h3 className="text-2xl font-bold">84</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Посетители</p>
            <h3 className="text-2xl font-bold">12,596</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <ShoppingCart className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Заказы</p>
            <h3 className="text-2xl font-bold">32</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Конверсия</p>
            <h3 className="text-2xl font-bold">4.8%</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
