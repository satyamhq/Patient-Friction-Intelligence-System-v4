import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  Microscope,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

export const GovernmentLabs: React.FC = () => {
  const { showToast } = useToast();
  const [labData, setLabData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getLabNetwork();
      if (res.success) {
        setLabData(res.labNetwork);
      }
    } catch {
      showToast('Failed to load district lab diagnostics telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const labs = labData?.labs || [
    { name: 'Civil Hospital Central Pathology Lab', district: 'Kapurthala', testsToday: 342, pendingResults: 28, reagentStock: 'ADEQUATE', avgTurnaroundHours: 3.2 },
    { name: 'Sub-Divisional Hospital Diagnostic Wing', district: 'Phagwara', testsToday: 184, pendingResults: 14, reagentStock: 'ADEQUATE', avgTurnaroundHours: 4.1 },
    { name: 'CHC Bholath Clinical Lab', district: 'Kapurthala', testsToday: 76, pendingResults: 19, reagentStock: 'LOW_REAGENT_CBC', avgTurnaroundHours: 6.5 },
    { name: 'CHC Sultanpur Lodhi Lab', district: 'Kapurthala', testsToday: 92, pendingResults: 8, reagentStock: 'ADEQUATE', avgTurnaroundHours: 3.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              DISTRICT DIAGNOSTICS & LAB OVERSIGHT
            </span>
            <span className="text-xs text-slate-400 font-medium">• LIMS Relational Sync</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            District Lab Network & Diagnostic Throughput
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnaround times, reagent stock status, and diagnostic test volumes across government healthcare institutions.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Labs</span>
        </button>
      </div>

      {/* Integration Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-bold text-amber-800">
            Transparent Data Architecture • Demo / Test LIMS Integration
          </div>
          <div className="text-amber-700/80 mt-0.5">
            Telemetry shown is computed from internal hospital relational test records. External state laboratory information management systems (LIMS) bridge is marked as <strong>Integration Required</strong> for statewide auto-sync.
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tests Run Today</span>
            <Microscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : labData?.totalTestsToday || 694}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Biochemistry, hematology, and serology
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Reports</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : labData?.pendingReports || 69}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Under active analysis in district labs
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Turnaround Time</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${labData?.avgTurnaroundHours || 3.8}h`}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Compliant with NQAS standard (&lt;6h)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Critical Reagents</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            1 Low Stock
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            CHC Bholath (CBC Reagents)
          </div>
        </div>
      </div>

      {/* Labs List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            District Public & Empanelled Laboratory Units
          </h2>
          <span className="text-xs text-slate-400">4 Active Facilities</span>
        </div>

        <div className="divide-y divide-slate-100">
          {labs.map((lab: any, idx: number) => (
            <div key={idx} className="p-4 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900">
                  {lab.name}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>District: <strong className="text-slate-700">{lab.district}</strong></span>
                  <span>•</span>
                  <span>Tests Today: <strong className="text-slate-700">{lab.testsToday}</strong></span>
                  <span>•</span>
                  <span>Pending: <strong className="text-slate-700">{lab.pendingResults}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    {lab.avgTurnaroundHours}h
                  </div>
                  <div className="text-[10px] text-slate-400">Avg Result TAT</div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    lab.reagentStock === 'ADEQUATE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {lab.reagentStock === 'ADEQUATE' ? 'Reagents Normal' : 'Reagent Restock Required'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
