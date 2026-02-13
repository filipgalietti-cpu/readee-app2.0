import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'info' | 'warning';
  accentColor?: string;
}

export function Badge({ 
  variant = 'default', 
  accentColor, 
  className = '', 
  children, 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold';
  
  const variantClasses = {
    default: 'bg-zinc-100 text-zinc-700',
    success: 'bg-emerald-100 text-emerald-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  const style = accentColor
    ? { backgroundColor: `${accentColor}20`, color: accentColor }
    : undefined;

  return (
    <div
      className={`${baseClasses} ${accentColor ? '' : variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
