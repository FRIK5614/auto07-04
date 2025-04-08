
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const DeepSeekConsultant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { askDeepSeek, result, loading, error } = useDeepSeek();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    await askDeepSeek(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">DeepSeek AI Консультант</CardTitle>
              <CardDescription>
                Задайте вопрос по разработке и получите экспертную помощь
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-6">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> API Подключен
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Опишите проблему, с которой вы столкнулись..."
                className="min-h-32 resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || !prompt.trim()} 
                className="flex items-center gap-2"
              >
                {loading ? <Spinner className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                {loading ? "Думаю..." : "Спросить AI"}
              </Button>
            </div>
          </form>

          {result && (
            <div className="mt-6 border rounded-md p-4 bg-secondary/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Ответ получен
                </Badge>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 border rounded-md p-4 bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Ошибка
                </Badge>
              </div>
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Powered by DeepSeek API</div>
          <div>До 50 запросов/час</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeepSeekConsultant;
