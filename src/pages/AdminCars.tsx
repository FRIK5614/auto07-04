
import React, { useState, useEffect } from 'react';
import { useCars } from '@/hooks/useCars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Car } from '@/types/car';
import { Plus, Pencil, Trash2, Search, Car as CarIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminCars = () => {
  const { cars, addCar, updateCar, deleteCar, saveUploadedImages, getUploadedImages } = useCars();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const filteredCars = cars
    .filter(car => 
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));

  const handleAddClick = () => {
    setIsAddingCar(true);
    setEditingCar({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      bodyType: 'Седан',
      colors: ['Белый', 'Черный'],
      price: {
        base: 0,
        withOptions: 0
      },
      engine: {
        type: 'Бензин',
        displacement: 1.6,
        power: 100,
        torque: 150,
        fuelType: 'Бензин'
      },
      transmission: {
        type: 'Автоматическая',
        gears: 6
      },
      drivetrain: 'FWD',
      dimensions: {
        length: 4500,
        width: 1800,
        height: 1500,
        wheelbase: 2700,
        weight: 1500,
        trunkVolume: 400
      },
      performance: {
        acceleration: 10,
        topSpeed: 180,
        fuelConsumption: {
          city: 10,
          highway: 7,
          combined: 8.5
        }
      },
      features: [],
      images: [
        {
          id: `img-${Date.now()}`,
          url: '/placeholder.svg',
          alt: 'Car Image'
        }
      ],
      description: '',
      isNew: true,
      country: 'Россия'
    });
    setDialogOpen(true);
  };

  const handleEditClick = (car: Car) => {
    setIsAddingCar(false);
    setEditingCar({...car});
    setActiveTab('additional'); // Set default tab to "additional" when editing
    setDialogOpen(true);
  };

  const handleDeleteClick = (carId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteCar(carId);
      toast({
        title: "Удалено",
        description: "Автомобиль был успешно удален"
      });
    }
  };

  const handleSave = () => {
    if (!editingCar || !editingCar.brand || !editingCar.model) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля"
      });
      return;
    }

    try {
      const carImages = [...(editingCar.images || [])];
      
      // Store uploaded images in localStorage and add them to the car
      if (uploadedImages.length > 0) {
        const imagesToSave = uploadedImages.map((file, index) => ({
          name: file.name,
          base64: previewImages[index]
        }));
        
        saveUploadedImages(imagesToSave);
        
        // Add the new images to the car's images array
        previewImages.forEach((url, index) => {
          carImages.push({
            id: `img-${Date.now()}-${index}`,
            url: url,
            alt: `${editingCar.brand} ${editingCar.model}`
          });
        });
      }

      if (carImages.length === 0) {
        carImages.push({
          id: `img-${Date.now()}`,
          url: '/placeholder.svg',
          alt: 'Car Image'
        });
      }

      const completeCar: Car = {
        id: editingCar.id || `car-${Date.now()}`,
        brand: editingCar.brand,
        model: editingCar.model,
        year: editingCar.year || new Date().getFullYear(),
        bodyType: editingCar.bodyType || 'Седан',
        colors: editingCar.colors || ['Белый'],
        price: editingCar.price || { base: 0, withOptions: 0 },
        engine: editingCar.engine || {
          type: 'Бензин',
          displacement: 1.6,
          power: 100,
          torque: 150,
          fuelType: 'Бензин'
        },
        transmission: editingCar.transmission || {
          type: 'Автоматическая',
          gears: 6
        },
        drivetrain: editingCar.drivetrain || 'FWD',
        dimensions: editingCar.dimensions || {
          length: 4500,
          width: 1800,
          height: 1500,
          wheelbase: 2700,
          weight: 1500,
          trunkVolume: 400
        },
        performance: editingCar.performance || {
          acceleration: 10,
          topSpeed: 180,
          fuelConsumption: {
            city: 10,
            highway: 7,
            combined: 8.5
          }
        },
        features: editingCar.features || [],
        images: carImages,
        description: editingCar.description || '',
        isNew: editingCar.isNew || true,
        country: editingCar.country || 'Россия'
      };

      if (isAddingCar) {
        addCar(completeCar);
        toast({
          title: "Автомобиль добавлен",
          description: "Новый автомобиль был успешно добавлен"
        });
      } else {
        updateCar(completeCar);
        toast({
          title: "Автомобиль обновлен",
          description: "Информация об автомобиле успешно обновлена"
        });
      }
      
      setDialogOpen(false);
      setEditingCar(null);
      setUploadedImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error('Error saving car:', error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении автомобиля"
      });
    }
  };

  const handleColorUpdate = (colorIndex: number, newValue: string) => {
    if (editingCar && editingCar.colors) {
      const updatedColors = [...editingCar.colors];
      updatedColors[colorIndex] = newValue;
      setEditingCar({ ...editingCar, colors: updatedColors });
    }
  };

  const handleColorAdd = () => {
    if (editingCar) {
      const colors = editingCar.colors || [];
      setEditingCar({ ...editingCar, colors: [...colors, ''] });
    }
  };

  const handleColorRemove = (index: number) => {
    if (editingCar && editingCar.colors) {
      const updatedColors = [...editingCar.colors];
      updatedColors.splice(index, 1);
      setEditingCar({ ...editingCar, colors: updatedColors });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newUploadedImages: File[] = [];
    
    Array.from(files).forEach(file => {
      newUploadedImages.push(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImages(prev => [...prev, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setUploadedImages(prev => [...prev, ...newUploadedImages]);
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
    
    toast({
      title: "Фотографии загружены",
      description: `Загружено ${files.length} фото`
    });
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCarImage = (imageId: string) => {
    if (editingCar && editingCar.images) {
      const updatedImages = editingCar.images.filter(img => img.id !== imageId);
      setEditingCar({...editingCar, images: updatedImages});
    }
  };

  return (
    <div className="container mx-auto py-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Управление автомобилями</CardTitle>
              <CardDescription>Просмотр и редактирование автомобилей в каталоге</CardDescription>
            </div>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить автомобиль
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по марке или модели..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)] sm:h-auto">
            <Table>
              <TableCaption>Список автомобилей в каталоге</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Фото</TableHead>
                  <TableHead>Марка</TableHead>
                  <TableHead>Модель</TableHead>
                  <TableHead>Год</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.length > 0 ? (
                  filteredCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage 
                            src={car.images && car.images[0] ? car.images[0].url : '/placeholder.svg'} 
                            alt={car.brand} 
                            className="object-cover"
                          />
                          <AvatarFallback>{car.brand.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{car.brand}</TableCell>
                      <TableCell>{car.model}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                          maximumFractionDigits: 0
                        }).format(car.price.base)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(car)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? 'Нет результатов по запросу' : 'Нет автомобилей в каталоге'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddingCar ? 'Добавить новый автомобиль' : 'Редактировать автомобиль'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об автомобиле
            </DialogDescription>
          </DialogHeader>
          
          {editingCar && (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="technical">Технические данные</TabsTrigger>
                <TabsTrigger value="additional">Дополнительно</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Марка *</Label>
                    <Input
                      id="brand"
                      value={editingCar.brand || ''}
                      onChange={(e) => setEditingCar({...editingCar, brand: e.target.value})}
                      placeholder="Например: Toyota"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Модель *</Label>
                    <Input
                      id="model"
                      value={editingCar.model || ''}
                      onChange={(e) => setEditingCar({...editingCar, model: e.target.value})}
                      placeholder="Например: Camry"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Год выпуска</Label>
                    <Input
                      id="year"
                      type="number"
                      value={editingCar.year || new Date().getFullYear()}
                      onChange={(e) => setEditingCar({...editingCar, year: parseInt(e.target.value)})}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Тип кузова</Label>
                    <Input
                      id="bodyType"
                      value={editingCar.bodyType || ''}
                      onChange={(e) => setEditingCar({...editingCar, bodyType: e.target.value})}
                      placeholder="Например: Седан"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Базовая цена</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={editingCar.price?.base || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        price: {
                          ...editingCar.price,
                          base: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priceWithOptions">Цена с опциями</Label>
                    <Input
                      id="priceWithOptions"
                      type="number"
                      value={editingCar.price?.withOptions || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        price: {
                          ...editingCar.price,
                          withOptions: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Страна</Label>
                    <Input
                      id="country"
                      value={editingCar.country || ''}
                      onChange={(e) => setEditingCar({...editingCar, country: e.target.value})}
                      placeholder="Например: Япония"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isNew" 
                        checked={editingCar.isNew} 
                        onCheckedChange={(checked) => 
                          setEditingCar({...editingCar, isNew: checked === true})
                        }
                      />
                      <Label htmlFor="isNew">Новый автомобиль</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Доступные цвета</Label>
                  <div className="space-y-2">
                    {editingCar.colors?.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={color}
                          onChange={(e) => handleColorUpdate(index, e.target.value)}
                          placeholder="Название цвета"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          type="button"
                          onClick={() => handleColorRemove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleColorAdd}
                    >
                      Добавить цвет
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={editingCar.description || ''}
                    onChange={(e) => setEditingCar({...editingCar, description: e.target.value})}
                    placeholder="Подробное описание автомобиля..."
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Тип двигателя</Label>
                    <Input
                      id="engineType"
                      value={editingCar.engine?.type || ''}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        engine: {
                          ...editingCar.engine,
                          type: e.target.value
                        }
                      })}
                      placeholder="Например: V6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="engineDisplacement">Объем двигателя (л)</Label>
                    <Input
                      id="engineDisplacement"
                      type="number"
                      step="0.1"
                      value={editingCar.engine?.displacement || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        engine: {
                          ...editingCar.engine,
                          displacement: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enginePower">Мощность (л.с.)</Label>
                    <Input
                      id="enginePower"
                      type="number"
                      value={editingCar.engine?.power || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        engine: {
                          ...editingCar.engine,
                          power: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="engineTorque">Крутящий момент (Нм)</Label>
                    <Input
                      id="engineTorque"
                      type="number"
                      value={editingCar.engine?.torque || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        engine: {
                          ...editingCar.engine,
                          torque: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transmissionType">Тип коробки передач</Label>
                    <Input
                      id="transmissionType"
                      value={editingCar.transmission?.type || ''}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        transmission: {
                          ...editingCar.transmission,
                          type: e.target.value
                        }
                      })}
                      placeholder="Например: Автоматическая"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transmissionGears">Количество передач</Label>
                    <Input
                      id="transmissionGears"
                      type="number"
                      value={editingCar.transmission?.gears || 0}
                      onChange={(e) => setEditingCar({
                        ...editingCar, 
                        transmission: {
                          ...editingCar.transmission,
                          gears: parseInt(e.target.value)
                        }
                      })}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="drivetrain">Привод</Label>
                    <Input
                      id="drivetrain"
                      value={editingCar.drivetrain || ''}
                      onChange={(e) => setEditingCar({...editingCar, drivetrain: e.target.value})}
                      placeholder="Например: FWD, AWD, RWD"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="additional" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Фотографии автомобиля</Label>
                    <div className="relative">
                      <Input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Label 
                        htmlFor="image-upload" 
                        className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Загрузить фотографии
                      </Label>
                    </div>
                  </div>
                  
                  {editingCar.images && editingCar.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Текущие фотографии</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {editingCar.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img 
                              src={image.url} 
                              alt={image.alt} 
                              className="w-full h-32 object-cover rounded-md border border-border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            <Button 
                              variant="destructive" 
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeCarImage(image.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {previewImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Новые фотографии</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {previewImages.map((src, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={src} 
                              alt={`New upload ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md border border-border"
                            />
                            <Button 
                              variant="destructive" 
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePreviewImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {editingCar.images && editingCar.images[0] && editingCar.images[0].url && (
                    <div className="mt-2 rounded-md overflow-hidden border border-border">
                      <img 
                        src={editingCar.images[0].url} 
                        alt={editingCar.images[0].alt} 
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="mainImage">Ссылка на основное изображение</Label>
                    <Input
                      id="mainImage"
                      value={editingCar.images && editingCar.images[0] ? editingCar.images[0].url : ''}
                      onChange={(e) => {
                        const currentImages = editingCar.images || [];
                        if (currentImages.length === 0) {
                          setEditingCar({
                            ...editingCar,
                            images: [{ id: `img-${Date.now()}`, url: e.target.value, alt: `${editingCar.brand} ${editingCar.model}` }]
                          });
                        } else {
                          const updatedImages = [...currentImages];
                          updatedImages[0] = { ...updatedImages[0], url: e.target.value };
                          setEditingCar({ ...editingCar, images: updatedImages });
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCars;
