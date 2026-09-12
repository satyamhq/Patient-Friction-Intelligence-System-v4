import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope, Users, ClipboardList, Video, Pill,
  Activity, ArrowRight, Clock, CheckCircle2, AlertTriangle,
  Star, Calendar, ChevronRight, TrendingUp, Heart,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, profileRes, patientsRes] = await Promise.allSettled([
          api.get('/doctors/dashboard'),
          api.get('/doctors/profile/me'),
          api.get('/doctors/patients'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile);
        if (patientsRes.status === 'fulfilled') setPatients((patientsRes.value.data.patients || []).slice(0, 6));
      } catch (e) { /* silently fail */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const RISK_COLOR: Record<string, string> = {
    CRITICAL: 'text-red-600 bg-red-50 border-red-200',
    HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
    MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
    LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-300 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal | PFIS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good Morning, {profile?.name || user?.name || 'Doctor'} 👋
            </h1>
            <p className="text-teal-100/80 text-sm">
              {profile?.specialization || 'General Medicine'} • {profile?.qualification || 'MBBS'} •{' '}
              {profile?.opdTimings || '09:00 AM – 05:00 PM'}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/doctor/patients"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4" />
              My Patients
            </Link>
          </div>
        </div>
      </div>

      {/* Live OPD Calling Widget & Consultation Launcher */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Live OPD Queue Desk & Patient Caller
            </h3>
            <p className="text-xs text-slate-500">
              Advance tokens, triage urgent cases, and launch the Consultation Workspace.
            </p>
          </div>
          <Link
            to="/doctor/consultation?patient=Sunita%20Devi&token=104"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            Launch Consultation Workspace
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Now In Consultation</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Token #104: Sunita Devi</p>
              <span className="text-xs text-slate-500">Hypertension Follow-up • Gate #3</span>
            </div>
            <Link
              to="/doctor/consultation?patient=Sunita%20Devi&token=104"
              className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Open Desk
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next in Queue</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Token #105: Harpreet Singh</p>
              <span className="text-xs text-slate-500">Cardiology Referral Check</span>
            </div>
            <Link
              to="/doctor/consultation?patient=Harpreet%20Singh&token=105"
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg"
            >
              Call Next
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Metrics</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">6 Waiting • ~14m Avg</p>
              <span className="text-xs text-emerald-600 font-medium">On Schedule</span>
            </div>
            <Link
              to="/doctor/patients"
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg"
            >
              View Roster
            </Link>
          </div>
        </div>
      </div>

      {/* Proactive Clinical Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Smart Clinical & Follow-up Alerts
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            3 High-Priority Actions Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="font-bold text-amber-900 dark:text-amber-200">Sunita Devi</strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">MISSED VISIT</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Missed 2 consecutive follow-up visits for chronic hypertension monitoring.
            </p>
            <div className="pt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center justify-between">
              <span>Action: ASHA visit dispatched</span>
              <Link to="/patient/teleconsult" className="font-bold underline">Teleconsult</Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="font-bold text-rose-900 dark:text-rose-200">Amrik Chand</strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">CRITICAL LAB</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              HbA1c level of 10.4% received from diagnostic lab. Urgent glycemic review recommended.
            </p>
            <div className="pt-1 text-[11px] text-rose-800 dark:text-rose-300 font-medium flex items-center justify-between">
              <span>Status: Needs Dose Adjustment</span>
              <Link to="/doctor/consultation?patient=Amrik%20Chand" className="font-bold underline">Review</Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <strong className="font-bold text-blue-900 dark:text-blue-200">Harpreet Singh</strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">REFERRAL OVERDUE</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cardiology referral to District Civil Hospital pending acceptance for 5 days.
            </p>
            <div className="pt-1 text-[11px] text-blue-800 dark:text-blue-300 font-medium flex items-center justify-between">
              <span>Contact: Nodal Liaison Officer</span>
              <Link to="/patient/referrals" className="font-bold underline">Track</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Users className="w-5 h-5 text-teal-600" />, label: 'Total Patients', value: stats?.totalPatients ?? '-', bg: 'bg-teal-50 border-teal-200' },
          { icon: <ClipboardList className="w-5 h-5 text-indigo-600" />, label: 'Pending Requests', value: stats?.pendingRequests ?? '-', bg: 'bg-indigo-50 border-indigo-200' },
          { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, label: 'Completed Cases', value: stats?.completedRequests ?? '-', bg: 'bg-emerald-50 border-emerald-200' },
          { icon: <Video className="w-5 h-5 text-blue-600" />, label: 'Teleconsults Today', value: stats?.activeTeleconsults ?? 0, bg: 'bg-blue-50 border-blue-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.bg} space-y-2`}>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">{s.icon}</div>
            <p className="text-2xl font-black text-slate-900">{isLoading ? '…' : s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/doctor/patients', icon: <Users className="w-5 h-5" />, label: 'Patient Queue', sub: 'View all patients by risk level', color: 'from-teal-500 to-cyan-600' },
          { to: '/patient/teleconsult', icon: <Video className="w-5 h-5" />, label: 'Teleconsultation', sub: 'Start or join a video consult', color: 'from-blue-500 to-indigo-600' },
          { to: '/patient/health-records', icon: <ClipboardList className="w-5 h-5" />, label: 'Health Records', sub: 'View longitudinal patient records', color: 'from-violet-500 to-purple-600' },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`bg-gradient-to-br ${action.color} rounded-2xl p-5 text-white hover:scale-[1.02] transition-all shadow-md flex items-start gap-4`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {action.icon}
            </div>
            <div>
              <p className="font-bold text-sm">{action.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{action.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto self-center opacity-60" />
          </Link>
        ))}
      </div>

      {/* Patient List Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Recent Patient Cases
          </h3>
          <Link to="/doctor/patients" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <p className="text-center text-slate-400 text-sm py-6">Loading patients…</p>
        ) : patients.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6">No patient records found.</p>
        ) : (
          <div className="space-y-3">
            {patients.map((p: any, i: number) => (
              <div key={p._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(p.patientCode || 'P').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{p.patientCode || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{p.gender || '-'} • Age {p.age || '-'} • {p.preferredLanguage || 'Hindi'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_COLOR[p.riskCategory] || RISK_COLOR.LOW}`}>
                  {p.frictionLevel || 'LOW'} FRICTION
                </span>
                <span className="text-xs font-bold text-slate-600">{p.frictionScore || 0}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
