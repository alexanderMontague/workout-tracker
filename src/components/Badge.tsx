import { cn } from "../utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary";
}

export function Badge({
  children,
  className,
  variant = "primary",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "primary" && "bg-blue-100 text-blue-700",
        variant === "secondary" && "bg-zinc-100 text-zinc-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
