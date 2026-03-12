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
          className="font-sans text-sm font-semibold text-gray-900"
        >
          {label}
        </label>

        <input
          id={inputId}
          ref={ref}
          className={`min-h-[44px] w-full rounded-xl border bg-white px-4 py-3 font-sans text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 ${error ? "border-negative focus:border-negative focus:ring-negative" : "border-border"} ${className} `}
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
