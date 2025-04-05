
import { useEffect, useState } from "react";
import { Car } from "@/types/car";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedCarsProps {
  cars: Car[];
  title: string;
  subtitle?: string;
}

const FeaturedCars = ({ cars, title, subtitle }: FeaturedCarsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // Determine how many cards to show based on viewport
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 768) {
        setVisibleCount(2);
      } else if (width < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.max(0, cars.length - visibleCount + 1);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-auto-gray-900">{title}</h2>
            {subtitle && <p className="text-auto-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= totalSlides - 1}
              className="rounded-full h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
              width: `${(cars.length * 100) / visibleCount}%`,
            }}
          >
            {cars.map((car) => (
              <div
                key={car.id}
                className="px-2"
                style={{ width: `${100 / cars.length}%` }}
              >
                <CarCard car={car} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCars;
