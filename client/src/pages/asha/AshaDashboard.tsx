import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, AlertTriangle, MapPin, Flag, CheckCircle2, Clock, ArrowRight, Heart, Activity, ChevronRight, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AshaDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flag patient form state
  const [flagPatientId, setFlagPatientId] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagUrgency, setFlagUrgency] = useState<'high' | 'critical'>('high');
  const [isFlagging, setIsFlagging] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, profileRes, patientsRes] = await Promise.allSettled([
          api.get('/asha/dashboard'),
          api.get('/asha/profile/me'),
          api.get('/asha/patients'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile);
        if (patientsRes.status === 'fulfilled') {
          const sorted = (patientsRes.value.data.patients || []);
          setPatients(sorted.slice(0, 8));
        }
      } catch (e) { /* silent */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleFlagPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagPatientId || !flagReason) {
      showToast('Select a patient and enter a reason.', 'error');
      return;
    }
    setIsFlagging(true);
    try {
      await api.post('/asha/flag-patient', { patientId: flagPatientId, reason: flagReason, urgency: flagUrgency });
      showToast(`Patient flagged as ${flagUrgency.toUpperCase()} risk! Supervisor notified.`, 'success');
      setFlagPatientId('');
      setFlagReason('');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to flag patient.', 'error');
    } finally {
      setIsFlagging(false);
    }
  };

  const RISK_COLOR: Record<string, string> = {
    CRITICAL: 'text-red-600 bg-red-50 border-red-200',
    HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
    MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
    LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-300 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-200 text-xs font-semibold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              <span>ASHA Field Worker Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {profile?.name || user?.name || 'ASHA Worker'} 🙏
            </h1>
            <p className="text-green-100/80 text-sm">
              Zone: <strong>{profile?.zone || 'Zone A'}</strong> •
              District: <strong>{profile?.district || 'Local District'}</strong> •
              ID: <strong>{profile?.ashaCode || '-'}</strong>
            </p>
          </div>
          <Link
            to="/asha/patients"
            className="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all shrink-0"
          >
            <Users className="w-4 h-4" />
            My Patients
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Patients Tracked', value: stats?.totalPatientsTracked ?? '-', icon: <Users className="w-5 h-5 text-green-600" />, bg: 'bg-green-50 border-green-200' },
          { label: 'High Risk Alerts', value: stats?.highRiskPatients ?? '-', icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50 border-orange-200' },
          { label: 'Field Visits / Month', value: stats?.fieldVisitsThisMonth ?? '-', icon: <MapPin className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
          { label: 'Referrals Made', value: stats?.referralsMade ?? '-', icon: <ArrowRight className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50 border-violet-200' },
          { label: 'Pending Follow-Ups', value: stats?.pendingFollowUps ?? '-', icon: <Clock className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 border-rose-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.bg} space-y-2`}>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">{s.icon}</div>
            <p className="text-2xl font-black text-slate-900">{isLoading ? '…' : s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flag Patient Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Flag className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-900">Flag High-Risk Patient</h3>
          </div>
          <form onSubmit={handleFlagPatient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient (by code)</label>
              <select
                value={flagPatientId}
                onChange={(e) => setFlagPatientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((p: any) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.patientCode} | Age {p.age} | {p.gender}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Urgency Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['high', 'critical'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFlagUrgency(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      flagUrgency === lvl
                        ? lvl === 'critical'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {lvl === 'high' ? '⚠️ High Risk' : '🚨 Critical'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Flagging</label>
              <textarea
                rows={3}
                placeholder="e.g. Patient missed 3 appointments, complaining of chest pain..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isFlagging}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              {isFlagging ? 'Flagging...' : 'Flag Patient & Notify Supervisor'}
            </button>
          </form>
        </div>

        {/* High-Risk Patient List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> High-Risk Patients
            </h3>
            <Link to="/asha/patients" className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-center text-slate-400 text-sm py-6">Loading...</p>
            ) : patients.filter((p: any) => p.riskCategory === 'HIGH' || p.riskCategory === 'CRITICAL').length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No high-risk patients in zone.</p>
            ) : (
              patients
                .filter((p: any) => p.riskCategory === 'HIGH' || p.riskCategory === 'CRITICAL')
                .map((p: any, i: number) => (
                  <div key={p._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(p.patientCode || 'P')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{p.patientCode}</p>
                      <p className="text-xs text-slate-500">Age {p.age} • {p.topBarrier || 'Transport'} barrier</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RISK_COLOR[p.riskCategory] || RISK_COLOR.LOW}`}>
                      {p.riskCategory}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
