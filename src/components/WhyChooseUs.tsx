
import React from 'react';
import { Shield, Award, ThumbsUp, Truck } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: 'Гарантия качества',
      description: 'Все наши автомобили проходят тщательную проверку перед продажей'
    },
    {
      icon: <Award className="h-10 w-10 text-blue-600" />,
      title: 'Лучшие цены',
      description: 'Мы предлагаем конкурентные цены и выгодные условия приобретения'
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-blue-600" />,
      title: 'Отличный сервис',
      description: 'Наши специалисты всегда готовы помочь с выбором и оформлением'
    },
    {
      icon: <Truck className="h-10 w-10 text-blue-600" />,
      title: 'Быстрая доставка',
      description: 'Доставим ваш новый автомобиль в любую точку России'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
