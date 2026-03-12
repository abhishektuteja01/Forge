import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Generate an ID if one isn't passed mapping label to HTML 'for'
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-2 flex flex-col items-start">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-900 font-sans"
        >
          {label}
        </label>
        
        <input
          id={inputId}
          ref={ref}
          className={`
            w-full px-4 py-3 min-h-[44px] rounded-xl border bg-white text-gray-900 font-sans
            transition-colors duration-200 outline-none
            focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:border-primary
            placeholder:text-gray-400
            ${error ? "border-negative focus:ring-negative focus:border-negative" : "border-border"}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-negative font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
