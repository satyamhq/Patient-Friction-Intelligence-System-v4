import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { TimelineEvent } from '../../types';

export const RequestTimeline: React.FC<{
  currentStatus: string;
  timeline: TimelineEvent[] | string | undefined;
}> = ({ currentStatus, timeline: rawTimeline }) => {
  // Safely coerce timeline: may arrive as JSON string from SQLite layer
  let timeline: TimelineEvent[] = [];
  if (Array.isArray(rawTimeline)) {
    timeline = rawTimeline;
  } else if (typeof rawTimeline === 'string') {
    try { timeline = JSON.parse(rawTimeline); } catch { timeline = []; }
  }
  const steps = [
    { key: 'REQUEST_CREATED', label: 'Request Created' },
    { key: 'CONSENT_GIVEN', label: 'Consent Given' },
    { key: 'REQUEST_SENT', label: 'Request Sent' },
    { key: 'HOSPITAL_RECEIVED', label: 'Hospital Received' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ACCEPTED', label: 'Accepted / Scheduled' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStepIndex = (st: string) => {
    if (st === 'APPOINTMENT_SCHEDULED' || st === 'ACCEPTED') return 5;
    if (st === 'REJECTED' || st === 'CANCELLED') return 4;
    return steps.findIndex((s) => s.key === st);
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Request Progression Workflow</h4>
        <p className="text-xs text-slate-500">Live timeline from patient consent to hospital confirmation</p>
      </div>

      {/* Stepper Dots Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const isPassed = idx <= currentIdx && currentStatus !== 'REJECTED';
          const isCurrent = idx === currentIdx;
          const isRejected = currentStatus === 'REJECTED' && idx === 5;

          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isRejected
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : isCurrent
                  ? 'bg-teal-50 border-teal-400 text-teal-900 font-bold ring-2 ring-teal-500/20'
                  : isPassed
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex justify-center mb-1">
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                ) : isRejected ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-[10px] leading-tight line-clamp-2">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Event Log */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Event History Log</h5>
        <div className="space-y-2">
          {timeline.map((evt, i) => (
            <div key={i} className="flex items-start gap-3 text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                    {evt.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                {evt.note && <p className="text-slate-600 text-[11px] mt-0.5">{evt.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
