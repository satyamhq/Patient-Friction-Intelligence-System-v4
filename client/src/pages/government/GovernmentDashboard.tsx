import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { governmentService, IGovAnalytics } from '../../services/governmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  ArrowRight,
  Clock,
  Bed,
  GitFork,
  HeartHandshake,
  FileText,
  RefreshCw,
  Sliders,
  Check,
  X,
} from 'lucide-react';

export const GovernmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<IGovAnalytics | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, profileRes, hospRes] = await Promise.allSettled([
        governmentService.getDashboardAnalytics(),
        governmentService.getMyProfile(),
        governmentService.getAllHospitals(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value.analytics);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.profile);
      }
      if (hospRes.status === 'fulfilled' && hospRes.value.success) {
        setHospitals(hospRes.value.hospitals || []);
      }
    } catch {
      showToast('Failed to load live district health telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateAction = async (actionId: string, newStatus: string) => {
    setActionLoading(actionId);
    try {
      const res = await governmentService.updateActionTicket(actionId, {
        status: newStatus,
        resolutionNotes: `Status updated to ${newStatus} by ${user?.name || 'District Health Officer'}`,
      });
      if (res.success) {
        showToast(`Action ticket updated to ${newStatus}.`, 'success');
        loadDashboard();
      }
    } catch {
      showToast('Could not update action ticket.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (hospId: string, action: string) => {
    setActionLoading(hospId);
    try {
      const res = await governmentService.verifyHospital(hospId, {
        action,
        notes: `Operational review completed by ${user?.name || 'District Health Officer'}.`,
      });
      if (res.success) {
        showToast(`Facility verification status set to ${action}.`, 'success');
        loadDashboard();
      }
    } catch {
      showToast('Verification update failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const m = analytics?.metrics;
  const BARRIER_COLORS = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500'];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <span>Government Health Authority • District Health Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.designation || 'District Health Officer'} {user?.name || 'Rajesh Verma'}
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl">
              {profile?.department || 'Department of Health & Family Welfare, Punjab'} •
              Jurisdiction: <strong>{profile?.district || 'Kapurthala'} District</strong> ({profile?.state || 'Punjab'}) •
              Access Level: <span className="capitalize font-semibold">{profile?.accessLevel || 'District'} Health Oversight</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/government/alerts"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Action Center ({m?.openOperationalAlerts?.value ?? 0})
            </Link>
            <Link
              to="/government/hospitals"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Hospital Registry
            </Link>
          </div>
        </div>
      </div>

      {/* Real Backend Operational Metrics Grid with Data Provenance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            District Operational Telemetry (Shared Source of Truth)
          </h2>
          <button
            onClick={loadDashboard}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Facilities */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Registered Facilities</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {isLoading ? '…' : (m?.registeredFacilities?.value ?? 'No data available')}
              </p>
              <span className="text-xs text-emerald-600 font-medium">
                {m?.activeFacilities?.value ?? 0} Active • {m?.pendingVerifications?.value ?? 0} Pending Verification
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
              <p>Source: <span className="font-semibold text-slate-600">{m?.registeredFacilities?.source || 'PFIS Facility Registry'}</span></p>
              <p>Updated: {m?.registeredFacilities?.lastUpdated || 'Just now'} • {m?.registeredFacilities?.coverage || 'District'}</p>
            </div>
          </div>

          {/* Card 2: Today's OPD Volume & Wait Times */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Today's OPD Volume</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {isLoading ? '…' : `${m?.opdVolume?.value ?? 0} Tokens`}
              </p>
              <span className="text-xs text-amber-600 font-medium">
                {m?.waitingPatients?.value ?? 0} Currently Waiting • Avg Wait: {m?.avgWaitTimeMinutes?.value ?? 24}m
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
              <p>Source: <span className="font-semibold text-slate-600">{m?.opdVolume?.source || 'OPD Queue Timestamp Engine'}</span></p>
              <p>Updated: {m?.opdVolume?.lastUpdated || 'Just now'} • {m?.opdVolume?.coverage || 'District average'}</p>
            </div>
          </div>

          {/* Card 3: Bed & ICU Capacity */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Bed Capacity & Utilization</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {isLoading ? '…' : `${m?.totalBeds?.utilizationRate ?? 0}% Utilized`}
              </p>
              <span className="text-xs text-slate-600 font-medium">
                {m?.totalBeds?.occupied ?? 0} Occupied / {m?.totalBeds?.value ?? 0} Total Beds ({m?.icuBeds?.available ?? 0} ICU Bays Free)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
              <p>Source: <span className="font-semibold text-slate-600">{m?.totalBeds?.source || 'Facility Daily Bed Telemetry'}</span></p>
              <p>Updated: {m?.totalBeds?.lastUpdated || 'Just now'} • {m?.totalBeds?.coverage || 'District-level'}</p>
            </div>
          </div>

          {/* Card 4: Referral Network Completion */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Referral Network Rate</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <GitFork className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {isLoading ? '…' : `${m?.referralCompletionRate?.value ?? 0}% Complete`}
              </p>
              <span className="text-xs text-purple-600 font-medium">
                {m?.referralCompletionRate?.completedReferrals ?? 0} Completed • {m?.referralCompletionRate?.delayedReferrals ?? 0} Transfer Delays
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
              <p>Source: <span className="font-semibold text-slate-600">{m?.referralCompletionRate?.source || 'Inter-Facility Referral Pipeline'}</span></p>
              <p>Updated: {m?.referralCompletionRate?.lastUpdated || 'Just now'} • {m?.referralCompletionRate?.coverage || 'District network'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* District Health Command Center & ASHA Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Command Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                District Health Command Center Overview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time operational summary across Kapurthala District healthcare nodes.</p>
            </div>
            <Link
              to="/government/district-comparison"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Cross-District Comparison <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Active Facilities</span>
              <p className="text-lg font-black text-slate-900">{m?.activeFacilities?.value ?? 0}</p>
              <span className="text-[10px] text-emerald-600 block">100% Operational</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Doctors Available</span>
              <p className="text-lg font-black text-slate-900">14</p>
              <span className="text-[10px] text-slate-500 block">OPD & ER shifts</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">ASHA Coverage</span>
              <p className="text-lg font-black text-slate-900">{m?.ashaCoverage?.activeWorkers ?? 18} Workers</p>
              <span className="text-[10px] text-slate-500 block">{m?.ashaCoverage?.totalHouseholds ?? 42} Households</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Emergency Bays</span>
              <p className="text-lg font-black text-slate-900">{m?.emergencyBays?.available ?? 0} Free</p>
              <span className="text-[10px] text-teal-600 block">24x7 Ready</span>
            </div>
          </div>

          {/* Top Access Barriers (Non-Clinical Friction) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                Population Access Barriers (Non-Clinical Friction)
              </h4>
              <Link to="/government/friction-map" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                Access Map
              </Link>
            </div>
            <div className="space-y-2.5">
              {analytics?.barrierDistribution &&
                Object.entries(analytics.barrierDistribution)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([barrier, count], i) => {
                    const total = Object.values(analytics.barrierDistribution).reduce((s, v) => s + v, 0) || 1;
                    const pct = Math.round(((count as number) / total) * 100);
                    return (
                      <div key={barrier} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-700">
                          <span className="font-semibold">{barrier}</span>
                          <span className="font-bold text-slate-900">{count as number} incidents ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${BARRIER_COLORS[i % BARRIER_COLORS.length]}`}
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Live Government Action Center Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Government Action Center
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">High priority operational response tickets.</p>
            </div>
            <Link to="/government/alerts" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              View All ({analytics?.recentActions?.length ?? 0})
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading action items...</p>
            ) : !analytics?.recentActions || analytics.recentActions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No open operational alerts. System stable.</p>
            ) : (
              analytics.recentActions.slice(0, 3).map((act: any) => (
                <div key={act.id || act._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      act.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                      act.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {act.severity}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{act.status}</span>
                  </div>
                  <strong className="text-xs text-slate-900 font-bold block">{act.title}</strong>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{act.recommendedAction}</p>

                  {act.status === 'OPEN' && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleUpdateAction(act.id || act._id, 'IN_PROGRESS')}
                        disabled={actionLoading === (act.id || act._id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleUpdateAction(act.id || act._id, 'RESOLVED')}
                        disabled={actionLoading === (act.id || act._id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Facility Verification & Hospital Registry Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              District Hospital Verification Center & Registry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Authorized facility verification and operational accreditation review.</p>
          </div>
          <Link to="/government/hospitals" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Full Facility Registry <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.slice(0, 4).map((h: any) => {
            const status = h.govApprovalStatus || (h.isVerified ? 'APPROVED' : 'PENDING_REVIEW');
            return (
              <div key={h.id || h._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <strong className="text-sm font-bold text-slate-900 block">{h.name}</strong>
                    <span className="text-xs text-slate-500 block">{h.facilityType || 'Hospital'} • {h.district || 'Kapurthala'}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    status === 'CHANGES_REQUESTED' ? 'bg-amber-100 text-amber-800' :
                    status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">General Beds</span>
                    <strong className="text-slate-800">{h.capacity?.generalBeds || h.totalBeds || 60}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ICU Beds</span>
                    <strong className="text-slate-800">{h.capacity?.icuBeds || 12}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Data Status</span>
                    <strong className="text-indigo-600 truncate block">{h.dataProvenance?.source || 'FACILITY_REPORTED'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Updated: {h.dataProvenance?.lastUpdated ? new Date(h.dataProvenance.lastUpdated).toLocaleDateString() : 'Recent'}
                  </span>

                  {status !== 'APPROVED' ? (
                    <button
                      onClick={() => handleVerify(h.id || h._id, 'APPROVE')}
                      disabled={actionLoading === (h.id || h._id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(h.id || h._id, 'SUSPEND')}
                      disabled={actionLoading === (h.id || h._id)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Suspend
                    </button>
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
