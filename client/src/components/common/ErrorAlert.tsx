import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert: React.FC<{
  message: string;
  onDismiss?: () => void;
  className?: string;
}> = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-rose-800 flex items-start justify-between gap-3 text-sm ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-rose-900 text-xs uppercase tracking-wide">Error Notice</p>
          <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
