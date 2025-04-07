
import { useEffect, useState } from "react";
import { Car } from "@/types/car";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { useCars } from "@/hooks/useCars";

interface FeaturedCarsProps {
  cars: Car[];
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const FeaturedCars = ({ 
  cars, 
  title, 
  subtitle, 
  loading = false, 
  error = null,
  onRetry 
}: FeaturedCarsProps) => {
  const [visibleCount, setVisibleCount] = useState(4);
  const isMobile = useIsMobile();
  const { applySavedImagesToCar } = useCars();
  const [processedCars, setProcessedCars] = useState<Car[]>([]);
  
  const options = {
    align: "start" as const,
    loop: false,
    slidesToScroll: isMobile ? 1 : visibleCount,
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  
  // Process cars with images on component mount and whenever cars change
  useEffect(() => {
    const processCarsWithImages = () => {
      if (!cars || cars.length === 0) {
        setProcessedCars([]);
        return;
      }

      // Create deep copies to avoid reference issues and process each car
      const carsWithImages = cars.map(car => {
        // Make a deep copy of the car object
        const carCopy = JSON.parse(JSON.stringify(car));
        // Apply saved images to the car
        return applySavedImagesToCar(carCopy);
      });

      console.log('FeaturedCars - Processed cars with images:', carsWithImages.length);
      setProcessedCars(carsWithImages);
    };

    processCarsWithImages();
  }, [cars, applySavedImagesToCar]);
  
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

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        ...options,
        slidesToScroll: isMobile ? 1 : visibleCount
      });
    }
  }, [visibleCount, emblaApi, isMobile, options]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-auto-gray-900">{title}</h2>
            {subtitle && <p className="text-auto-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        {error && <ErrorState message={error} onRetry={onRetry} />}
        
        {loading ? (
          <LoadingState count={visibleCount} type="card" />
        ) : !error && processedCars.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-auto-gray-600">В этой категории нет автомобилей</p>
          </div>
        ) : !error && (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {processedCars.map((car) => (
                  <div 
                    key={car.id} 
                    className={isMobile ? "flex-[0_0_100%]" : `flex-[0_0_${100/visibleCount}%]`}
                    style={{ 
                      flex: isMobile ? "0 0 100%" : `0 0 calc(100% / ${visibleCount})`,
                      padding: "0 8px" 
                    }}
                  >
                    <CarCard car={car} className="h-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                onClick={() => emblaApi?.scrollPrev()}
                className="static transform-none h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={() => emblaApi?.scrollNext()}
                className="static transform-none h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedCars;
