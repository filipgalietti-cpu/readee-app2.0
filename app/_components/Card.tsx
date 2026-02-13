import { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  accentColor?: string;
}

export function Card({ 
  variant = 'default', 
  accentColor, 
  className = '', 
  children, 
  ...props 
}: CardProps) {
  const baseClasses = 'rounded-3xl bg-white transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-zinc-200 shadow-sm',
    elevated: 'shadow-lg hover:shadow-xl',
    bordered: accentColor ? 'border-2' : 'border-2 border-zinc-300',
  };

  const style = accentColor && variant === 'bordered'
    ? { borderColor: accentColor }
    : undefined;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
