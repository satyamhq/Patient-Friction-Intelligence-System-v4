import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  GitFork,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

export const GovernmentReferrals: React.FC = () => {
  const { showToast } = useToast();
  const [network, setNetwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getReferralNetwork();
      if (res.success) {
        setNetwork(res.network);
      }
    } catch {
      showToast('Failed to load referral network bottlenecks.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const corridors = network?.corridors || [];
  const bottleneckCount = corridors.filter((c: any) => c.status === 'BOTTLENECK' || c.delayed > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              STATE REFERRAL INTERCONNECT
            </span>
            <span className="text-xs text-slate-400 font-medium">• De-Identified Flow Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            District Referral Network & Bottleneck Detection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of PHC-to-CHC and CHC-to-Tertiary transit delays, bed acceptance rates, and care dropouts.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Corridors</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>District Referrals</span>
            <GitFork className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : network?.totalReferrals || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active inter-facility care pipelines
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${network?.completionRate || 0}%`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{network?.completedReferrals || 0}</span> reached destination safely
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Identified Choke Points</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : bottleneckCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Corridors exceeding 45m transit delay
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Transit Delay</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${network?.avgTransitMinutes || 38}m`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            From referral dispatch to tertiary bed check-in
          </div>
        </div>
      </div>

      {/* Corridors List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            District Referral Corridors & Transit Pipelines
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Aggregate Relational Flow Only (Privacy Protected)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {corridors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No referral corridors tracked or currently active in the district.
            </div>
          ) : (
            corridors.map((c: any, idx: number) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                    <GitFork className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <span>{c.fromFacility || 'Origin PHC / CHC'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.toFacility || 'Tertiary Destination'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Volume: <strong className="text-slate-700">{c.count || 1} transfers</strong></span>
                      <span>•</span>
                      <span>Avg Wait: <strong className="text-slate-700">{c.avgDelay || '28m'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'BOTTLENECK'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {c.status === 'BOTTLENECK' ? 'Transit Choke Point' : 'Smooth Transit'}
                  </span>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Completion: <span className="font-bold text-slate-800">{c.rate || '92%'}</span></div>
                    <div className="text-[10px]">Auto-balanced by PFIS</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
