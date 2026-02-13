import { HTMLAttributes } from 'react';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = false, 
  accentColor,
  size = 'md',
  className = '', 
  ...props 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const bgColor = accentColor || '#10b981'; // emerald-500 as default

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className={`w-full bg-zinc-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: bgColor,
            boxShadow: `0 0 8px ${bgColor}40`
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-zinc-600 font-medium">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
