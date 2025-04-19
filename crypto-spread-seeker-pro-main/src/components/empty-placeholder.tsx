import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyPlaceholderProps {
  className?: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function EmptyPlaceholder({
  className,
  title,
  description,
  icon: Icon,
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-background p-8 text-center animate-in fade-in-50 dark:border-gray-800",
        className
      )}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
} 