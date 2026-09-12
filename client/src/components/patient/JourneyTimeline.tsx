import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export interface JourneyStage {
  stageName: string;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED';
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedBarrier?: string;
  mitigationSuggestion?: string;
}

export const JourneyTimeline: React.FC<{
  stages: JourneyStage[];
  currentStageIndex?: number;
}> = ({ stages, currentStageIndex = 2 }) => {
  let parsedStages: JourneyStage[] = [];
  if (Array.isArray(stages)) {
    parsedStages = stages;
  } else if (typeof stages === 'string') {
    try {
      const parsed = JSON.parse(stages);
      if (Array.isArray(parsed)) {
        parsedStages = parsed;
      }
    } catch {
      parsedStages = [];
    }
  }

  if (!parsedStages || !Array.isArray(parsedStages) || parsedStages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            9-Stage Healthcare Journey Accessibility Flow
          </h4>
          <p className="text-xs text-slate-500">
            Visual non-clinical progression tracking where practical friction occurs
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
          Stage {currentStageIndex + 1} of {parsedStages.length}
        </span>
      </div>

      <div className="relative">
        <div className="space-y-4">
          {parsedStages.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isCompleted = stage.status === 'COMPLETED';
            const isAtRisk = stage.status === 'AT_RISK' || stage.frictionLevel === 'CRITICAL';

            return (
              <div
                key={stage.stageName}
                className={`relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-500/20 shadow-sm'
                    : isAtRisk
                    ? 'bg-rose-50/40 border-rose-200'
                    : isCompleted
                    ? 'bg-slate-50/60 border-slate-200'
                    : 'bg-white border-slate-100 opacity-70'
                }`}
              >
                {/* Stage Number & Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-teal-600 text-white animate-pulse'
                      : isAtRisk
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isAtRisk ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    stage.order
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-teal-900' : isAtRisk ? 'text-rose-900' : 'text-slate-800'
                      }`}
                    >
                      {stage.order}. {stage.stageName}
                    </h5>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        stage.frictionLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : stage.frictionLevel === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : stage.frictionLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {stage.frictionLevel} Friction
                    </span>
                  </div>

                  {stage.observedBarrier && (
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Observed Barrier:</strong> {stage.observedBarrier}
                    </p>
                  )}

                  {stage.mitigationSuggestion && (
                    <div className="text-[11px] font-medium text-teal-800 bg-teal-100/60 px-2.5 py-1 rounded-lg inline-block mt-1">
                      💡 <strong>Recommended Support:</strong> {stage.mitigationSuggestion}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
