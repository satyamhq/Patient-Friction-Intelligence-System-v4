import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  trend?: string;
  trendPositive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/40 dark:border-teal-800',
  badge,
  badgeType = 'info',
  trend,
  trendPositive,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-teal-300 dark:hover:border-teal-700' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Top Title & Badge */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            {badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                  badgeType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : badgeType === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : badgeType === 'danger'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                }`}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Value without truncation */}
          <div className="pt-0.5">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {value}
            </h3>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
              {subtitle}
            </p>
          )}

          {trend && (
            <p
              className={`text-xs font-medium pt-1 flex items-center gap-1 ${
                trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <span>{trendPositive ? '↑' : '↓'}</span> {trend}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-2xl border ${iconColor} shrink-0 shadow-xs flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
