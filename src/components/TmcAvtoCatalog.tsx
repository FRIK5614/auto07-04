
import { useState } from 'react';
import { useTmcAvtoCatalog } from '@/hooks/useTmcAvtoCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorState from '@/components/ErrorState';
import { Loader2 } from 'lucide-react';

const TmcAvtoCatalog = () => {
  const [url, setUrl] = useState('/');
  const [responseData, setResponseData] = useState<string | null>(null);
  const { fetchCatalogData, loading, error } = useTmcAvtoCatalog();

  const handleFetch = async () => {
    const data = await fetchCatalogData({ url });
    if (data) {
      setResponseData(data);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Каталог TMC Авто</CardTitle>
          <CardDescription>
            Введите путь URL для получения данных с catalog.tmcavto.ru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Введите путь, например: /cars/toyota"
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleFetch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Получить данные'
              )}
            </Button>
          </div>

          {error && (
            <ErrorState 
              message={error} 
              onRetry={handleFetch}
            />
          )}

          {responseData && !error && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Ответ от сервера:</h3>
              <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap break-words">{responseData}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TmcAvtoCatalog;
