
import React, { useState, useCallback } from 'react';
import { useCarImages } from '@/hooks/useCarImages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarImage } from '@/types/car';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Link as LinkIcon, Star, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarImageUploaderProps {
  carId: string;
  onImageUpload?: () => void;
}

const CarImageUploader: React.FC<CarImageUploaderProps> = ({ carId, onImageUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const [images, setImages] = useState<CarImage[]>([]);
  
  const { uploadCarImage, addImageByUrl, fetchCarImages, deleteImage, setMainImage } = useCarImages();
  const { toast } = useToast();
  
  const loadImages = useCallback(async () => {
    if (carId) {
      const carImages = await fetchCarImages(carId);
      setImages(carImages);
    }
  }, [carId, fetchCarImages]);

  React.useEffect(() => {
    loadImages();
  }, [loadImages, carId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Пожалуйста, выберите файл для загрузки"
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImage = await uploadCarImage(file, carId);
      if (uploadedImage) {
        toast({
          title: "Фотография загружена",
          description: "Фотография успешно загружена и привязана к автомобилю"
        });
        
        setFile(null);
        await loadImages();
        
        if (onImageUpload) {
          onImageUpload();
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setUrlError(null);
  };

  const validateUrl = (url: string): boolean => {
    // Простая проверка на URL изображения
    if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
      setUrlError('URL должен вести к изображению (jpg, png, gif, webp)');
      return false;
    }
    return true;
  };

  const handleUrlUpload = async () => {
    if (!imageUrl) {
      setUrlError('Пожалуйста, введите URL изображения');
      return;
    }
    
    if (!validateUrl(imageUrl)) {
      return;
    }
    
    setIsUrlLoading(true);
    try {
      const success = await addImageByUrl(imageUrl, carId);
      
      if (success) {
        setImageUrl('');
        await loadImages();
        
        if (onImageUpload) {
          onImageUpload();
        }
      }
    } catch (error) {
      console.error('Error adding image by URL:', error);
      setUrlError('Не удалось загрузить изображение по указанному URL');
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      await deleteImage(imageId, carId);
      await loadImages();
      
      if (onImageUpload) {
        onImageUpload();
      }
    }
  };

  const handleSetMainImage = async (imageId: string) => {
    await setMainImage(imageId, carId);
    await loadImages();
    
    if (onImageUpload) {
      onImageUpload();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Фотографии автомобиля</CardTitle>
        <CardDescription>
          Загрузите фотографии автомобиля или добавьте их по URL
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">Загрузка файла</TabsTrigger>
            <TabsTrigger value="url">Добавить по URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid gap-2">
              <Label htmlFor="image-upload">Выберите фотографию</Label>
              <Input
                id="image-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
              />
              {file && (
                <div className="mt-2 text-sm">
                  Выбран файл: {file.name} ({(file.size / 1024).toFixed(2)} Кб)
                </div>
              )}
              <Button 
                onClick={handleFileUpload} 
                disabled={!file || isUploading}
                className="mt-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <div className="grid gap-2">
              <Label htmlFor="image-url">URL фотографии</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className={cn(urlError && "border-red-500")}
                />
                <Button 
                  onClick={handleUrlUpload}
                  disabled={!imageUrl || isUrlLoading}
                >
                  {isUrlLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {urlError && <p className="text-sm text-red-500 mt-1">{urlError}</p>}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Загруженные фотографии</h4>
          {images.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md bg-muted/10">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Нет загруженных фотографий
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative group aspect-square">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSetMainImage(image.id)}
                      className="text-white hover:text-yellow-400 hover:bg-transparent"
                    >
                      <Star className={cn("h-5 w-5", image.isMain && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteImage(image.id)}
                      className="text-white hover:text-red-400 hover:bg-transparent"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {image.isMain && (
                    <div className="absolute top-1 right-1 bg-yellow-500 text-xs px-1 py-0.5 rounded text-white">
                      Главная
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={loadImages}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarImageUploader;
