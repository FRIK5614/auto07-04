
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { useDeepSeek } from '../hooks/useDeepSeek';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './ui/spinner';
import { Badge } from './ui/badge';
import ErrorState from './ErrorState';

interface DeepSeekConsultantProps {
  className?: string;
}

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

const DeepSeekConsultant: React.FC<DeepSeekConsultantProps> = ({ className }) => {
  const [problemContext, setProblemContext] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const { getConsultation, loading, solutions, error, requestCount } = useDeepSeek({
    businessContext: 'Автосалон, продажа автомобилей, CRM система'
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problemContext.trim()) {
      const codeSnippets = codeSnippet ? [codeSnippet] : undefined;
      await getConsultation(problemContext, codeSnippets);
    }
  };
  
  return (
    <div className={className}>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <CardTitle className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3.5L6 6.5V12.5L12 16L18 12.5V6.5L12 3.5Z" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
            DeepSeek Консультант
            <Badge variant="outline" className="ml-2 text-xs text-white border-white">
              Экспертная система
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="problem-context" className="block text-sm font-medium mb-1">
                Опишите проблему или вопрос
              </label>
              <Textarea 
                id="problem-context"
                value={problemContext}
                onChange={(e) => setProblemContext(e.target.value)}
                placeholder="Например: Нужно оптимизировать SQL запрос который выполняется слишком долго..."
                className="min-h-20"
                required
              />
            </div>
            
            <div>
              <label htmlFor="code-snippet" className="block text-sm font-medium mb-1">
                Код для анализа (опционально)
              </label>
              <Textarea 
                id="code-snippet"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Вставьте фрагмент кода, если необходим анализ..."
                className="min-h-32 font-mono text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !problemContext.trim()}
              className="w-full"
            >
              {loading ? 'Отправка запроса...' : 'Получить экспертную консультацию'}
            </Button>
          </form>
          
          {loading && <LoadingSpinner />}
          
          {error && <ErrorState message={error} />}
          
          {!loading && solutions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Рекомендации экспертной системы:</h3>
              
              {solutions.map((solution, index) => (
                <Card key={index} className={`border ${index === 0 ? 'border-primary' : 'border-muted'}`}>
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Решение {index + 1}</CardTitle>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        Уверенность: {Math.round(solution.confidence * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="font-semibold text-sm">Рекомендация:</h4>
                      <p className="whitespace-pre-wrap">{solution.solution}</p>
                      
                      {solution.explanation && (
                        <>
                          <h4 className="font-semibold text-sm mt-3">Объяснение:</h4>
                          <p>{solution.explanation}</p>
                        </>
                      )}
                      
                      {(solution.performance_impact || solution.security_level) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {solution.performance_impact && (
                            <Badge variant={
                              solution.performance_impact === 'positive' ? 'success' : 
                              solution.performance_impact === 'negative' ? 'destructive' : 'outline'
                            }>
                              Влияние на производительность: {solution.performance_impact}
                            </Badge>
                          )}
                          
                          {solution.security_level && (
                            <Badge variant={
                              solution.security_level === 'high' ? 'success' : 
                              solution.security_level === 'low' ? 'destructive' : 'outline'
                            }>
                              Безопасность: {solution.security_level}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground bg-muted/30">
          Запросов выполнено: {requestCount}/50 (лимит в час)
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeepSeekConsultant;
