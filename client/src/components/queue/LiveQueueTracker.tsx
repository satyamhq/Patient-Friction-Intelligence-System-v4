import React, { useState, useEffect } from 'react';
import { queueService, QueueTokenData } from '../../services/queueService';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Ticket,
  RefreshCw,
  Building2,
  Stethoscope,
} from 'lucide-react';

interface LiveQueueTrackerProps {
  hospitalName?: string;
  department?: string;
  onTokenGenerated?: (token: QueueTokenData) => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  hospitalName = 'District Civil Hospital, Jalandhar',
  department = 'General Medicine OPD',
  onTokenGenerated,
}) => {
  const { showToast } = useToast();
  const [patientToken, setPatientToken] = useState<QueueTokenData | null>({
    id: 'tok-live-112',
    tokenNumber: 112,
    patientId: 'pat-sunita-01',
    patientName: 'Sunita Devi',
    hospitalId: 'hosp-civil-01',
    hospitalName,
    department,
    priority: 'STANDARD',
    status: 'WAITING',
    estimatedWaitMinutes: 24,
    patientsAhead: 8,
    issueTime: new Date().toISOString(),
  });
  const [currentlyServing, setCurrentlyServing] = useState<QueueTokenData | null>({
    id: 'tok-serv-104',
    tokenNumber: 104,
    patientId: 'pat-queue-104',
    patientName: 'Current Patient',
    hospitalId: 'hosp-civil-01',
    hospitalName,
    department,
    priority: 'STANDARD',
    status: 'SERVING',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
    issueTime: new Date().toISOString(),
  });
  const [waitingCount, setWaitingCount] = useState(8);
  const [estWait, setEstWait] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const parseSafeNumber = (val: any, fallback: number): number => {
    if (val === null || val === undefined || val === 'undefined' || val === 'NaN') return fallback;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const fetchQueue = async () => {
    try {
      const res = await queueService.getLiveQueue(undefined, department);
      if (res && res.success) {
        if (res.patientToken) {
          const rawToken = res.patientToken;
          setPatientToken({
            ...rawToken,
            tokenNumber: parseSafeNumber(rawToken.tokenNumber ?? (rawToken as any).token_number, 112),
          });
        }
        if (res.currentlyServing) {
          const rawServing = res.currentlyServing;
          setCurrentlyServing({
            ...rawServing,
            tokenNumber: parseSafeNumber(rawServing.tokenNumber ?? (rawServing as any).token_number, 104),
          });
        }
        if (Number.isFinite(res.waitingCount)) setWaitingCount(res.waitingCount);
        if (Number.isFinite(res.estimatedWaitMinutes)) setEstWait(res.estimatedWaitMinutes);
      }
    } catch {
      // Keep defaults
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Live poll every 15s
    return () => clearInterval(interval);
  }, [department]);

  const handleBookToken = async (priority: string = 'STANDARD') => {
    setIsBooking(true);
    try {
      const res = await queueService.issueToken({
        hospitalName,
        department,
        priority,
      });
      if (res && res.success) {
        const rawToken = res.token;
        const normalizedToken: QueueTokenData = {
          ...rawToken,
          tokenNumber: parseSafeNumber(rawToken?.tokenNumber ?? (rawToken as any)?.token_number, 115),
        };
        setPatientToken(normalizedToken);
        showToast(`Digital Token #${normalizedToken.tokenNumber} issued successfully!`, 'success');
        onTokenGenerated?.(normalizedToken);
      }
    } catch {
      showToast('Could not issue token. Please try again.', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  // Safe numerical calculations preventing any NaN or undefined
  const myTokenNum = patientToken
    ? parseSafeNumber(patientToken.tokenNumber ?? (patientToken as any).token_number, 112)
    : 112;

  const servingTokenNum = parseSafeNumber(
    currentlyServing?.tokenNumber ?? (currentlyServing as any)?.token_number,
    104
  );

  const rawAhead = myTokenNum - servingTokenNum;
  const aheadCount = Math.max(0, Number.isFinite(rawAhead) ? rawAhead : 8);
  const waitMinutes = Math.max(5, aheadCount * 3);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Live Digital OPD Queue Tracker
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hospitalName} • {department}
            </p>
          </div>
        </div>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Live Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Now Serving</span>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            #{servingTokenNum}
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Doctor In Consultation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Token</span>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {myTokenNum ? `#${myTokenNum}` : '-'}
          </p>
          <span className="text-[10px] text-teal-600 font-medium block mt-0.5">
            {patientToken ? (patientToken.status === 'SERVING' ? 'Your Turn Now!' : 'Confirmed') : 'Not Booked'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ahead of You</span>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {aheadCount}
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Patients in Queue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Est. Wait</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ~{waitMinutes} min
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Approximate Wait</span>
        </div>
      </div>

      {/* Queue Progress Bar */}
      {patientToken && (
        <div className="space-y-1.5 p-4 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-900/50">
          <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-200">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Queue Progress (Token #{myTokenNum || 112})
            </span>
            <span>
              {patientToken.status === 'SERVING' ? '🟢 Currently with Doctor' : '🟡 Waiting in OPD Lounge'}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(15, 100 - (aheadCount * 12))
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      {!patientToken ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Generate an instant digital queue token to skip physical registration lines at the facility.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleBookToken('STANDARD')}
              disabled={isBooking}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Ticket className="w-4 h-4" />
              Get OPD Digital Token
            </button>
            <button
              onClick={() => handleBookToken('EMERGENCY')}
              disabled={isBooking}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 transition-all disabled:opacity-50"
            >
              Priority / Triage
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Present this token on your mobile screen at Gate #3 OPD Desk.</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Token Active
          </span>
        </div>
      )}
    </div>
  );
};
