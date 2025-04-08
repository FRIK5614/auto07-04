
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Найдите свой идеальный автомобиль
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Большой выбор новых и подержанных автомобилей по выгодным ценам
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/catalog">Смотреть каталог</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20" asChild>
                <Link to="/hot-deals">Горячие предложения</Link>
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 bg-white/10 backdrop-blur p-6 rounded-lg">
            <h3 className="font-semibold text-xl mb-4 flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Быстрый поиск
            </h3>
            <form className="space-y-4">
              <div>
                <select className="w-full p-2 rounded bg-white/20 border border-white/30 text-white">
                  <option value="">Выберите марку</option>
                  <option value="toyota">Toyota</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="audi">Audi</option>
                </select>
              </div>
              <div>
                <select className="w-full p-2 rounded bg-white/20 border border-white/30 text-white">
                  <option value="">Тип кузова</option>
                  <option value="sedan">Седан</option>
                  <option value="suv">Внедорожник</option>
                  <option value="hatchback">Хэтчбек</option>
                  <option value="wagon">Универсал</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Цена от"
                  className="w-1/2 p-2 rounded bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                />
                <input
                  type="number"
                  placeholder="Цена до"
                  className="w-1/2 p-2 rounded bg-white/20 border border-white/30 text-white placeholder:text-white/70"
                />
              </div>
              <Button type="submit" className="w-full">
                Найти автомобиль
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
