import { cn } from "../utils/cn";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  multiline?: boolean;
  rows?: number;
}

export function Input({
  label,
  className,
  multiline,
  rows = 3,
  ...props
}: InputProps) {
  const inputClasses = cn(
    "w-full px-3 py-2 bg-transparent border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-zinc-400">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          className={inputClasses}
          rows={rows}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={inputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}
