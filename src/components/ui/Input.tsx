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
          className={`focus:border-primary min-h-[44px] w-full rounded-none border-2 bg-white px-4 py-3 font-sans text-gray-900 transition-colors duration-200 outline-none placeholder:text-gray-400 focus:ring-0 ${error ? "border-negative focus:border-negative" : "border-gray-900"} ${className} `}
          {...props}
        />

        {error && (
          <p className="text-negative text-sm font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
