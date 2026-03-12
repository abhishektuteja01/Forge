import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-black/[0.03] bg-white transition-all duration-300 shadow-premium ${className}`}
    >
      {/* Premium subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
