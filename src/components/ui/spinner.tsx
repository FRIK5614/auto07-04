
import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "default", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-8 w-8": size === "lg",
        },
        "text-primary",
        className
      )}
      role="status"
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  );
}
