import React from "react";
import { cn } from "../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/60 p-6 backdrop-blur-sm border border-zinc-800/50 shadow-xl",
        className
      )}
      {...props}
    >
      <div className={cn("z-20", className)}>{children}</div>
      <div className="pointer-events-none absolute inset-0 -translate-y-full animate-[shimmer_4s_infinite] bg-gradient-to-t from-transparent via-zinc-800/10 to-transparent" />
    </div>
  );
}
