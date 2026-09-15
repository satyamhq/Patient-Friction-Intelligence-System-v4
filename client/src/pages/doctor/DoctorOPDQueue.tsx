import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import {
  Activity, Users, Clock, CheckCircle2, SkipForward,
  UserX, Stethoscope, RefreshCw, AlertTriangle, ChevronRight,
  Phone, Play,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING:         { label: 'Waiting',         color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  SERVING:         { label: 'In Consultation', color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200' },
  CALLED:          { label: 'Called',          color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  COMPLETED:       { label: 'Completed',       color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
  SKIPPED:         { label: 'Skipped',         color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  NO_SHOW:         { label: 'No Show',         color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200' },
};

const PRIORITY_COLOR: Record<string, string> = {
  EMERGENCY: 'bg-red-100 text-red-700 border-red-200',
  URGENT:    'bg-orange-100 text-orange-700 border-orange-200',
  HIGH:      'bg-amber-100 text-amber-700 border-amber-200',
  STANDARD:  'bg-slate-100 text-slate-600 border-slate-200',
  FOLLOW_UP: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const DoctorOPDQueue: React.FC = () => {
  const { showToast } = useToast();
  const [queueData, setQueueData]   = useState<any>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [actionId, setActionId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await doctorService.getQueue();
      setQueueData(res.data);
    } catch { /* demo fallback handled by backend */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15 s
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleCallNext = async () => {
    try {
      setActionId('next');
      await doctorService.callNext();
      showToast('Next patient called!', 'success');
      load();
    } catch { showToast('No patients waiting in queue.', 'error'); }
    finally { setActionId(null); }
  };

  const handleAction = async (
    action: 'call' | 'skip' | 'noshow' | 'complete',
    id: string,
    tokenNum?: number,
  ) => {
    try {
      setActionId(id + action);
      if (action === 'call')     await doctorService.callToken(id);
      if (action === 'skip')     await doctorService.skipToken(id);
      if (action === 'noshow')   await doctorService.markNoShow(id);
      if (action === 'complete') await doctorService.completeToken(id);
      showToast(`Token #${tokenNum} — ${action} done.`, 'success');
      load();
    } catch { showToast('Action failed. Please retry.', 'error'); }
    finally { setActionId(null); }
  };

  const serving     = queueData?.currentlyServing;
  const waiting     = queueData?.waitingList || [];
  const allTokens   = queueData?.tokens || [];
  const isDemo      = queueData?.isDemo;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Live OPD Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage patient flow, call tokens, and launch consultations.</p>
        </div>
        <div className="flex gap-2">
          {isDemo && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
              DEMO DATA
            </span>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleCallNext}
            disabled={actionId === 'next'}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-60"
          >
            <Phone className="w-4 h-4" /> Call Next
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Waiting',    value: queueData?.waitingList?.length ?? waiting.length, icon: <Clock className="w-4 h-4 text-amber-500" />,    bg: 'bg-amber-50 border-amber-200' },
          { label: 'Avg. Wait', value: `${queueData?.avgWaitMinutes ?? 14}m`,              icon: <Activity className="w-4 h-4 text-teal-500" />,    bg: 'bg-teal-50 border-teal-200' },
          { label: 'Completed', value: queueData?.completedToday ?? 7,                     icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Delayed',   value: queueData?.delayedPatients ?? 1,                    icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-50 border-rose-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.bg} flex items-center gap-3`}>
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">{s.icon}</div>
            <div>
              <p className="text-xl font-black text-slate-900">{isLoading ? '…' : s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Currently Serving */}
      {serving && (
        <div className="bg-teal-600 rounded-3xl p-5 text-white shadow-xl shadow-teal-600/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-200">Now In Consultation</span>
              <h2 className="text-2xl font-extrabold">
                Token #{serving.tokenNumber ?? serving.token_number}: {serving.patientName ?? serving.patient_name}
              </h2>
              <p className="text-teal-100 text-sm">{serving.visitReason ?? serving.visit_reason ?? 'OPD Visit'} • {serving.department}</p>
            </div>
            <Link
              to={`/doctor/consultation?patient=${encodeURIComponent(serving.patientName ?? serving.patient_name ?? '')}&token=${serving.tokenNumber ?? serving.token_number}`}
              className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white text-teal-700 font-extrabold text-sm rounded-2xl shadow hover:bg-teal-50 transition-all"
            >
              <Stethoscope className="w-4 h-4" /> Open Consultation Desk
            </Link>
          </div>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Patient Queue ({waiting.length} waiting)
          </h3>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading queue…</div>
        ) : waiting.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-teal-300 mx-auto" />
            <p className="font-semibold text-slate-500">No patients are currently waiting.</p>
            <p className="text-xs text-slate-400">The queue is clear. Great work!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Token', 'Patient', 'Visit Reason', 'Priority', 'Status', 'Wait', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waiting.map((t: any) => {
                  const id      = t.id || t._id;
                  const status  = STATUS_CONFIG[t.status] || STATUS_CONFIG.WAITING;
                  const issued  = new Date(t.issueTime || t.issue_time || Date.now());
                  const waitMin = Math.round((Date.now() - issued.getTime()) / 60000);
                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-black text-slate-900">
                        #{t.tokenNumber ?? t.token_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{t.patientName ?? t.patient_name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{t.visitReason ?? t.visit_reason ?? 'OPD Visit'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.STANDARD}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{waitMin}m</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            title="Call Patient"
                            onClick={() => handleAction('call', id, t.tokenNumber ?? t.token_number)}
                            disabled={!!actionId}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            title="Open Consultation"
                            to={`/doctor/consultation?patient=${encodeURIComponent(t.patientName ?? t.patient_name ?? '')}&token=${t.tokenNumber ?? t.token_number}&queueId=${id}`}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            title="Skip"
                            onClick={() => handleAction('skip', id, t.tokenNumber ?? t.token_number)}
                            disabled={!!actionId}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors disabled:opacity-50"
                          >
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="No Show"
                            onClick={() => handleAction('noshow', id, t.tokenNumber ?? t.token_number)}
                            disabled={!!actionId}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
