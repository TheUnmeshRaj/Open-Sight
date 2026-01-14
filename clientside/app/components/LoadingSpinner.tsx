"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-spin" />
      <div className="absolute inset-1 bg-slate-900 rounded-full" />
    </div>
  );
};

export default LoadingSpinner;
