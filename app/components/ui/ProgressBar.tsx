import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
  color?: string;
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  className = "",
  color = "#3b82f6", // blue-500
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-zinc-600 mb-2">
          <span>Progress</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
