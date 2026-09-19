import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'emerald',
  onClick,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'group-hover:border-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'group-hover:border-amber-500',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'group-hover:border-blue-500',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'group-hover:border-purple-500',
      iconBg: 'bg-purple-100 text-purple-700',
    },
  };

  const c = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3.5 rounded-xl ${c.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.label || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};
