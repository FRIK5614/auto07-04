
import { useCars } from "@/hooks/useCars";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, Car } from "lucide-react";
import { Link } from "react-router-dom";

const FavoritesPanel = () => {
  const { favoriteCars, removeFromFavorites, toggleCompare, isInCompare } = useCars();

  if (favoriteCars.length === 0) {
    return (
      <div className="p-6 text-center">
        <Heart className="h-12 w-12 text-auto-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-auto-gray-700 mb-2">Ваш список избранного пуст</h3>
        <p className="text-auto-gray-500 mb-6">
          Добавляйте автомобили в избранное, чтобы вернуться к ним позже
        </p>
        <Button asChild className="bg-auto-blue-600 hover:bg-auto-blue-700">
          <Link to="/">Перейти в каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-auto-gray-900">
          Избранное <span className="text-auto-gray-500 text-lg font-normal">({favoriteCars.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {favoriteCars.map(car => (
          <Card key={car.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <Link to={`/car/${car.id}`} className="block sm:w-40 h-40">
                  <img 
                    src={car.images[0].url} 
                    alt={car.images[0].alt} 
                    className="w-full h-full object-cover"
                  />
                </Link>
                
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        <Link to={`/car/${car.id}`} className="hover:text-auto-blue-600 transition-colors">
                          {car.brand} {car.model}
                        </Link>
                      </h3>
                      <p className="text-auto-gray-500 text-sm">
                        {car.year} • {car.engine.fuelType} • {car.bodyType}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromFavorites(car.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-auto-gray-600">Двигатель:</span>
                    </div>
                    <div>
                      <span className="text-auto-gray-900 font-medium">
                        {car.engine.displacement} л, {car.engine.power} л.с.
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-auto-gray-600">КПП:</span>
                    </div>
                    <div>
                      <span className="text-auto-gray-900 font-medium">
                        {car.transmission.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-auto-gray-600">Привод:</span>
                    </div>
                    <div>
                      <span className="text-auto-gray-900 font-medium">
                        {car.drivetrain}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold text-auto-blue-700">
                        {new Intl.NumberFormat("ru-RU", {
                          style: "currency",
                          currency: "RUB",
                          maximumFractionDigits: 0,
                        }).format(car.price.base)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`${
                          isInCompare(car.id) 
                            ? "bg-auto-blue-50 text-auto-blue-600 border-auto-blue-600" 
                            : "text-auto-gray-700"
                        }`}
                        onClick={() => toggleCompare(car.id)}
                      >
                        <Car className="h-4 w-4 mr-1" />
                        {isInCompare(car.id) ? "В сравнении" : "Сравнить"}
                      </Button>
                      
                      <Button 
                        asChild
                        size="sm"
                        className="bg-auto-blue-600 hover:bg-auto-blue-700"
                      >
                        <Link to={`/car/${car.id}`}>
                          Подробнее
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPanel;
