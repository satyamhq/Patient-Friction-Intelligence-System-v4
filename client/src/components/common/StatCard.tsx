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
  iconColor = 'text-teal-600 bg-teal-50 border-teal-100',
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
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-teal-300' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Top Title & Badge */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            {badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                  badgeType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : badgeType === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : badgeType === 'danger'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Value without truncation */}
          <div className="pt-0.5">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {value}
            </h3>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
              {subtitle}
            </p>
          )}

          {trend && (
            <p
              className={`text-xs font-medium pt-1 flex items-center gap-1 ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
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
