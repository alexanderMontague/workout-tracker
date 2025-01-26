import { cn } from "../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      )}
      <input
        className={cn(
          "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 shadow-sm backdrop-blur-sm transition-colors placeholder:text-zinc-400",
          "focus:outline-none",
          "focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50",
          error &&
            "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
