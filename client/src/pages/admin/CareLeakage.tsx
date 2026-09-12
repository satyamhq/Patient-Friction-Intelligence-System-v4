import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LeakageFunnelChart } from '../../components/charts/LeakageFunnelChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { GitFork, AlertTriangle, TrendingDown, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export const CareLeakage: React.FC = () => {
  const [leakageData, setLeakageData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeakage = async () => {
      try {
        const res = await adminService.getCareLeakage();
        if (res.success) {
          setLeakageData(res.careLeakage);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeakage();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const milestones = leakageData?.funnelMilestones || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <GitFork className="w-6 h-6 text-brand-500" />
                Care Leakage & Retention Funnel
              </h2>
              {leakageData?.totalLeakagePercentage !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                  Total Leakage: {leakageData.totalLeakagePercentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking patient attrition across 6 operational milestones to isolate where journeys collapse
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Observed Cohort: {leakageData?.cohortName || 'Loading...'}
          </span>
        </div>

        {/* Diagnostic Highlight Card */}
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-950 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-sm">Critical Drop-off Stage Identified:</strong>
            <p className="mt-0.5">
              <strong>{leakageData?.highestLeakageStage || 'Treatment Started -> Treatment Completed'}</strong>.
              Patients routinely begin pharmaceutical or therapy regimens, but abandon multi-week attendance due to
              loss of daily subsistence wages and travel fatigue.
            </p>
          </div>
        </div>
      </div>

      {/* 6-Milestone Visual Funnel Component */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Cohort Progression: 1,000 Referred Patients
          </h3>
          <span className="text-xs text-slate-500">Only 18% complete full 30-day regimen</span>
        </div>

        <LeakageFunnelChart
          milestones={milestones}
          highestLeakageStage={leakageData?.highestLeakageStage}
        />
      </div>
    </div>
  );
};
