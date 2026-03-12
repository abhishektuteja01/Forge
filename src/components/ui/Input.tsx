import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Generate an ID if one isn't passed mapping label to HTML 'for'
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex w-full flex-col items-start space-y-2">
        <label
          htmlFor={inputId}
          className="font-sans text-sm font-semibold text-foreground"
        >
          {label}
        </label>

        <input
          id={inputId}
          ref={ref}
          className={`placeholder:text-slate-400 min-h-[44px] w-full rounded-2xl border bg-white px-4 py-3 font-sans text-slate-900 outline-none transition-all duration-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 ${error ? "border-negative focus:border-negative focus:ring-negative/10" : "border-slate-200 hover:border-slate-300"} ${className} `}
          {...props}
        />

        {error && (
          <p className="text-sm font-medium text-negative" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
