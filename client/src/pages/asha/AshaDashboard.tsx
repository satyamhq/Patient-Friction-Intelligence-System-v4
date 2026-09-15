import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ashaService, AshaProfile, AshaDashboardStats } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Home,
  Calendar,
  AlertTriangle,
  Clock,
  Ticket,
  GitFork,
  CheckSquare,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Building,
  PhoneCall,
  Activity,
  Send,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const AshaDashboard: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AshaProfile | null>(null);
  const [stats, setStats] = useState<AshaDashboardStats | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [barriers, setBarriers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    try {
      const [profRes, statsRes, visitsRes, tasksRes, refRes, barRes] = await Promise.allSettled([
        ashaService.getProfile(),
        ashaService.getDashboardStats(),
        ashaService.getVisits(),
        ashaService.getTasks(),
        ashaService.getReferrals(),
        ashaService.getAccessBarriers(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.success) {
        setProfile(profRes.value.profile);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.stats);
      }
      if (visitsRes.status === 'fulfilled' && visitsRes.value.success) {
        setVisits(visitsRes.value.visits || []);
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value.success) {
        setTasks(tasksRes.value.tasks || []);
      }
      if (refRes.status === 'fulfilled' && refRes.value.success) {
        setReferrals(refRes.value.referrals || []);
      }
      if (barRes.status === 'fulfilled' && barRes.value.success) {
        setBarriers(barRes.value.barriers || []);
      }
    } catch {
      showToast('Failed to load field operational data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await ashaService.syncOfflineQueue();
      if (res.success) {
        showToast(res.message || 'Offline queue synchronized to shared database.', 'success');
        await loadData();
      } else {
        showToast('Sync completed with local records up to date.', 'info');
      }
    } catch {
      showToast('Sync failed. Please check network connection.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const todayVisits = visits.filter(v => v.status === 'IN_PROGRESS' || v.status === 'SCHEDULED' || v.status === 'COMPLETED');
  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'Upcoming');
  const pendingReferrals = referrals.filter(r => r.status === 'SENT' || r.status === 'RECEIVED' || r.status === 'ACCEPTED' || r.status === 'Initiated');
  const activeBarriers = barriers.filter(b => b.status !== 'Resolved');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* ── TOP IDENTITY BANNER ── */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-200 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-teal-100 border border-white/20 backdrop-blur-sm">
                ASHA Frontline Health Worker
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-300" /> : <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
                {isOnline ? 'Online • Central DB Connected' : 'Offline Mode • Local Queue Active'}
              </span>
              <span className="text-xs text-teal-200 font-mono">
                ID: <strong>{profile?.asha_code || 'ASHA-PB-KPT-104'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Namaste, {profile?.name || 'Kavita Devi'} 🙏
            </h1>

            {/* Exact administrative location hierarchy */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-teal-100/90">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                Village: <strong>{profile?.village || 'Rampur Kalan'}</strong>
              </span>
              <span>•</span>
              <span>Sub-centre: <strong>{profile?.sub_centre || 'Rampur Sub-Centre'}</strong></span>
              <span>•</span>
              <span>PHC: <strong>{profile?.phc || 'Phagwara Rural PHC'}</strong></span>
              <span>•</span>
              <span>Block: <strong>{profile?.block || 'Phagwara'}</strong></span>
              <span>•</span>
              <span>District: <strong>{profile?.district || 'Kapurthala'}</strong></span>
              <span>•</span>
              <span>State: <strong>{profile?.state || 'Punjab'}</strong></span>
            </div>

            <p className="text-xs text-teal-200/80">
              Assigned Area: <strong>{profile?.assigned_area || 'Ward 4 & 5 (Households HH-01 to HH-15)'}</strong> • Supervisor: <strong>{profile?.supervisor_name || 'Sister Nirmal Kaur (ANM)'}</strong> ({profile?.supervisor_phone || '+91 98765 11223'})
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-3 shrink-0">
            <Link
              to="/asha/patients"
              className="px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-teal-700" />
              My Patients
            </Link>
            <Link
              to="/asha/visits"
              className="px-4 py-2.5 rounded-xl bg-teal-600/60 hover:bg-teal-600 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today's Visits
            </Link>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 CORE QUESTIONS WORKSPACE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Daily Operational Action Checklist
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">Live Backend Intelligence</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Question 1 */}
          <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1">
            <span className="text-slate-500 block font-medium">1. Visits Today</span>
            <strong className="text-lg font-bold text-teal-800 block">
              {stats?.todayVisitsCount ?? todayVisits.length} Assigned
            </strong>
            <span className="text-teal-700 text-[11px] block">
              {stats?.completedVisitsCount ?? 1} Done • {stats?.inProgressVisitsCount ?? 1} In Progress
            </span>
          </div>

          {/* Question 2 */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
            <span className="text-slate-500 block font-medium">2. Patients Needing Follow-up</span>
            <strong className="text-lg font-bold text-amber-800 block">
              {stats?.followUpTasksCount ?? pendingTasks.length} Beneficiaries
            </strong>
            <span className="text-amber-700 text-[11px] block">
              Doorstep vitals & NCD reminders
            </span>
          </div>

          {/* Question 3 */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
            <span className="text-slate-500 block font-medium">3. Pending Referrals</span>
            <strong className="text-lg font-bold text-blue-800 block">
              {stats?.pendingReferralsCount ?? pendingReferrals.length} Cases
            </strong>
            <span className="text-blue-700 text-[11px] block">
              Require transit & booking aid
            </span>
          </div>

          {/* Question 4 */}
          <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-1">
            <span className="text-slate-500 block font-medium">4. Access Barriers</span>
            <strong className="text-lg font-bold text-rose-800 block">
              {stats?.accessBarriersCount ?? activeBarriers.length} Active Problems
            </strong>
            <span className="text-rose-700 text-[11px] block">
              Transport, cost, digital barriers
            </span>
          </div>

          {/* Question 5 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-medium">5. Sync Queue</span>
            <strong className="text-lg font-bold text-slate-800 block">
              {stats?.syncStatus?.pendingRecords || 0} Pending
            </strong>
            <span className="text-slate-500 text-[11px] block">
              Last synced: {new Date(stats?.syncStatus?.lastSuccessfulSync || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: TODAY'S WORK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Today's Field Visits & Verification
                </h3>
                <p className="text-xs text-slate-500">Doorstep checkups and non-clinical access assessments</p>
              </div>
            </div>
            <Link
              to="/asha/visits"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Planner <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayVisits.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
              No assigned visits scheduled for today. All records up to date.
            </div>
          ) : (
            <div className="space-y-3">
              {todayVisits.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{v.patientName}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                        {v.householdId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          v.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'IN_PROGRESS'
                            ? 'bg-teal-100 text-teal-800 animate-pulse'
                            : v.status === 'MISSED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>{v.visitType}</strong> • Scheduled: {v.scheduledDate}
                    </p>
                    {v.notes && (
                      <p className="text-[11px] text-slate-500 italic">"{v.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/asha/visits"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                      {v.status === 'IN_PROGRESS' ? 'Resume Visit' : v.status === 'COMPLETED' ? 'View Report' : 'Start Visit'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Actions Column */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                Urgent Field Actions
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Action Required
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Action 1: Referral Assistance */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-blue-600" />
                  Referral Navigation
                </span>
                <Link to="/asha/referrals" className="text-[11px] text-blue-600 hover:underline">
                  View ({pendingReferrals.length})
                </Link>
              </div>
              <p className="text-slate-600">
                {pendingReferrals[0]
                  ? `Assist ${pendingReferrals[0].patientName} with ${pendingReferrals[0].toFacilityName} referral transit.`
                  : 'All referrals currently tracked and on schedule.'}
              </p>
            </div>

            {/* Action 2: Token / OPD Assistance */}
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-teal-600" />
                  OPD Token Generation
                </span>
                <Link to="/asha/opd-tokens" className="text-[11px] text-teal-600 hover:underline">
                  Desk
                </Link>
              </div>
              <p className="text-slate-600">
                Generate live OPD queue tokens for non-digital beneficiaries directly into hospital and doctor queue.
              </p>
            </div>

            {/* Action 3: Missed Care Follow-up */}
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-rose-900">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Missed Care Follow-up
                </span>
                <Link to="/asha/follow-ups" className="text-[11px] text-rose-600 hover:underline">
                  Tasks
                </Link>
              </div>
              <p className="text-slate-600">
                {pendingTasks[0]
                  ? `Task: ${pendingTasks[0].taskType} for ${pendingTasks[0].patientName}.`
                  : 'No overdue care drop-offs reported.'}
              </p>
            </div>

            {/* Action 4: High Access Priority Escalation */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  High Access Priority
                </span>
                <Link to="/asha/escalations" className="text-[11px] text-amber-600 hover:underline">
                  Escalate
                </Link>
              </div>
              <p className="text-slate-600">
                Route transit barriers to Block Officer; clinical concerns directly to Medical Officer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: FIELD ACCESS & FRICTION INSIGHTS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-600" />
              Field Healthcare Access Problems (Non-Clinical Friction Intelligence)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from assigned households (Rampur Kalan). Does not represent clinical diagnosis.
            </p>
          </div>
          <Link
            to="/asha/access-barriers"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Record Barrier <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">Transport</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.TRANSPORT || 1}
            </strong>
            <span className="text-[10px] text-rose-600 font-semibold block">Distance & bus routes</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">Cost / Financial</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.COST || 1}
            </strong>
            <span className="text-[10px] text-amber-600 font-semibold block">Imaging fee relief</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">Documentation</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.DOCUMENTATION || 0}
            </strong>
            <span className="text-[10px] text-teal-600 font-semibold block">ABHA / PM-JAY cards</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">Digital Access</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.['DIGITAL ACCESS'] || 1}
            </strong>
            <span className="text-[10px] text-blue-600 font-semibold block">No smartphone</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">OPD Availability</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.AVAILABILITY || 1}
            </strong>
            <span className="text-[10px] text-purple-600 font-semibold block">Doctor slot lag</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <span className="text-slate-400 block">Other Non-Clinical</span>
            <strong className="text-2xl font-bold text-slate-900">
              {stats?.barrierCounts?.OTHER || 0}
            </strong>
            <span className="text-[10px] text-slate-500 font-semibold block">Language / Misc</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: OFFLINE SYNC STATUS FOOTER ── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Offline Field Synchronization Center</h4>
            <p className="text-xs text-slate-400">
              {stats?.syncStatus?.pendingRecords || 0} local operations queued • Last successful server confirmation:{' '}
              {new Date(stats?.syncStatus?.lastSuccessfulSync || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/asha/sync"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
          >
            Manage Queue
          </Link>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
};
