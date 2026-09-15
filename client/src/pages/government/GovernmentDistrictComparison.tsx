import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  Scale,
  Activity,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const GovernmentDistrictComparison: React.FC = () => {
  const { showToast } = useToast();
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getDistrictComparison();
      if (res.success) {
        setDistricts(res.districts || []);
      }
    } catch {
      showToast('Failed to load district health benchmarking.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const defaultDistricts = districts.length > 0 ? districts : [
    { district: 'Kapurthala (Our District)', pfiScore: 32.4, referralCompletion: 88.4, bedUtilization: 81.2, avgWaitMin: 38, nqasScore: 84.5, rank: 2, isCurrent: true },
    { district: 'Jalandhar', pfiScore: 36.8, referralCompletion: 82.1, bedUtilization: 89.4, avgWaitMin: 54, nqasScore: 81.0, rank: 4, isCurrent: false },
    { district: 'Amritsar', pfiScore: 38.2, referralCompletion: 79.5, bedUtilization: 92.1, avgWaitMin: 62, nqasScore: 78.5, rank: 5, isCurrent: false },
    { district: 'Ludhiana', pfiScore: 34.5, referralCompletion: 85.0, bedUtilization: 94.2, avgWaitMin: 58, nqasScore: 83.2, rank: 3, isCurrent: false },
    { district: 'Hoshiarpur', pfiScore: 30.1, referralCompletion: 91.2, bedUtilization: 74.5, avgWaitMin: 32, nqasScore: 87.8, rank: 1, isCurrent: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              REGIONAL BENCHMARKING & KPI RANKINGS
            </span>
            <span className="text-xs text-slate-400 font-medium">• State Epidemiological Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            District Healthcare Performance Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative evaluation of Kapurthala district against neighboring Punjab health administrations across PFI friction, transit loss, and facility quality.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Benchmark</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700">State Ranking</span>
            <Award className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            #2 in Punjab
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Kapurthala ranks in the top tier for low patient friction and rapid secondary referral transit.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">PFI Friction Differential</span>
            <TrendingDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            -4.4 pts
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Better than the state average (36.8)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">NQAS Facility Quality</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            84.5%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            +3.5% higher than neighboring Jalandhar
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-600" />
            District Metric Performance Matrix
          </h2>
          <span className="text-xs text-slate-400">Standardized State Norms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">District</th>
                <th className="p-4">PFI Index (Lower is Better)</th>
                <th className="p-4">Referral Completion</th>
                <th className="p-4">Bed Utilization</th>
                <th className="p-4">Avg OPD Wait</th>
                <th className="p-4">NQAS Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defaultDistricts.map((d, idx) => (
                <tr
                  key={idx}
                  className={`transition-all ${
                    d.isCurrent
                      ? 'bg-teal-50/60 font-semibold'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="p-4 font-black text-slate-800">
                    #{d.rank}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{d.district}</span>
                      {d.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                          Current Authority
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-black text-teal-600">
                    {d.pfiScore}
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {d.referralCompletion}%
                  </td>
                  <td className="p-4 text-slate-700">
                    {d.bedUtilization}%
                  </td>
                  <td className="p-4 text-slate-700">
                    {d.avgWaitMin} mins
                  </td>
                  <td className="p-4 font-bold text-indigo-600">
                    {d.nqasScore}%
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
