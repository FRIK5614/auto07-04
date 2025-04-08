
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ThumbsUp, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Headphones, 
  BarChart
} from "lucide-react";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <ThumbsUp className="h-10 w-10 text-blue-600" />,
      title: "Качественные автомобили",
      description: "Все автомобили проходят тщательную проверку перед поступлением в продажу"
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
      title: "Гарантия качества",
      description: "Предоставляем гарантию на все автомобили"
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-600" />,
      title: "Быстрое оформление",
      description: "Оформление документов занимает минимум времени"
    },
    {
      icon: <CreditCard className="h-10 w-10 text-blue-600" />,
      title: "Выгодные кредиты",
      description: "Специальные условия кредитования от банков-партнеров"
    },
    {
      icon: <Headphones className="h-10 w-10 text-blue-600" />,
      title: "Поддержка клиентов",
      description: "Наша служба поддержки всегда готова помочь вам"
    },
    {
      icon: <BarChart className="h-10 w-10 text-blue-600" />,
      title: "Прозрачные условия",
      description: "Никаких скрытых платежей и комиссий"
    }
  ];

  return (
    <div className="my-16 py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Почему выбирают нас</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы стремимся сделать покупку автомобиля максимально комфортной и выгодной для каждого клиента
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {reason.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
