import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClass =
      "inline-flex justify-center items-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Size variations mapping (keeping 44px min-height for touch targets per PRD)
    const sizeMap = {
      sm: "px-3 py-2 text-sm min-h-[44px]",
      md: "px-6 py-3 text-base min-h-[48px]",
      lg: "px-8 py-4 text-lg min-h-[56px]",
    };

    // Variant mapping
    const variantMap = {
      primary:
        "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500 shadow-sm hover:shadow active:scale-[0.98]",
      secondary:
        "bg-white text-gray-900 border-2 border-border hover:bg-gray-50 focus:ring-gray-200 active:scale-[0.98]",
      danger:
        "bg-negative text-white hover:bg-red-600 focus:ring-red-500 shadow-sm active:scale-[0.98]",
      ghost:
        "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClass} 
          ${sizeMap[size]} 
          ${variantMap[variant]} 
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="opacity-0">{children}</span> {/* Keeps layout stable */}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
