import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', accentColor, className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
      primary: accentColor
        ? `text-white shadow-lg hover:shadow-xl active:scale-95`
        : 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl active:scale-95',
      secondary: accentColor
        ? `bg-transparent text-zinc-900 border-2 hover:shadow-md active:scale-95`
        : 'bg-transparent text-zinc-900 border-2 border-zinc-300 hover:border-zinc-400 hover:shadow-md active:scale-95',
      ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200',
    };

    const style = accentColor && variant === 'primary' 
      ? { backgroundColor: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}40` }
      : accentColor && variant === 'secondary'
      ? { borderColor: accentColor, color: accentColor }
      : undefined;

    const focusRingColor = accentColor ? { '--tw-ring-color': accentColor } as React.CSSProperties : {};

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        style={{ ...style, ...focusRingColor }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
