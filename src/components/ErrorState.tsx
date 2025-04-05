
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ 
  message = "Произошла ошибка при загрузке данных", 
  onRetry 
}: ErrorStateProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="mt-0">Ошибка</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="mt-2 w-auto self-start"
          >
            Попробовать снова
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;
