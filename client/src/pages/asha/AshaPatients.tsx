import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  Flag,
  RefreshCw,
  MapPin,
  HeartPulse,
  AlertTriangle,
  Send,
  X,
  Phone,
  Calendar,
} from 'lucide-react';

export const AshaPatients: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Modal for flagging
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagUrgency, setFlagUrgency] = useState<'high' | 'critical'>('high');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/asha/patients');
      if (res.data?.success && res.data?.patients) {
        setPatients(res.data.patients);
      }
    } catch {
      showToast('Failed to load community health records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !flagReason.trim()) return;

    setIsSubmittingFlag(true);
    try {
      await api.post('/asha/flag-patient', {
        patientId: activePatient.id || activePatient._id,
        reason: flagReason,
        urgency: flagUrgency,
      });
      showToast(`Flag logged: ${activePatient.name} marked as ${flagUrgency.toUpperCase()} risk!`, 'success');
      setActivePatient(null);
      setFlagReason('');
      fetchPatients();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Could not flag patient.', 'error');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const name = p.name || '';
      const village = p.village || p.address || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        village.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || (p.riskLevel || 'LOW') === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [patients, searchQuery, riskFilter]);

  const RISK_BADGE: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ASHA Village Household Cohort
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Community-level maternal, child, geriatric, and chronic illness register with field escalation flags.
          </p>
        </div>
        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, village, or hamlet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Care Tiers</option>
            <option value="CRITICAL">Critical Flagged</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Moderate Risk</option>
            <option value="LOW">Low Friction</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          Loading village cohort...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          No patients found for this criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, idx) => (
            <div
              key={p.id || idx}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {p.village || p.district || 'Village Community'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                      RISK_BADGE[p.riskLevel || 'LOW']
                    }`}
                  >
                    {p.riskLevel || 'LOW'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cohort Type:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {p.category || 'Maternal / Chronic'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Friction Score:</span>
                    <span className="font-semibold text-emerald-600">{p.frictionScore || 54}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last ASHA Visit:</span>
                    <span>{p.lastVisit || 'Within 7 days'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActivePatient(p)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Flag High-Risk Escalation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flag Escalation Modal */}
      {activePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Flag Patient Escalation</h3>
              </div>
              <button
                onClick={() => setActivePatient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Escalating <span className="font-bold text-slate-900 dark:text-white">{activePatient.name}</span> to the
              medical officer and district health dashboard for immediate intervention.
            </p>

            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Severity Tier
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlagUrgency('high')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      flagUrgency === 'high'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    High Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlagUrgency('critical')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      flagUrgency === 'critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Critical / Immediate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Clinical Observation & Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="e.g. Patient exhibiting severe respiratory distress, missed 2 consecutive dialysis appointments..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePatient(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFlag}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmittingFlag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
