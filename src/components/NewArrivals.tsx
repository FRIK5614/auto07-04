
import React from "react";
import { useCarManagement } from "@/hooks/useCarManagement";
import CarCard from "./CarCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const NewArrivals = () => {
  const { cars, loading } = useCarManagement();
  
  // Фильтруем новые поступления (автомобили с флагом isNew)
  const newArrivals = cars.filter(car => car.isNew === true && car.status === 'published')
    .slice(0, 3); // Показываем только 3 элемента
  
  if (loading) {
    return (
      <div className="my-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Новые поступления</h2>
          <p className="text-gray-600">Ознакомьтесь с нашими последними автомобилями</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden border">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (newArrivals.length === 0) {
    return null; // Не показываем блок, если нет новых поступлений
  }

  return (
    <div className="my-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Новые поступления</h2>
        <p className="text-gray-600">Ознакомьтесь с нашими последними автомобилями</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {newArrivals.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
      
      {newArrivals.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link to="/catalog?isNew=true" className="flex items-center">
              Все новые автомобили
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
