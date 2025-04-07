
import { useState } from "react";
import { Link } from "react-router-dom";
import { Car } from "@/types/car";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, BarChart2, Info } from "lucide-react";
import { useCars } from "@/hooks/useCars";
import { cn } from "@/lib/utils";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface CarCardProps {
  car: Car;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};

const CarCard = ({ car, className }: CarCardProps) => {
  const { toggleFavorite, toggleCompare, isFavorite, isInCompare } = useCars();
  
  return (
    <Card className={cn("overflow-hidden group h-full flex flex-col", className)}>
      <div className="relative overflow-hidden h-48">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {car.images.map((image, idx) => (
              <CarouselItem key={idx} className="h-full">
                <Link to={`/car/${car.id}`}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-2 left-0 w-full flex justify-center gap-1 z-10">
            {car.images.map((_, idx) => (
              <div 
                key={idx} 
                className="w-2 h-2 rounded-full bg-white/50"
              />
            ))}
          </div>
        </Carousel>
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {car.isNew && (
            <Badge className="bg-blue-600 text-white">Новинка</Badge>
          )}
          
          {car.country && (
            <Badge className="bg-green-600 text-white">{car.country}</Badge>
          )}
        </div>
        
        {car.price.discount && car.price.discount > 0 && (
          <Badge variant="outline" className="absolute top-3 right-3 bg-white text-red-600 border-red-600">
            Скидка {formatPrice(car.price.discount)}
          </Badge>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <Link to={`/car/${car.id}`} className="hover:text-auto-blue-600 transition-colors">
          <h3 className="text-lg font-semibold text-auto-gray-900">
            {car.brand} {car.model}
          </h3>
        </Link>
        <p className="text-auto-gray-500 text-sm">
          {car.year} • {car.engine.fuelType} • {car.bodyType}
        </p>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 items-center">
            <span className="text-auto-gray-600">Двигатель:</span>
            <span className="text-right font-medium">
              {car.engine.displacement} л, {car.engine.power} л.с.
            </span>
          </div>
          
          <div className="grid grid-cols-2 items-center">
            <span className="text-auto-gray-600">КПП:</span>
            <span className="text-right font-medium">
              {car.transmission.type}
            </span>
          </div>
          
          <div className="grid grid-cols-2 items-center">
            <span className="text-auto-gray-600">Привод:</span>
            <span className="text-right font-medium">
              {car.drivetrain}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-2">
        <div className="w-full">
          <div className="mb-4">
            {car.price.discount ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-auto-blue-700">
                  {formatPrice(car.price.base - car.price.discount)}
                </span>
                <span className="text-sm text-auto-gray-500 line-through">
                  {formatPrice(car.price.base)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-auto-blue-700">
                {formatPrice(car.price.base)}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button 
              asChild
              variant="default" 
              className="col-span-2 bg-auto-blue-600 hover:bg-auto-blue-700 flex items-center justify-center"
            >
              <Link to={`/car/${car.id}`}>
                <Info className="mr-2 h-4 w-4" />
                Подробнее
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "text-auto-gray-700 hover:text-auto-red-500",
                isFavorite(car.id) && "text-red-500 hover:text-red-700 border-red-500 hover:bg-red-50"
              )}
              onClick={() => toggleFavorite(car.id)}
            >
              <Heart className="h-5 w-5" fill={isFavorite(car.id) ? "currentColor" : "none"} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "text-auto-gray-700 hover:text-auto-blue-600",
                isInCompare(car.id) && "text-auto-blue-600 hover:text-auto-blue-700 border-auto-blue-600 hover:bg-auto-blue-50"
              )}
              onClick={() => toggleCompare(car.id)}
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
