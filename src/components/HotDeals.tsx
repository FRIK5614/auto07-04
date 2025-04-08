
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import CarCard from "@/components/CarCard";
import { useHotDeals } from "@/hooks/useHotDeals";
import { Skeleton } from "@/components/ui/skeleton";

const HotDeals = () => {
  const { hotDeals, loading, error, viewHotDeal } = useHotDeals();

  if (loading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Горячие предложения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Горячие предложения</h2>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">
              Ошибка при загрузке горячих предложений. Пожалуйста, попробуйте позже.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hotDeals.length === 0) {
    return null; // Не показываем раздел, если нет горячих предложений
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Горячие предложения</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotDeals.map((car) => (
          <CarCard 
            key={car.id} 
            car={car} 
            withBadge={true}
            badgeText="Горячее предложение"
            badgeColor="bg-red-500"
          />
        ))}
      </div>
    </div>
  );
};

export default HotDeals;
