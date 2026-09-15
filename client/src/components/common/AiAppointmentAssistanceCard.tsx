import React from 'react';
import { Ambulance, Phone, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onOpen108Emergency: () => void;
  onOpenAiAssistance: () => void;
  className?: string;
  variant?: 'horizontal' | 'stacked';
}

export const AiAppointmentAssistanceCard: React.FC<Props> = ({
  onOpen108Emergency,
  onOpenAiAssistance,
  className = '',
  variant = 'horizontal',
}) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-md p-4 sm:p-5 flex flex-col ${
        variant === 'horizontal' ? 'lg:flex-row' : ''
      } gap-4 items-stretch justify-between ${className}`}
    >
      {/* 1. Emergency Section - Visual Division */}
      <div className="flex-1 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50/70 border border-red-200 p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-white px-2 py-0.5 rounded-full border border-red-200 inline-block mb-0.5">
              108 Emergency
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              For Immediate Emergencies
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Trauma, cardiac distress, or acute life-threatening symptoms.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen108Emergency}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black shrink-0 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer select-none"
          title="Emergency 108 SOS Paramedic Dispatch"
        >
          <Ambulance className="w-3.5 h-3.5 shrink-0" />
          <span className="font-extrabold tracking-wider whitespace-nowrap">108 SOS</span>
        </button>
      </div>

      {/* Visual Down Arrow for Stacked View or Divider */}
      <div className="hidden lg:flex items-center justify-center text-slate-300 font-bold px-1">
        →
      </div>

      {/* 2. AI Call & Appointment Assistance Section */}
      <div className="flex-1 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50/70 border border-teal-200 p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-lg leading-none" role="img" aria-label="phone">📞</span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-white px-2 py-0.5 rounded-full border border-teal-200 inline-flex items-center gap-1 mb-0.5">
              <Sparkles className="w-2.5 h-2.5 text-teal-600" />
              AI Call & Appointment
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              Get help booking, rescheduling, or finding a healthcare appointment.
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Non-clinical voice guidance with hospital directory & OPD slot registration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAiAssistance}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shrink-0 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer select-none"
          title="Open AI Call & Appointment Assistance"
        >
          <span>Talk to AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
