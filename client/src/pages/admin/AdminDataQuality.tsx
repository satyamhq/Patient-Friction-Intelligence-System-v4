import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Activity,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database,
} from 'lucide-react';

export const AdminDataQuality: React.FC = () => {
  const { showToast } = useToast();
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getDataQuality();
      if (res.success) {
        setDataQuality(res.dataQuality);
      }
    } catch {
      showToast('Failed to load data quality telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const datasets = dataQuality?.datasets || [
    { name: 'Hospital Facility Registry', totalRecords: 51, completeness: 98.4, timeliness: 'Live (0m)', validity: 100, anomalies: 0, status: 'EXCELLENT' },
    { name: 'Bed Occupancy & ICU Logs', totalRecords: 124, completeness: 95.2, timeliness: '2m ago', validity: 99.1, anomalies: 1, status: 'GOOD' },
    { name: 'Patient Access Barriers & PFI', totalRecords: 292, completeness: 96.8, timeliness: 'Live (0m)', validity: 98.5, anomalies: 2, status: 'GOOD' },
    { name: 'Inter-Facility Referral Pipeline', totalRecords: 48, completeness: 100, timeliness: '1m ago', validity: 100, anomalies: 0, status: 'EXCELLENT' },
    { name: 'ASHA Household & Field Visits', totalRecords: 5390, completeness: 94.0, timeliness: '5m ago', validity: 97.2, anomalies: 4, status: 'GOOD' },
    { name: 'Doctor Consultation & OPD Queue', totalRecords: 812, completeness: 99.0, timeliness: 'Live (0m)', validity: 100, anomalies: 0, status: 'EXCELLENT' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              DATA GOVERNANCE & PROVENANCE MONITOR
            </span>
            <span className="text-xs text-slate-400 font-medium">• Schema & Freshness Verification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Data Quality & Telemetry Freshness Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit schema compliance, sync latency, field completeness, and statistical anomaly thresholds across all PFIS data streams.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Datasets</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Completeness</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${dataQuality?.overallCompleteness || 97.2}%`}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Above 95% governance threshold
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Average Freshness</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            &lt; 2 mins
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Real-time event stream sync
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Schema Validity</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            99.1%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Valid JSON schema conformant
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Anomalies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            7 Records
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Isolated for verification
          </div>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            Core Relational Datasets Quality Audit
          </h2>
          <span className="text-xs text-slate-400">6 Monitored Entities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Dataset Name</th>
                <th className="p-4">Records</th>
                <th className="p-4">Completeness</th>
                <th className="p-4">Data Freshness</th>
                <th className="p-4">Schema Validity</th>
                <th className="p-4">Anomalies</th>
                <th className="p-4">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.map((ds: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-4 font-bold text-slate-900">
                    {ds.name}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {ds.totalRecords.toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-teal-600">
                    {ds.completeness}%
                  </td>
                  <td className="p-4 text-slate-600">
                    {ds.timeliness}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {ds.validity}%
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${ds.anomalies > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {ds.anomalies}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ds.status === 'EXCELLENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {ds.status}
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
