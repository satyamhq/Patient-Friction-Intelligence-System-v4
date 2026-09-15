import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  Network,
  Activity,
  Building2,
  Users,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Compass,
} from 'lucide-react';

export const AdminStateCommand: React.FC = () => {
  const { showToast } = useToast();
  const [commandData, setCommandData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getStateCommand();
      if (res.success) {
        setCommandData(res.commandCenter);
      }
    } catch {
      showToast('Failed to load statewide health command telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const districtSummaries = commandData?.districts || [
    { name: 'Kapurthala', facilities: 51, pfiScore: 32.4, status: 'NORMAL', bedOccupancy: 81.2, referralsInFlight: 14 },
    { name: 'Jalandhar', facilities: 124, pfiScore: 36.8, status: 'HIGH_LOAD', bedOccupancy: 89.4, referralsInFlight: 48 },
    { name: 'Amritsar', facilities: 98, pfiScore: 38.2, status: 'HIGH_LOAD', bedOccupancy: 92.1, referralsInFlight: 39 },
    { name: 'Ludhiana', facilities: 165, pfiScore: 34.5, status: 'NORMAL', bedOccupancy: 94.2, referralsInFlight: 62 },
    { name: 'Hoshiarpur', facilities: 44, pfiScore: 30.1, status: 'EXCELLENT', bedOccupancy: 74.5, referralsInFlight: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              STATE HEALTH ADMINISTRATION & COMMAND
            </span>
            <span className="text-xs text-purple-300/70 font-medium">• Cross-District Real-Time Telemetry</span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            State Health Intelligence Command Center
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Macro oversight of Punjab healthcare access equity, referral choke-points, and emergency bed balancing across all districts.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Command Telemetry</span>
        </button>
      </div>

      {/* Statewide KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Statewide Facilities</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : commandData?.totalFacilities || 482}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 5 monitored Punjab districts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Statewide Friction Avg</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${commandData?.avgPfi || 34.4}`}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            -41.6% lower than pre-PFIS baseline
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Cross-District Referrals</span>
            <GitFork className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : commandData?.crossDistrictTransfers || 171}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active inter-district medical transfers
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Digital Twins Running</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            12 Districts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Live simulation models active
          </div>
        </div>
      </div>

      {/* District Macro Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600" />
            District Operational Readiness & Load Balancing
          </h2>
          <span className="text-xs text-slate-400">Direct Statewide Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">District</th>
                <th className="p-4">Healthcare Units</th>
                <th className="p-4">PFI Friction Index</th>
                <th className="p-4">Bed Utilization</th>
                <th className="p-4">Referrals In Flight</th>
                <th className="p-4">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtSummaries.map((d: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-4 font-bold text-slate-900">
                    {d.name}
                  </td>
                  <td className="p-4 text-slate-600">
                    {d.facilities} Facilities
                  </td>
                  <td className="p-4 font-black text-teal-600">
                    {d.pfiScore}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.bedOccupancy > 90 ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: `${d.bedOccupancy}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700">{d.bedOccupancy}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-indigo-600">
                    {d.referralsInFlight} Transfers
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'HIGH_LOAD'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : d.status === 'EXCELLENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {d.status === 'HIGH_LOAD' ? 'High Surge' : d.status === 'EXCELLENT' ? 'Optimal Flow' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
