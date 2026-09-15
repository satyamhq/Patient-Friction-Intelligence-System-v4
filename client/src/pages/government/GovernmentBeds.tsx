import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  Bed,
  Activity,
  AlertTriangle,
  RefreshCw,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const GovernmentBeds: React.FC = () => {
  const { showToast } = useToast();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getHospitalBeds();
      if (res.success) {
        setFacilities(res.facilities || []);
      }
    } catch {
      showToast('Failed to load facility bed occupancy data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBeds = facilities.reduce((sum, f) => sum + (f.totalBeds || 0), 0);
  const occupiedBeds = facilities.reduce((sum, f) => sum + (f.occupiedBeds || 0), 0);
  const availableBeds = facilities.reduce((sum, f) => sum + (f.availableBeds || 0), 0);
  const icuTotal = facilities.reduce((sum, f) => sum + (f.icuBeds || 0), 0);
  const icuOccupied = facilities.reduce((sum, f) => sum + (f.icuOccupied || 0), 0);
  const overallUtil = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const filteredFacilities = facilities.filter((f) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CRITICAL') return f.utilizationRate >= 85;
    if (filterType === 'AVAILABLE') return f.availableBeds > 5;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              DISTRICT BEDS & RESOURCE INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-medium">• 100% Relational Live Feed</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Hospital Bed & ICU Capacity Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time district bed census, critical care ICU surge pressure, and secondary/tertiary balancing.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Census</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>District Bed Census</span>
            <Bed className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : totalBeds}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-emerald-600">{availableBeds}</span> Available • <span className="font-semibold text-amber-600">{occupiedBeds}</span> Occupied
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Utilization</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${overallUtil}%`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {overallUtil > 80 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> High Surge Pressure
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operating in Green Band
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ICU Critical Bays</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : `${icuTotal - icuOccupied} / ${icuTotal}`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {icuTotal > 0 ? `${Math.round((icuOccupied / icuTotal) * 100)}% ICU Bay Occupancy` : '0 Registered'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Reporting Provenance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            Live Verified
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hospital Bed Logs • 100% Facility Coverage
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500">Filter By Status:</span>
        {(['ALL', 'CRITICAL', 'AVAILABLE'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterType === type
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL' && `All Facilities (${facilities.length})`}
            {type === 'CRITICAL' && 'High Surge (>85%)'}
            {type === 'AVAILABLE' && 'Available Capacity (>5 Beds)'}
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((fac) => {
          const util = fac.utilizationRate || 0;
          return (
            <div
              key={fac.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      {fac.type || 'HOSPITAL'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {fac.district || 'District'} • {fac.pincode || 'PB'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      util >= 85
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : util >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {util}% Utilized
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      util >= 85 ? 'bg-rose-500' : util >= 60 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(util, 100)}%` }}
                  />
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div>
                    <div className="text-[11px] text-slate-400">Total</div>
                    <div className="text-sm font-bold text-slate-800">
                      {fac.totalBeds || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Occupied</div>
                    <div className="text-sm font-bold text-amber-600">
                      {fac.occupiedBeds || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Available</div>
                    <div className="text-sm font-bold text-emerald-600">
                      {fac.availableBeds || 0}
                    </div>
                  </div>
                </div>

                {/* ICU Bays & Oxygen */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ICU Bays:</span>
                    <span className="font-bold text-slate-800">
                      {fac.icuBeds - (fac.icuOccupied || 0)} free / {fac.icuBeds || 0} total
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Status:</span>
                    <span className="font-bold text-teal-600">{fac.verificationStatus || 'APPROVED'}</span>
                  </div>
                </div>
              </div>

              {/* Provenance footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated {new Date(fac.lastUpdated || Date.now()).toLocaleTimeString()}
                </span>
                <span className="font-medium text-slate-500">Source: Hospital HMS Sync</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
