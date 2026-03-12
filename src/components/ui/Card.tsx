import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`border-2 border-gray-900 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
};
