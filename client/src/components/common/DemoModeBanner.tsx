import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const DemoModeBanner: React.FC<{ message?: string }> = ({
  message = 'Non-Clinical Healthcare Access & Logistics Platform: Identifies practical transit, cost, and documentation barriers. Does not diagnose diseases or provide clinical advice.',
}) => {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-4 flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-1.5 sm:gap-2 text-center leading-snug">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
        <span className="font-medium tracking-normal sm:tracking-wide">
          <strong className="text-teal-300">PFIS:</strong> {message}
        </span>
      </div>
    </div>
  );
};

