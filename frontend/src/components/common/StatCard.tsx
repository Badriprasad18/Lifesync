import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  colorScheme?: 'teal' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan';
  onClick?: () => void;
}

const colorStyles = {
  teal: {
    iconBg: 'bg-teal-500/10 text-teal-400 dark:text-teal-400 text-teal-600',
    border: 'hover:border-teal-500/40',
  },
  violet: {
    iconBg: 'bg-violet-500/10 text-violet-400 dark:text-violet-400 text-violet-600',
    border: 'hover:border-violet-500/40',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 text-emerald-600',
    border: 'hover:border-emerald-500/40',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 dark:text-amber-400 text-amber-600',
    border: 'hover:border-amber-500/40',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-400 dark:text-rose-400 text-rose-600',
    border: 'hover:border-rose-500/40',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 dark:text-cyan-400 text-cyan-600',
    border: 'hover:border-cyan-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'cyan',
  onClick,
}) => {
  const currentStyle = colorStyles[colorScheme] || colorStyles.cyan;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 transition-all duration-200 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-lg dark:hover:shadow-glow-teal/10 ${
        onClick ? 'cursor-pointer' : ''
      } ${currentStyle.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  trend.positive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
