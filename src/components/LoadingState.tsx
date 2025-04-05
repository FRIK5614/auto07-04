
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  count?: number;
  type?: "card" | "list" | "details";
}

const LoadingState = ({ count = 4, type = "card" }: LoadingStateProps) => {
  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <div className="space-y-2">
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
                <div className="pt-2 flex justify-between">
                  <Skeleton className="w-1/3 h-6" />
                  <Skeleton className="w-1/4 h-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex bg-white rounded-lg shadow overflow-hidden">
              <Skeleton className="w-40 h-40" />
              <div className="flex-1 p-4 space-y-3">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-full h-3" />
                </div>
                <div className="pt-4 flex justify-between">
                  <Skeleton className="w-1/3 h-6" />
                  <div className="flex space-x-2">
                    <Skeleton className="w-24 h-8 rounded-md" />
                    <Skeleton className="w-24 h-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (type === "details") {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-64 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingState;
