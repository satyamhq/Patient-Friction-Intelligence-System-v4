import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  RefreshCw,
  Video,
  FileText,
  AlertTriangle,
  HeartPulse,
  Filter,
  Calendar,
  Phone,
  ChevronRight,
} from 'lucide-react';

export const DoctorPatients: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/doctors/patients');
      if (res.data?.success && res.data?.patients) {
        setPatients(res.data.patients);
      }
    } catch {
      showToast('Failed to load patient queue.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = p.name || '';
      const condition = p.condition || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        condition.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Assigned Patient Cohort & Clinical Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time longitudinal view of patients undergoing active treatment, referrals, and teleconsultations.
          </p>
        </div>
        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, primary condition, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Clinical Tiers</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-600" />
          Loading patient cohort...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          No patients match the current search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((p, idx) => (
            <div
              key={p.id || idx}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.age ? `${p.age} yrs` : 'Adult'} • {p.gender || 'Patient'}
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
                    <span className="text-slate-400">Condition:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{p.condition || 'Under Evaluation'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Friction Score:</span>
                    <span className="font-semibold text-teal-600">{p.frictionScore || 42}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Visit:</span>
                    <span>{p.lastVisit || 'Recent'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <Link
                  to="/doctor/teleconsult"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  Teleconsult
                </Link>
                <Link
                  to="/doctor/health-records"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  EHR & ABHA
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
