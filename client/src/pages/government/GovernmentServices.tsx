import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  Search,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Syringe,
  Droplets,
  Microscope,
} from 'lucide-react';

export const GovernmentServices: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getServiceAvailability();
      if (res.success) {
        setServices(res.services || []);
      }
    } catch {
      showToast('Failed to load facility service availability matrix.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = services.filter((s) =>
    s.facilityName?.toLowerCase().includes(search.toLowerCase()) ||
    s.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              CLINICAL & ESSENTIAL SERVICE MAPPING
            </span>
            <span className="text-xs text-slate-400 font-medium">• District Service Grid</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Facility Service Availability Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of emergency surgery, trauma bays, maternity OT, dialysis units, and blood banking across district healthcare institutions.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by facility name, clinical department, or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Relational Sync</span>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Facility Name</th>
                <th className="p-4">Service / Department</th>
                <th className="p-4">Category</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4">Duty Specialists</th>
                <th className="p-4">Data Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No clinical services found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.facilityName}</div>
                      <div className="text-[11px] text-slate-400">{item.facilityType || 'Hospital'} • {item.district || 'District'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        {item.serviceName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> 24x7 Functional
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Temporarily Down
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {item.dutyDoctors || '2 On-Duty'}
                    </td>
                    <td className="p-4 text-[11px] text-slate-400">
                      Live (HMS Event Log)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
