import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};
