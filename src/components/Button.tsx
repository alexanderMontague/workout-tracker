import React from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        {
          "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed":
            variant === "primary",
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-500 disabled:cursor-not-allowed":
            variant === "secondary",
          "hover:bg-zinc-800/50 text-zinc-100 disabled:text-zinc-500 disabled:hover:bg-transparent disabled:cursor-not-allowed":
            variant === "ghost",
        },
        {
          "text-sm px-3 py-2": size === "sm",
          "px-4 py-2": size === "md",
          "text-lg px-6 py-3": size === "lg",
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
