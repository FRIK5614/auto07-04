
import React from 'react';
import DeepSeekConsultant from '../components/DeepSeekConsultant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const DeepSeekDemo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">DeepSeek API Интеграция</h1>
        
        <Tabs defaultValue="consultant" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultant">Консультант</TabsTrigger>
            <TabsTrigger value="about">О системе</TabsTrigger>
            <TabsTrigger value="logs">Аудит</TabsTrigger>
          </TabsList>
          
          <TabsContent value="consultant" className="py-4">
            <DeepSeekConsultant />
          </TabsContent>
          
          <TabsContent value="about" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>О системе DeepSeek</CardTitle>
                <CardDescription>
                  Экспертная система для решения сложных технических задач
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Интеграция с DeepSeek предоставляет доступ к экспертной системе, 
                  которая помогает решать неоднозначные технические задачи и оптимизировать работу приложения.
                </p>
                
                <h3 className="text-lg font-semibold">Условия активации</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Неопределенность в требованиях (противоречивые ТЗ, расплывчатые формулировки)</li>
                  <li>Обнаружение потенциально устаревших подходов (mysql_* функции в PHP и т.д.)</li>
                  <li>Обработка экзотических технологий (интеграция с мейнфреймами IBM и т.д.)</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Сценарии использования</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Оптимизация SQL-запроса с O(n²) до O(log n) сложности</li>
                  <li>Выбор между Redux Toolkit и MobX для специфичного state-менеджмента</li>
                  <li>Решение проблем N+1 в ORM (Eloquent в Laravel и т.д.)</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Безопасность и ограничения</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>API-ключ хранится с защитой и регулярной ротацией</li>
                  <li>Лимит в 50 запросов в час для предотвращения злоупотреблений</li>
                  <li>Все запросы логгируются в системе аудита</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Лог запросов к DeepSeek API</CardTitle>
                <CardDescription>
                  История выполненных запросов к экспертной системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogsViewer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Компонент для отображения логов
const LogsViewer: React.FC = () => {
  const logs = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('deepseek_audit_logs') || '[]');
    } catch (e) {
      console.error('Ошибка при чтении логов DeepSeek:', e);
      return [];
    }
  }, []);
  
  if (logs.length === 0) {
    return <p className="text-muted-foreground">Нет доступных логов запросов к DeepSeek API.</p>;
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left text-sm">Время</th>
            <th className="px-4 py-2 text-left text-sm">Контекст</th>
            <th className="px-4 py-2 text-left text-sm">Решения</th>
            <th className="px-4 py-2 text-left text-sm">Уверенность</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log: any, index: number) => (
            <tr key={index} className={index % 2 ? 'bg-muted/50' : ''}>
              <td className="px-4 py-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="px-4 py-2 text-sm">{log.problemContext}</td>
              <td className="px-4 py-2 text-sm text-center">{log.solutionsCount}</td>
              <td className="px-4 py-2 text-sm text-center">{Math.round(log.topSolutionConfidence * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeepSeekDemo;
