import { HTMLAttributes } from 'react';

export interface StatChipProps extends HTMLAttributes<HTMLDivElement> {
  icon: string;
  label: string;
  value: string | number;
  accentColor?: string;
}

export function StatChip({ 
  icon, 
  label, 
  value, 
  accentColor,
  className = '', 
  ...props 
}: StatChipProps) {
  const bgColor = accentColor ? `${accentColor}15` : '#f4f4f5';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 ${className}`}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-zinc-600 font-medium">{label}</span>
        <span className="text-lg font-bold" style={{ color: accentColor || '#18181b' }}>
          {value}
        </span>
      </div>
    </div>
  );
}
