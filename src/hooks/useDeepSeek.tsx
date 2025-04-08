
import { useState } from 'react';
import { 
  consultDeepSeek, 
  shouldActivateDeepSeek, 
  rankSolutions, 
  localKnowledgeBaseFallback,
  contextualizeRecommendation
} from '../services/deepseek';

interface UseDeepSeekOptions {
  autoActivate?: boolean;
  businessContext?: string;
}

interface DeepSeekSolution {
  solution: string;
  explanation: string;
  confidence: number;
  performance_impact?: string;
  security_level?: string;
}

export const useDeepSeek = (options: UseDeepSeekOptions = {}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [solutions, setSolutions] = useState<DeepSeekSolution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  
  /**
   * Получение экспертной консультации для решения проблемы
   */
  const getConsultation = async (
    problemContext: string,
    codeSnippets?: string[],
    historicalDecisions?: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверка условий активации, если autoActivate включен
      if (options.autoActivate && !shouldActivateDeepSeek(problemContext, codeSnippets)) {
        console.log('Условия для активации DeepSeek не выполнены');
        setSolutions([]);
        return [];
      }
      
      // Проверка лимита запросов (не более 50 в час)
      const hourlyRequestsKey = `deepseek_requests_${new Date().toISOString().slice(0, 13)}`;
      const hourlyRequests = parseInt(localStorage.getItem(hourlyRequestsKey) || '0');
      
      if (hourlyRequests >= 50) {
        setError('Превышен часовой лимит запросов к DeepSeek API (50 запросов/час)');
        const fallbackSolutions = localKnowledgeBaseFallback({
          context: problemContext,
          code_snippets: codeSnippets,
          historical_decisions: historicalDecisions
        });
        setSolutions(fallbackSolutions);
        return fallbackSolutions;
      }
      
      // Отправка запроса к API
      const apiSolutions = await consultDeepSeek({
        context: problemContext,
        code_snippets: codeSnippets,
        historical_decisions: historicalDecisions
      });
      
      // Обновление счетчика запросов
      localStorage.setItem(hourlyRequestsKey, (hourlyRequests + 1).toString());
      setRequestCount(prev => prev + 1);
      
      // Если получен null, используем резервный локальный метод
      let resultSolutions: DeepSeekSolution[];
      if (!apiSolutions) {
        resultSolutions = localKnowledgeBaseFallback({
          context: problemContext,
          code_snippets: codeSnippets,
          historical_decisions: historicalDecisions
        });
      } else {
        // Ранжирование решений
        resultSolutions = rankSolutions(apiSolutions);
        
        // Контекстуализация решений, если предоставлен бизнес-контекст
        if (options.businessContext) {
          resultSolutions = resultSolutions.map(solution => ({
            ...solution,
            solution: contextualizeRecommendation(solution, options.businessContext || '')
          }));
        }
      }
      
      setSolutions(resultSolutions);
      return resultSolutions;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Неизвестная ошибка';
      setError(errorMessage);
      
      // В случае ошибки, используем резервный локальный метод
      const fallbackSolutions = localKnowledgeBaseFallback({
        context: problemContext,
        code_snippets: codeSnippets, 
        historical_decisions: historicalDecisions
      });
      setSolutions(fallbackSolutions);
      return fallbackSolutions;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Аудит и логгирование запроса
   */
  const logConsultationRequest = (
    problemContext: string,
    solutions: DeepSeekSolution[]
  ) => {
    const log = {
      timestamp: new Date().toISOString(),
      problemContext: problemContext.substring(0, 100) + '...',
      solutionsCount: solutions.length,
      topSolutionConfidence: solutions[0]?.confidence || 0
    };
    
    // Сохранение лога в локальное хранилище для демонстрации
    const logs = JSON.parse(localStorage.getItem('deepseek_audit_logs') || '[]');
    logs.push(log);
    localStorage.setItem('deepseek_audit_logs', JSON.stringify(logs.slice(-50)));
    
    console.log('DeepSeek consultation logged:', log);
  };
  
  return {
    getConsultation,
    logConsultationRequest,
    loading,
    solutions,
    error,
    requestCount
  };
};
