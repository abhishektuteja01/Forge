import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white border border-border rounded-2xl p-6 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
