
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car, Order } from "@/types/car";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCars } from "@/hooks/useCars";
import { v4 as uuidv4 } from "uuid";

interface PurchaseRequestFormProps {
  car?: Car;
}

const PurchaseRequestForm = ({ car }: PurchaseRequestFormProps) => {
  const { toast } = useToast();
  const { createOrder, syncOrders } = useCars();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: car ? `Интересует автомобиль ${car.brand} ${car.model}` : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Создаем новый заказ с уникальным ID
      const timestamp = Date.now();
      const uniqueId = `order-${timestamp}-${uuidv4().substring(0, 8)}`;
      
      const newOrder: Order = {
        id: uniqueId,
        carId: car?.id || 'unspecified',
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        status: 'new',
        createdAt: new Date().toISOString(),
        message: formData.message,
        syncStatus: 'pending'
      };

      // Отправляем данные на PHP API
      const apiUrl = '/api/create_order.php';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      const result = await response.json();
      
      if (result.success) {
        // Также сохраняем локально для немедленного отображения
        const success = await createOrder({
          ...newOrder,
          syncStatus: 'synced'
        });
        
        // Принудительно синхронизируем с сервером
        await syncOrders();
        
        toast({
          title: "Заявка отправлена",
          description: "Мы свяжемся с вами в ближайшее время",
        });
        
        setIsSubmitting(false);
        setIsSubmitted(true);
      } else {
        throw new Error(result.message || "Ошибка при создании заказа");
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      toast({
        variant: "destructive",
        title: "Ошибка отправки заявки",
        description: "Пожалуйста, попробуйте еще раз",
      });
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-auto-gray-200 text-center">
        <div className="w-16 h-16 bg-auto-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-auto-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ваша заявка принята!</h3>
        <p className="text-auto-gray-600 mb-4">
          Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
        </p>
        <Button 
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              phone: "",
              email: "",
              message: car ? `Интересует автомобиль ${car.brand} ${car.model}` : "",
            });
          }} 
          variant="outline"
        >
          Отправить ещё заявку
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border border-auto-gray-200">
      <h3 className="text-xl font-semibold mb-4">
        {car ? `Заявка на ${car.brand} ${car.model}` : "Заявка на автомобиль"}
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Ваше имя *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Введите ваше имя"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="message">Комментарий</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Дополнительная информация или вопросы"
            className="min-h-[100px]"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-auto-blue-600 hover:bg-auto-blue-700" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Отправка..." : "Отправить заявку"}
        </Button>
        
        <p className="text-xs text-auto-gray-500 mt-2">
          Нажимая кнопку «Отправить заявку», вы соглашаетесь с условиями обработки персональных данных.
        </p>
      </div>
    </form>
  );
};

export default PurchaseRequestForm;
