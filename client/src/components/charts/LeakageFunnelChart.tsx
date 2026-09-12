import React from 'react';
import { ArrowDown, AlertTriangle } from 'lucide-react';

export interface Milestone {
  stageName: string;
  patientCount: number;
  retentionPercentage: number;
  dropOffCount: number;
  dropOffPercentage: number;
  primaryBarrierCausingDropOff: string;
}

export const LeakageFunnelChart: React.FC<{
  milestones: Milestone[];
  highestLeakageStage?: string;
}> = ({ milestones, highestLeakageStage }) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="space-y-4">
      {milestones.map((item, idx) => {
        const isHighest =
          highestLeakageStage &&
          highestLeakageStage.toLowerCase().includes(item.stageName.toLowerCase());

        return (
          <div key={item.stageName} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-800">{item.stageName}</span>
                {isHighest && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" /> Max Leakage Stage
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900 text-sm">{item.patientCount}</span>
                <span className="text-slate-400 text-xs ml-1">({item.retentionPercentage}% retained)</span>
              </div>
            </div>

            {/* Horizontal Retention Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  idx === 0
                    ? 'bg-teal-500'
                    : idx === 1
                    ? 'bg-teal-600'
                    : idx === 2
                    ? 'bg-emerald-500'
                    : idx === 3
                    ? 'bg-amber-500'
                    : idx === 4
                    ? 'bg-orange-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${item.retentionPercentage}%` }}
              />
            </div>

            {/* Drop-off Note if not the first stage */}
            {item.dropOffCount > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-7">
                <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                  <ArrowDown className="w-3 h-3 inline" /> Drop-off: {item.dropOffCount} patients (
                  {item.dropOffPercentage}%)
                </span>
                <span className="text-slate-500 italic truncate max-w-xs sm:max-w-md">
                  Barrier: {item.primaryBarrierCausingDropOff}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
