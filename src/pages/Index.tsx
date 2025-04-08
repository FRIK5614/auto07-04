
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import HotDeals from "@/components/HotDeals";
import NewArrivals from "@/components/NewArrivals";
import WhyChooseUs from "@/components/WhyChooseUs";
import { CarsProvider } from "@/contexts/CarsContext";
import { useCarManagement } from "@/hooks/useCarManagement";

const Index = () => {
  const { cars, forceReloadCars, loading } = useCarManagement();
  
  // Загружаем данные из API при загрузке страницы
  useEffect(() => {
    forceReloadCars();
  }, [forceReloadCars]);
  
  return (
    <CarsProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <div className="container mx-auto px-4 py-8">
            <FeaturedCars 
              title="Популярные модели" 
              subtitle="Наши самые востребованные автомобили"
              filter="popular"
              limit={6}
              cars={cars}
              isLoading={loading}
            />
            <HotDeals />
            <NewArrivals />
            <WhyChooseUs />
          </div>
        </main>
        <Footer />
      </div>
    </CarsProvider>
  );
};

export default Index;
