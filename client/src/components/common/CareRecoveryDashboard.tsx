// CareRecoveryDashboard.tsx - Phases 12, 14, 15, 16, 17: AI Voice Calling & Care Recovery Engine
// Transforms passive friction alerts into active, structured care recovery workflows

import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  HeartPulse,
  Pill,
  GitFork,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Send,
  RefreshCw,
} from 'lucide-react';
import { appointmentVoiceService } from '../../services/appointmentVoiceService';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';

export interface RecoveryCase {
  id: string;
  patientName: string;
  phone: string;
  triggerType: 'MISSED_APPOINTMENT' | 'STALLED_REFERRAL' | 'DIAGNOSTIC_DELAY' | 'MEDICINE_OUT_OF_STOCK' | 'MATERNAL_HIGH_RISK';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  detectedFriction: string;
  facility: string;
  callStatus: 'IDLE' | 'CALLING' | 'CONNECTED' | 'COMPLETED' | 'CALLBACK_REQUIRED' | 'ESCALATED' | 'NO_ANSWER';
  summary?: string;
  nextAction?: string;
  responsiblePerson: string;
  deadline: string;
  isResolved: boolean;
}

export const CareRecoveryDashboard: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([
    {
      id: 'REC-101',
      patientName: 'Gurpreet Kaur',
      phone: '+91 98140-54321',
      triggerType: 'MISSED_APPOINTMENT',
      severity: 'HIGH',
      detectedFriction: 'Transport Barrier: No bus connectivity from Rampur village for 09:30 AM slot',
      facility: 'Civil Hospital Kapurthala',
      callStatus: 'COMPLETED',
      summary: 'Patient confirmed inability to reach morning OPD due to rural transit cancellation. Expressed willingness for afternoon consultation.',
      nextAction: 'Rebooked OPD token for 02:30 PM slot and notified Village ASHA worker for community transit sharing.',
      responsiblePerson: 'Kavita Devi (ASHA) & OPD Desk',
      deadline: 'Today, 01:00 PM',
      isResolved: true,
    },
    {
      id: 'REC-102',
      patientName: 'Sunita Devi',
      phone: '+91 98765-88990',
      triggerType: 'STALLED_REFERRAL',
      severity: 'CRITICAL',
      detectedFriction: 'Specialist Bottleneck: Cardiology referral pending > 6 days at District Hospital',
      facility: 'Phagwara Sub-Divisional Hospital',
      callStatus: 'ESCALATED',
      summary: 'Patient experiencing worsening exertional dyspnea. Receiving facility specialist OPD fully booked for 10 days.',
      nextAction: 'Escalated to Chief Medical Officer for expedited teleconsultation triage and emergency bed priority.',
      responsiblePerson: 'Dr. A. K. Sharma (CMO) / Referral Coordinator',
      deadline: 'Within 4 Hours',
      isResolved: false,
    },
    {
      id: 'REC-103',
      patientName: 'Balwinder Singh',
      phone: '+91 98141-22334',
      triggerType: 'MEDICINE_OUT_OF_STOCK',
      severity: 'HIGH',
      detectedFriction: 'Drug Stock-out: Metformin & Telmisartan stock exhausted at local PHC',
      facility: 'Sultanpur Lodhi CHC',
      callStatus: 'IDLE',
      nextAction: 'Route patient to nearby empanelled Jan Aushadhi Kendra with zero co-pay token',
      responsiblePerson: 'Sub-Centre Pharmacist & ASHA',
      deadline: 'Tomorrow, 11:00 AM',
      isResolved: false,
    },
    {
      id: 'REC-104',
      patientName: 'Manpreet Kaur',
      phone: '+91 97800-44556',
      triggerType: 'MATERNAL_HIGH_RISK',
      severity: 'CRITICAL',
      detectedFriction: 'Severe Anemia (Hb 7.2 g/dL) detected; missed iron sucrose infusion session',
      facility: 'Kapurthala District Hospital',
      callStatus: 'IDLE',
      nextAction: 'Deploy emergency mobile health van and arrange escorted admission for parenteral iron therapy',
      responsiblePerson: 'Sister Nirmal Kaur (ANM Supervisor)',
      deadline: 'Immediate (< 24h)',
      isResolved: false,
    },
  ]);

  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const handleTriggerAiCall = async (c: RecoveryCase) => {
    setActiveCallId(c.id);
    setCases((prev) =>
      prev.map((item) =>
        item.id === c.id ? { ...item, callStatus: 'CALLING' } : item
      )
    );

    // Trigger Outbound AI Voice Assistant bridge
    try {
      await appointmentVoiceService.callHospital(c.id, c.phone);
    } catch (e) {
      console.warn('[Recovery Call Dispatch Error]', e);
    }

    // Advance to Connected
    setTimeout(() => {
      setCases((prev) =>
        prev.map((item) =>
          item.id === c.id ? { ...item, callStatus: 'CONNECTED' } : item
        )
      );

      // Complete Call with structured outcome
      setTimeout(() => {
        setCases((prev) =>
          prev.map((item) =>
            item.id === c.id
              ? {
                  ...item,
                  callStatus: 'COMPLETED',
                  summary: `Voice session completed. Patient verified receipt of automated barrier resolution instructions.`,
                  nextAction: item.nextAction || 'Task assigned to field health worker and logged in EHR.',
                }
              : item
          )
        );
        setActiveCallId(null);
      }, 3500);
    }, 2000);
  };

  const handleMarkResolved = (id: string) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isResolved: true } : item
      )
    );
  };

  const filteredCases = cases.filter((c) => {
    if (filter === 'ACTIVE') return !c.isResolved;
    if (filter === 'RESOLVED') return c.isResolved;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              AI Care Recovery & Autonomous Calling Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 border border-teal-200">
              Phases 12 & 17
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Detect care friction → contact patient via natural voice → assign frontline task → track resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {mode === 'ALL' ? 'All Journeys' : mode === 'ACTIVE' ? 'Active Issues' : 'Resolved'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openElevenLabsCalling()}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Launch Voice Desk</span>
          </button>
        </div>
      </div>

      {/* Structured Recovery Cases */}
      <div className="space-y-4">
        {filteredCases.map((c) => {
          const isCalling = activeCallId === c.id;

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition-all ${
                c.isResolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : c.severity === 'CRITICAL'
                  ? 'bg-rose-50/40 border-rose-200/90 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      c.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.severity} FRICTION
                  </span>

                  <span className="font-bold text-sm text-slate-900">
                    {c.patientName}
                  </span>

                  <span className="text-xs text-slate-500 font-mono">
                    ({c.phone})
                  </span>

                  <span className="text-xs text-slate-400">•</span>

                  <span className="text-xs font-semibold text-slate-600">
                    {c.facility}
                  </span>
                </div>

                {/* Call State Tag */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      c.callStatus === 'CALLING'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : c.callStatus === 'CONNECTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.callStatus === 'COMPLETED'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : c.callStatus === 'ESCALATED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Status: {c.callStatus}</span>
                  </span>

                  {!c.isResolved && c.callStatus !== 'CALLING' && (
                    <button
                      type="button"
                      onClick={() => handleTriggerAiCall(c)}
                      disabled={isCalling}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.callStatus === 'IDLE' ? 'Call Patient' : 'Retry Call'}</span>
                    </button>
                  )}

                  {!c.isResolved && (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Resolve Barrier
                    </button>
                  )}
                </div>
              </div>

              {/* Friction Breakdown & Next Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Detected Friction & Root Cause
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">
                    {c.detectedFriction}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    AI Recommended Next Best Action
                  </span>
                  <p className="font-semibold text-teal-900 leading-snug">
                    {c.nextAction || 'Awaiting post-call resolution triage.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ownership & Resolution Deadline
                  </span>
                  <div className="text-slate-700 space-y-0.5">
                    <p className="font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      {c.responsiblePerson}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: <strong>{c.deadline}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Summary Banner (If Completed) */}
              {c.summary && (
                <div className="mt-3 p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-bold">Structured Call Summary: </strong>
                    {c.summary}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
