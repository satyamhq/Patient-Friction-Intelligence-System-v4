import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingDown,
  Users,
  Pill,
  Send,
  Sliders,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

interface DistrictAllocation {
  id: string;
  name: string;
  pfi: number;
  population: string;
  doctorsAllocated: number;
  ambulancesAllocated: number;
  budgetLakhs: number;
  recommendedBudgetLakhs: number;
  careLeakageRate: number;
}

const initialDistricts: DistrictAllocation[] = [
  {
    id: 'patna',
    name: 'Patna District',
    pfi: 78,
    population: '5.8M',
    doctorsAllocated: 240,
    ambulancesAllocated: 45,
    budgetLakhs: 850,
    recommendedBudgetLakhs: 1100,
    careLeakageRate: 28.4,
  },
  {
    id: 'gaya',
    name: 'Gaya District',
    pfi: 84,
    population: '4.4M',
    doctorsAllocated: 140,
    ambulancesAllocated: 28,
    budgetLakhs: 520,
    recommendedBudgetLakhs: 780,
    careLeakageRate: 36.2,
  },
  {
    id: 'muzaffarpur',
    name: 'Muzaffarpur District',
    pfi: 72,
    population: '4.8M',
    doctorsAllocated: 160,
    ambulancesAllocated: 32,
    budgetLakhs: 580,
    recommendedBudgetLakhs: 700,
    careLeakageRate: 24.1,
  },
  {
    id: 'purnia',
    name: 'Purnia District',
    pfi: 89,
    population: '3.3M',
    doctorsAllocated: 95,
    ambulancesAllocated: 18,
    budgetLakhs: 390,
    recommendedBudgetLakhs: 640,
    careLeakageRate: 42.8,
  },
  {
    id: 'bhagalpur',
    name: 'Bhagalpur District',
    pfi: 68,
    population: '3.0M',
    doctorsAllocated: 130,
    ambulancesAllocated: 26,
    budgetLakhs: 480,
    recommendedBudgetLakhs: 520,
    careLeakageRate: 19.5,
  },
];

export const AdminResourceAllocation: React.FC = () => {
  const [districts, setDistricts] = useState<DistrictAllocation[]>(initialDistricts);
  const [dispatched, setDispatched] = useState(false);

  const handleBudgetChange = (id: string, newBudget: number) => {
    setDistricts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, budgetLakhs: newBudget } : d))
    );
  };

  const handleApplyOptimization = () => {
    setDistricts((prev) =>
      prev.map((d) => ({
        ...d,
        budgetLakhs: d.recommendedBudgetLakhs,
        doctorsAllocated: Math.round(d.doctorsAllocated * (d.pfi > 75 ? 1.25 : 1.05)),
        ambulancesAllocated: Math.round(d.ambulancesAllocated * (d.pfi > 75 ? 1.3 : 1.1)),
      }))
    );
  };

  const totalCurrentBudget = districts.reduce((acc, d) => acc + d.budgetLakhs, 0);
  const totalDoctors = districts.reduce((acc, d) => acc + d.doctorsAllocated, 0);
  const avgPfi = Math.round(districts.reduce((acc, d) => acc + d.pfi, 0) / districts.length);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ministry Resource Optimization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">State Health Resource Allocation</h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Dynamically distribute doctors, frontline emergency vehicles, and public health capital funds based on real-time friction telemetry and care leakage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={handleApplyOptimization}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Auto-Balance by PFI</span>
            </Button>
            <Button
              onClick={() => {
                setDispatched(true);
                setTimeout(() => setDispatched(false), 3500);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Issue Allocation Directive</span>
            </Button>
          </div>
        </div>
      </div>

      {dispatched && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Allocation Directive Dispatched to District Treasuries & CMOs</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Official order signed with digital timestamp. Resource tracking monitors enabled on state dashboard.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Statewide Avg Friction</span>
            <span className="p-2 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgPfi}/100</span>
            <span className="text-xs text-red-600 font-medium flex items-center">
              High Burden
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Purnia & Gaya require immediate doctor rebalance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Deployed Specialists</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalDoctors}</span>
            <span className="text-xs text-emerald-600 font-medium">+42 on call</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cross-district clinical rotation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Allocated Budget</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{(totalCurrentBudget / 100).toFixed(2)} Cr</span>
            <span className="text-xs text-indigo-600 font-medium">92% Utilized</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Direct state treasury grant</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Est. Friction Reduction</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">-19.4%</span>
            <span className="text-xs text-slate-500">within 60 days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Projected through optimization model</p>
        </div>
      </div>

      {/* Allocation Table & Levers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">District-Level Allocation Levers</h2>
            <p className="text-xs text-slate-500">
              Adjust capital budgets and clinical quotas per district to suppress localized health friction
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            5 Priority Administrative Zones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">PFI Friction</th>
                <th className="py-3 px-4">Care Leakage</th>
                <th className="py-3 px-4">Clinical Staff</th>
                <th className="py-3 px-4">Ambulances</th>
                <th className="py-3 px-4">Budget (Lakhs ₹)</th>
                <th className="py-3 px-4 text-right">Adjustment Slider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {districts.map((district) => (
                <tr key={district.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {district.name}
                    <div className="text-xs text-slate-400 font-normal">Pop: {district.population}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        district.pfi >= 80
                          ? 'bg-red-100 text-red-800'
                          : district.pfi >= 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {district.pfi}/100
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700">
                    {district.careLeakageRate}%
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-900">{district.doctorsAllocated}</span>
                    <span className="text-xs text-slate-400 ml-1">doctors</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-900">{district.ambulancesAllocated}</span>
                    <span className="text-xs text-slate-400 ml-1">units</span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    ₹{district.budgetLakhs} L
                    {district.budgetLakhs < district.recommendedBudgetLakhs && (
                      <div className="text-xs text-amber-600 font-normal">
                        Rec: ₹{district.recommendedBudgetLakhs} L
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right min-w-[200px]">
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="20"
                      value={district.budgetLakhs}
                      onChange={(e) => handleBudgetChange(district.id, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
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
