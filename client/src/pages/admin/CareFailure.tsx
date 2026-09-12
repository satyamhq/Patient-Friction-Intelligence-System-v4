import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CareFailureDonutChart } from '../../components/charts/CareFailureDonutChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BarChart3, AlertCircle, CheckCircle2, ShieldCheck, Bus, Clock, Stethoscope } from 'lucide-react';

export const CareFailure: React.FC = () => {
  const [attributionData, setAttributionData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttribution = async () => {
      try {
        const res = await adminService.getWhyCareFailed(1000);
        if (res.success) {
          setAttributionData(res.attribution);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttribution();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const barriers = attributionData?.barriers || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-500" />
                Why Did Care Fail? Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                Operational Barrier Attribution
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Operational classification of factors contributing to premature journey dropouts
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <strong className="text-slate-900 block font-bold text-sm">Key Systemic Finding:</strong>
          <p className="text-slate-600 leading-relaxed">{attributionData?.summary}</p>
        </div>
      </div>

      {/* Donut Chart Visual & Attribution Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CareFailureDonutChart data={barriers} height={320} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            Attribution Distribution Breakdown ({attributionData?.totalEvaluatedCases || 1000} Demonstration Cases)
          </h3>

          <div className="space-y-3">
            {barriers.map((b: any, i: number) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-extrabold text-[11px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{b.category}</h4>
                  </div>
                  <span className="text-sm font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {b.percentage}% ({b.caseCount} Patients)
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">{b.description}</p>

                <div className="p-2.5 bg-teal-50/70 rounded-xl text-teal-900 text-[11px] font-medium">
                  💡 <strong>Systemic Policy Action:</strong> {b.recommendedSystemicAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
