import { HTMLAttributes } from 'react';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  action,
  className = '', 
  ...props 
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`} {...props}>
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
