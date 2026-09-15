import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  HeartHandshake,
  Calendar,
  Ticket,
  Clock,
  ShieldAlert,
  GitFork,
  Users,
  CheckCircle2,
  PhoneCall,
  MapPin,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AshaFrontlineDesk: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDeskData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, visitsRes, statsRes] = await Promise.allSettled([
        ashaService.getTasks(),
        ashaService.getVisits(),
        ashaService.getDashboardStats(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value.success) setTasks(tasksRes.value.tasks || []);
      if (visitsRes.status === 'fulfilled' && visitsRes.value.success) setVisits(visitsRes.value.visits || []);
      if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.stats);
    } catch {
      showToast('Failed to load frontline desk.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeskData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Operational Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Frontline Worker Operational Desk
          </h1>
          <p className="text-xs text-slate-500">
            Rapid service coordination, citizen assistance requests, and field dispatch workflows
          </p>
        </div>

        <button
          onClick={loadDeskData}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Access Launchpad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/asha/opd-tokens"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group text-left space-y-2"
        >
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-sm text-slate-900 block">Generate OPD Token</strong>
            <span className="text-[11px] text-slate-500 block">Assisted queue token for hospital</span>
          </div>
        </Link>

        <Link
          to="/asha/appointments"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group text-left space-y-2"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-sm text-slate-900 block">Book Appointment</strong>
            <span className="text-[11px] text-slate-500 block">Direct booking on shared platform</span>
          </div>
        </Link>

        <Link
          to="/asha/access-barriers"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group text-left space-y-2"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-sm text-slate-900 block">Record Access Barrier</strong>
            <span className="text-[11px] text-slate-500 block">Transport, cost, digital issues</span>
          </div>
        </Link>

        <Link
          to="/asha/referrals"
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all group text-left space-y-2"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-sm text-slate-900 block">Referral Navigator</strong>
            <span className="text-[11px] text-slate-500 block">Guide patients to tertiary care</span>
          </div>
        </Link>
      </div>

      {/* Main Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priority Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              Today's Field Tasks & Doorstep Reminders
            </h3>
            <Link to="/asha/follow-ups" className="text-xs font-bold text-teal-600 hover:underline">
              View All ({tasks.length})
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{t.patientName}</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {t.priority || 'Medium'}
                    </span>
                  </div>
                  <p className="text-slate-600">{t.taskType}</p>
                  <p className="text-[11px] text-slate-400">Due: {t.dueDate}</p>
                </div>

                <Link
                  to="/asha/follow-ups"
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-sm shrink-0"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Guidelines & Scope */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Authorized Non-Clinical Field Scope
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <strong className="text-emerald-900 block font-bold">
                ✓ Permitted ASHA Responsibilities:
              </strong>
              <p>
                Manage assigned households, record doorstep visits, identify non-clinical access barriers (distance, transit cost, digital literacy), assist with OPD queue tokens and appointments, navigate referrals, follow up on doctor-issued care instructions, work offline.
              </p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <strong className="text-rose-900 block font-bold">
                ✕ Strictly Prohibited Actions:
              </strong>
              <p>
                ASHA workers must NOT formulate independent clinical diagnoses, prescribe or alter pharmaceutical prescriptions, override physician recommendations, or pretend to be clinical doctors. All clinical concerns must route directly to authorized medical officers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
