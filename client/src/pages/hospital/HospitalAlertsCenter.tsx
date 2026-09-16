import React, { useState } from 'react';
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
  Building2,
  Bell,
  Check,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface HospitalAlert {
  id: string;
  title: string;
  department: string;
  severity: 'critical' | 'high' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  actionRequired: string;
}

export const HospitalAlertsCenter: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');

  const [alerts, setAlerts] = useState<HospitalAlert[]>([
    {
      id: 'ha-1',
      title: 'ICU Capacity Surge: Only 2 Vacant Beds Remaining',
      department: 'Intensive Care Unit (ICU)',
      severity: 'critical',
      message: 'ICU bed occupancy has reached 87.5%. Divert non-critical surgical admissions or arrange step-down to HDU.',
      timestamp: '12 mins ago',
      resolved: false,
      actionRequired: 'Divert Elective Admissions',
    },
    {
      id: 'ha-2',
      title: 'Pharmacy Buffer Warning: Injectable Oxytocin Low Stock',
      department: 'Labour & Delivery Pharmacy',
      severity: 'critical',
      message: 'Stock has fallen to 6 days buffer (120 ampoules). Automated requisition dispatched to District Medical Store Depot.',
      timestamp: '28 mins ago',
      resolved: false,
      actionRequired: 'Authorize Emergency PO',
    },
    {
      id: 'ha-3',
      title: 'OPD Queue Congestion Alert: General Medicine > 45m Wait Time',
      department: 'Outpatient Department',
      severity: 'high',
      message: 'Average patient wait time exceeded the 30-minute threshold. Recommended opening secondary consultation room.',
      timestamp: '41 mins ago',
      resolved: false,
      actionRequired: 'Deploy On-Call CMO',
    },
    {
      id: 'ha-4',
      title: 'Medical Oxygen PSA Plant Pressure Normal',
      department: 'Central Gas Plant',
      severity: 'info',
      message: 'Daily purity sensor check passed with 94.2% oxygen purity at 4.2 bar manifold pressure.',
      timestamp: '2 hours ago',
      resolved: true,
      actionRequired: 'Routine Log Confirmed',
    },
  ]);

  const markResolved = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'unresolved') return !a.resolved;
    if (filter === 'critical') return a.severity === 'critical';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Operational Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operational Alerts & Surge Center
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Automated telemetry alerts for department surges, bed bottlenecks, out-of-stock pharmacy buffers, and medical gas pipeline pressures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white/10 text-teal-200 border border-white/10">
              Active Unresolved: {alerts.filter((a) => !a.resolved).length} Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
        <button
          type="button"
          onClick={() => setFilter('unresolved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'unresolved' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unresolved Action Items
        </button>
        <button
          type="button"
          onClick={() => setFilter('critical')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Critical ({alerts.filter((a) => a.severity === 'critical').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              !alert.resolved
                ? alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
                : 'bg-white border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : alert.severity === 'high'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-extrabold text-sm text-slate-900">{alert.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {alert.department}
                  </span>
                  {!alert.resolved && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      ACTION REQUIRED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {alert.message}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.timestamp}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-teal-800">
                    Resolution Protocol: {alert.actionRequired}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
              {!alert.resolved && (
                <button
                  type="button"
                  onClick={() => markResolved(alert.id)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge & Resolve</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
