
import { toast } from '@/hooks/use-toast';

// Типы для запросов и ответов DeepSeek API
interface DeepSeekRequest {
  context: string;
  code_snippets?: string[];
  historical_decisions?: string[];
  metadata?: Record<string, any>;
}

interface DeepSeekResponse {
  solutions: DeepSeekSolution[];
  metadata?: Record<string, any>;
}

interface DeepSeekSolution {
  solution: string;
  explanation: string;
  confidence: number;
  performance_impact?: string;
  security_level?: string;
}

/**
 * Условия, при которых нужно активировать консультацию с DeepSeek
 */
export const shouldActivateDeepSeek = (
  context: string,
  codeSnippets?: string[],
): boolean => {
  // Проверка на наличие устаревших PHP функций
  const hasDeprecatedPhpFunctions = codeSnippets?.some(snippet => 
    /mysql_[a-z_]+\(/i.test(snippet)
  );
  
  // Проверка на наличие упоминаний экзотических технологий
  const hasExoticTech = /мейнфрейм|mainframe|COBOL|JCL|CICS|IMS DB/i.test(context);
  
  // Проверка на наличие признаков неопределенности в требованиях
  const hasAmbiguousRequirements = /неясно|не определено|уточнить|противоречиво/i.test(context);
  
  return !!hasDeprecatedPhpFunctions || hasExoticTech || hasAmbiguousRequirements;
};

/**
 * Основная функция для консультации с DeepSeek API
 */
export const consultDeepSeek = async (
  request: DeepSeekRequest
): Promise<DeepSeekSolution[] | null> => {
  try {
    // Для отображения сообщения о запросе к DeepSeek
    toast({
      title: "Консультация с DeepSeek",
      description: "Отправляем запрос к экспертной системе...",
    });
    
    const response = await fetch('https://api.deepseek.com/v1/consult', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-b5d895ce1ba24fa8b2d893a99b978216',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      toast({
        title: "Ошибка DeepSeek",
        description: "Не удалось получить ответ от экспертной системы. Используем локальную базу знаний.",
        variant: "destructive",
      });
      return null;
    }
    
    const data: DeepSeekResponse = await response.json();
    
    toast({
      title: "Получены рекомендации DeepSeek",
      description: `${data.solutions.length} решений предложено экспертной системой.`,
    });
    
    return data.solutions;
  } catch (error) {
    console.error('Error consulting DeepSeek:', error);
    toast({
      title: "Ошибка DeepSeek",
      description: `${(error as Error).message || "Неизвестная ошибка"}. Используем локальную базу знаний.`,
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Ранжирование решений по производительности и безопасности
 */
export const rankSolutions = (
  solutions: DeepSeekSolution[]
): DeepSeekSolution[] => {
  return [...solutions].sort((a, b) => {
    // Примерный алгоритм ранжирования на основе уверенности
    // и дополнительных критериев безопасности и производительности
    const securityWeightA = a.security_level === 'high' ? 2 : 
                          a.security_level === 'medium' ? 1 : 0;
    const securityWeightB = b.security_level === 'high' ? 2 : 
                          b.security_level === 'medium' ? 1 : 0;
                          
    const perfWeightA = a.performance_impact === 'positive' ? 1 : 
                      a.performance_impact === 'negative' ? -1 : 0;
    const perfWeightB = b.performance_impact === 'positive' ? 1 : 
                      b.performance_impact === 'negative' ? -1 : 0;
    
    const scoreA = a.confidence + securityWeightA + perfWeightA;
    const scoreB = b.confidence + securityWeightB + perfWeightB;
    
    return scoreB - scoreA; // Сортировка по убыванию
  });
};

/**
 * Адаптация общих рекомендаций под конкретную бизнес-логику
 */
export const contextualizeRecommendation = (
  solution: DeepSeekSolution,
  businessContext: string
): string => {
  // В реальности здесь можно было бы использовать еще один запрос к API
  // для адаптации общего решения к конкретному контексту
  return `${solution.solution}\n\nВ контексте вашего бизнеса "${businessContext.substring(0, 100)}...": 
    ${solution.explanation}`;
};

/**
 * Локальная резервная функция при недоступности DeepSeek API
 */
export const localKnowledgeBaseFallback = (
  request: DeepSeekRequest
): DeepSeekSolution[] => {
  console.log('Using local knowledge base fallback instead of DeepSeek');
  
  // Примитивная база общих рекомендаций
  const commonSolutions = [
    {
      solution: "Рекомендуется использовать современные PDO или mysqli вместо устаревших mysql_* функций",
      explanation: "mysql_* функции устарели с PHP 5.5 и удалены в PHP 7",
      confidence: 0.95,
      security_level: "high",
      performance_impact: "positive"
    },
    {
      solution: "Для state management в React рекомендуем Redux Toolkit для сложных состояний или React Context для простых",
      explanation: "Redux Toolkit обеспечивает более структурированный подход при большом количестве состояний",
      confidence: 0.85,
      performance_impact: "positive"
    }
  ];
  
  return commonSolutions;
};
