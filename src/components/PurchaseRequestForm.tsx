
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car, Order } from "@/types/car";
import { CheckCircle, Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCars } from "@/hooks/useCars";
import { v4 as uuidv4 } from "uuid";

interface PurchaseRequestFormProps {
  car?: Car;
}

const PurchaseRequestForm = ({ car }: PurchaseRequestFormProps) => {
  const { toast } = useToast();
  const { processOrder } = useCars();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: car ? `Интересует автомобиль ${car.brand} ${car.model}` : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Файл слишком большой",
          description: "Пожалуйста, загрузите файл размером до 5 МБ",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Создаем новый заказ
    const newOrder: Order = {
      id: `order-${uuidv4()}`,
      carId: car?.id || 'unspecified',
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      status: 'new',
      createdAt: new Date().toISOString(),
      message: formData.message,
      image: previewImage || undefined
    };

    try {
      // Сохраняем заказ в localStorage
      const savedOrders = localStorage.getItem("orders");
      let currentOrders: Order[] = [];
      
      if (savedOrders) {
        currentOrders = JSON.parse(savedOrders);
      }
      
      currentOrders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(currentOrders));
      
      // Сохраняем в отдельный JSON для скачивания
      const ordersJson = JSON.stringify(currentOrders, null, 2);
      localStorage.setItem("ordersJSON", ordersJson);
      
      toast({
        title: "Заявка отправлена",
        description: "Мы свяжемся с вами в ближайшее время",
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
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
            setPreviewImage(null);
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

        <div>
          <Label htmlFor="image" className="flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4" />
            Приложить фото (необязательно)
          </Label>
          <div className="flex flex-col gap-2">
            <Input
              id="image"
              name="image"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="file:mr-4 file:px-3 file:py-1 file:rounded file:border-0 file:bg-auto-blue-100 file:text-auto-blue-700 hover:file:bg-auto-blue-200"
            />
            {previewImage && (
              <div className="relative mt-2 inline-block">
                <img 
                  src={previewImage} 
                  alt="Предпросмотр" 
                  className="h-40 object-cover rounded-md" 
                />
                <button
                  type="button"
                  onClick={clearFileInput}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                >
                  <CheckCircle className="h-4 w-4 text-red-500" />
                </button>
              </div>
            )}
          </div>
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
