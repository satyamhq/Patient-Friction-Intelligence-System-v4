import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['ACCEPTED', 'ACTIVE', 'COMPLETED', 'HEALTHY', 'LOW'].includes(normalized)) {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['UNDER_REVIEW', 'PENDING', 'MEDIUM', 'MODERATE', 'IN_PROGRESS', 'HOSPITAL_RECEIVED'].includes(normalized)) {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['HIGH', 'AT_RISK', 'REQUEST_SENT'].includes(normalized)) {
    bgClass = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (['REJECTED', 'CANCELLED', 'CRITICAL', 'COMPOUND_CRITICAL', 'BLOCKED', 'REVOKED'].includes(normalized)) {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${bgClass} ${sizeClass} tracking-wide transition-all`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {formatText(status)}
    </span>
  );
};
