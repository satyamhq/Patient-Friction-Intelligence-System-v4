import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Bed,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const GovernmentHospitals: React.FC = () => {
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/government/hospitals');
      if (res.data?.success && res.data?.hospitals) {
        setHospitals(res.data.hospitals);
      }
    } catch {
      showToast('Failed to load district hospital registry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await api.put(`/government/hospitals/${id}/approve`);
      if (res.data?.success) {
        showToast('Hospital accreditation certified successfully.', 'success');
        setHospitals((prev) =>
          prev.map((h) => (h._id === id || h.id === id ? { ...h, isVerified: true, status: 'APPROVED' } : h))
        );
      }
    } catch {
      showToast('Could not approve hospital accreditation.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      const res = await api.put(`/government/hospitals/${id}/reject`);
      if (res.data?.success) {
        showToast('Hospital flagged / accreditation suspended.', 'info');
        setHospitals((prev) =>
          prev.map((h) => (h._id === id || h.id === id ? { ...h, isVerified: false, status: 'SUSPENDED' } : h))
        );
      }
    } catch {
      showToast('Could not suspend hospital.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const name = h.name || '';
      const district = h.district || h.city || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === 'ALL' || h.type === tierFilter || h.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [hospitals, searchQuery, tierFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            District Hospital Network & Regulatory Oversight
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit bed capacity, operational readiness, NQAS compliance, and approve facility accreditations.
          </p>
        </div>
        <button
          onClick={fetchHospitals}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Network
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by hospital name, district, or block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white outline-none"
          >
            <option value="ALL">All Facility Types</option>
            <option value="GOVERNMENT">Government Civil / District</option>
            <option value="PRIVATE">Empaneled Private</option>
            <option value="TERTIARY">Tertiary Medical College</option>
            <option value="SECONDARY">Secondary CHC / Sub-divisional</option>
          </select>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Hospital Facility</th>
                <th className="px-6 py-4">District & Location</th>
                <th className="px-6 py-4">Total Bed Capacity</th>
                <th className="px-6 py-4">ICU & Emergency</th>
                <th className="px-6 py-4">Regulatory Status</th>
                <th className="px-6 py-4 text-right">Accreditation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Querying facility registry...
                  </td>
                </tr>
              ) : filteredHospitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hospitals match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHospitals.map((h) => {
                  const id = h._id || h.id;
                  const isApproved = h.isVerified || h.status === 'APPROVED';
                  return (
                    <tr key={id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                            <span className="text-xs text-slate-500">{h.type || 'District Hospital'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{h.district || h.city || h.address || 'State Zone'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Bed className="w-4 h-4 text-slate-400" />
                          <span>{h.totalBeds || h.capacity?.totalBeds || 120} Beds</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {h.icuBeds || h.capacity?.icuBeds || 15} ICU Units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> Certified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Pending Review
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(id)}
                            disabled={actionId === id || isApproved}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              isApproved
                                ? 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200 dark:border-slate-700'
                                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(id)}
                            disabled={actionId === id || !isApproved}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              !isApproved
                                ? 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200 dark:border-slate-700'
                                : 'text-rose-700 border-rose-200 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
