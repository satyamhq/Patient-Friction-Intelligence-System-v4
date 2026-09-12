import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2, Users, BarChart3, CheckCircle2, XCircle,
  AlertTriangle, TrendingUp, MapPin, Shield, Activity,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GovernmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, profileRes, hospRes] = await Promise.allSettled([
          api.get('/government/analytics'),
          api.get('/government/profile/me'),
          api.get('/government/hospitals'),
        ]);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.analytics);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile);
        if (hospRes.status === 'fulfilled') setHospitals((hospRes.value.data.hospitals || []).slice(0, 8));
      } catch (e) { /* silent */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleApprove = async (hospId: string, hospName: string) => {
    setApproving(hospId);
    try {
      await api.put(`/government/hospitals/${hospId}/approve`);
      showToast(`✅ ${hospName} has been approved!`, 'success');
      setHospitals((prev) => prev.map((h: any) => h._id === hospId ? { ...h, govApprovalStatus: 'APPROVED', isVerified: true } : h));
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (hospId: string, hospName: string) => {
    const reason = prompt(`Rejection reason for ${hospName}:`);
    if (!reason) return;
    setApproving(hospId);
    try {
      await api.put(`/government/hospitals/${hospId}/reject`, { reason });
      showToast(`❌ ${hospName} has been rejected.`, 'info');
      setHospitals((prev) => prev.map((h: any) => h._id === hospId ? { ...h, govApprovalStatus: 'REJECTED', isVerified: false } : h));
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setApproving(null);
    }
  };

  const BARRIER_COLORS = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-violet-500'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Government Health Intelligence Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {profile?.designation || 'Health Officer'} {user?.name || ''}
            </h1>
            <p className="text-blue-100/80 text-sm">
              {profile?.department || 'Ministry of Health'} •
              {profile?.state && ` ${profile.state}`}
              {profile?.district && ` / ${profile.district}`} •
              Access: <strong className="capitalize">{profile?.accessLevel || 'district'}</strong>
            </p>
          </div>
          <Link
            to="/government/hospitals"
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all shrink-0"
          >
            <Building2 className="w-4 h-4" />
            Hospital Registry
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Hospitals', value: analytics?.totalHospitals, icon: <Building2 className="w-4 h-4 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' },
          { label: 'Patients', value: analytics?.totalPatients, icon: <Users className="w-4 h-4 text-teal-600" />, bg: 'bg-teal-50 border-teal-200' },
          { label: 'Total Requests', value: analytics?.totalRequests, icon: <BarChart3 className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
          { label: 'Completed', value: analytics?.completedRequests, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'High Risk', value: analytics?.highRiskPatients, icon: <AlertTriangle className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50 border-orange-200' },
          { label: 'Care Rate %', value: analytics?.careCompletionRate != null ? `${analytics.careCompletionRate}%` : '-', icon: <TrendingUp className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50 border-violet-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.bg} space-y-2`}>
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">{s.icon}</div>
            <p className="text-xl font-black text-slate-900">{isLoading ? '…' : (s.value ?? '-')}</p>
            <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barrier Distribution */}
        {analytics?.barrierDistribution && Object.keys(analytics.barrierDistribution).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Activity className="w-4 h-4 text-rose-500" /> Top Access Barriers
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.barrierDistribution)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([barrier, count], i) => {
                  const total = Object.values(analytics.barrierDistribution).reduce((s: any, v: any) => s + v, 0) as number;
                  const pct = Math.round(((count as number) / total) * 100);
                  return (
                    <div key={barrier} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="font-medium">{barrier}</span>
                        <span className="font-bold">{count as number} patients ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${BARRIER_COLORS[i % BARRIER_COLORS.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Hospital Approval Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Hospital Approval Queue
            </h3>
            <Link to="/government/hospitals" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-slate-400 text-sm py-6">Loading hospitals...</p>
            ) : hospitals.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No hospitals found.</p>
            ) : (
              hospitals.slice(0, 5).map((h: any) => {
                const status = h.govApprovalStatus || (h.isVerified ? 'APPROVED' : 'PENDING');
                return (
                  <div key={h._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{h.name}</p>
                      <p className="text-xs text-slate-500">{h.city}, {h.state} • {h.type}</p>
                    </div>
                    {status === 'APPROVED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">APPROVED</span>
                    ) : status === 'REJECTED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700">REJECTED</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(h._id, h.name)}
                          disabled={approving === h._id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(h._id, h.name)}
                          disabled={approving === h._id}
                          className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition-all"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
