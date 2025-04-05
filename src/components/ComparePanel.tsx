
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/useCars";
import { X, BarChart2 } from "lucide-react";

const ComparePanel = () => {
  const { comparisonCars, removeFromCompare, clearCompare } = useCars();
  
  if (comparisonCars.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-auto-gray-200 shadow-lg z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-auto-blue-600" />
              <span className="font-medium">Сравнение: {comparisonCars.length} {comparisonCars.length === 1 ? 'автомобиль' : comparisonCars.length < 5 ? 'автомобиля' : 'автомобилей'}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              {comparisonCars.map(car => (
                <div 
                  key={car.id} 
                  className="flex items-center bg-auto-gray-100 px-2 py-1 rounded"
                >
                  <span className="text-sm truncate max-w-[150px]">{car.brand} {car.model}</span>
                  <button 
                    onClick={() => removeFromCompare(car.id)}
                    className="ml-1 text-auto-gray-500 hover:text-auto-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCompare}
              className="text-auto-gray-700"
            >
              Очистить
            </Button>
            
            <Button 
              asChild
              size="sm"
              className="bg-auto-blue-600 hover:bg-auto-blue-700"
            >
              <Link to="/compare">Сравнить</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePanel;
