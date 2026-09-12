import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Activity,
  Bed,
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const FacilityQualityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [selectedFacilityId, setSelectedFacilityId] = useState('hosp-mh-rh-03');
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const FACILITIES = [
    { id: 'hosp-mh-sc-01', name: 'Arogya Vardhini Kendra (Sub-Centre) Medha' },
    { id: 'hosp-mh-phc-02', name: 'Primary Health Centre (PHC) Mahabaleshwar' },
    { id: 'hosp-mh-rh-03', name: 'Rural Hospital Wai (30-Bedded Community Health Centre)' },
    { id: 'hosp-mh-sdh-04', name: 'Sub-District Hospital Karad (100-Bedded FRU)' },
    { id: 'hosp-mh-dh-05', name: 'Chhatrapati Shivaji Maharaj District Civil Hospital Satara' },
  ];

  const fetchMetrics = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getFacilityMetrics(id);
      setMetrics(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load facility metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedFacilityId);
  }, [selectedFacilityId]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Healthcare Facility Operations • National Quality Assurance Standards (NQAS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Public Health Facility Operational Dashboard
            </h1>
            <p className="text-indigo-200/90 text-sm max-w-2xl leading-relaxed">
              Monitoring service availability, daily OPD footfall, real-time bed occupancy, diagnostic uptime, and essential medicine stock integrity across Maharashtra public health facilities.
            </p>
          </div>

          <div className="shrink-0">
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-indigo-500/40 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {FACILITIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading facility metrics...</div>
      ) : metrics ? (
        <div className="space-y-8">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-indigo-600" /> Bed Occupancy
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {metrics.bedOccupancyPercent}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  ({metrics.availableBeds} Available / {metrics.totalBeds} Total)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${metrics.bedOccupancyPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" /> Diagnostic Uptime
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {metrics.diagnosticUptimePercent}%
                </span>
                <span className="text-xs text-teal-600 font-semibold">Equipment Active</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${metrics.diagnosticUptimePercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" /> Essential Medicine Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {metrics.essentialMedicineStockPercent}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">EDL Available</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${metrics.essentialMedicineStockPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> NQAS Quality Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {metrics.nqasScore}/100
                </span>
                <span className="text-xs text-slate-500 font-medium">Accredited</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${metrics.nqasScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Operational Status & Quality Standards Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Departments & OPD Tokens */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>OPD Capacity & Daily Token Allocations</span>
                </h3>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Avg Wait: ~{metrics.averageWaitTimeMinutes}m
                </span>
              </div>

              <div className="space-y-3">
                {metrics.departments?.map((dept: any) => (
                  <div
                    key={dept.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-bold text-sm">
                        {dept.name}
                      </strong>
                      <span className="text-slate-500">{dept.department}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-600 font-bold block">
                        {dept.available_tokens} Tokens Open
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        of {dept.total_daily_tokens} Daily Capacity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Standards Compliance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>National Quality Assurance Standards (NQAS)</span>
                </h3>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  Audit Passed
                </span>
              </div>

              <div className="space-y-3">
                {metrics.qualityStandards?.map((std: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {std.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        {std.score}
                      </strong>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {std.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
