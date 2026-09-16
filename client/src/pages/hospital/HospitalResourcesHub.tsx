import React, { useState } from 'react';
import {
  Pill,
  Activity,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';

export const HospitalResourcesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beds' | 'pharmacy' | 'diagnostics'>('beds');

  // Beds state
  const bedStats = [
    { type: 'General Medicine Ward', total: 60, occupied: 48, available: 12, rate: '80%' },
    { type: 'Intensive Care Unit (ICU)', total: 16, occupied: 14, available: 2, rate: '87%', critical: true },
    { type: 'High Dependency Unit (HDU)', total: 12, occupied: 9, available: 3, rate: '75%' },
    { type: 'Maternity / Labour Ward', total: 24, occupied: 19, available: 5, rate: '79%' },
    { type: 'Pediatric Care Ward', total: 20, occupied: 11, available: 9, rate: '55%' },
    { type: 'Emergency Casualty Beds', total: 10, occupied: 8, available: 2, rate: '80%' },
  ];

  // Pharmacy Stock
  const medicineStock = [
    { name: 'Paracetamol 500mg (Generic)', batch: 'PCM-2026', stock: 4500, bufferDays: 32, status: 'Optimal' },
    { name: 'Amoxicillin + Clavulanate 625mg', batch: 'AMX-901', stock: 850, bufferDays: 14, status: 'Warning' },
    { name: 'Metformin 500mg SR', batch: 'MET-441', stock: 6200, bufferDays: 45, status: 'Optimal' },
    { name: 'Amlodipine 5mg', batch: 'AML-120', stock: 3800, bufferDays: 28, status: 'Optimal' },
    { name: 'Injectable Oxytocin 10 IU', batch: 'OXY-004', stock: 120, bufferDays: 6, status: 'Critical' },
    { name: 'ORS Packets (WHO Formula)', batch: 'ORS-552', stock: 5200, bufferDays: 60, status: 'Optimal' },
  ];

  // Diagnostic scanners
  const diagnosticScanners = [
    { equipment: '128-Slice CT Scanner', department: 'Radiology', status: 'Operational', queueToday: 18, nextSlot: '11:30 AM' },
    { equipment: 'Digital X-Ray Unit 1', department: 'Radiology', status: 'Operational', queueToday: 42, nextSlot: 'Immediate' },
    { equipment: 'Color Doppler Ultrasound', department: 'OB/GYN & Radiology', status: 'Operational', queueToday: 26, nextSlot: '12:00 PM' },
    { equipment: 'Automated Biochemistry Analyzer', department: 'Central Pathology', status: 'Operational', queueToday: 115, nextSlot: 'Continuous' },
    { equipment: 'Electrolyte & Blood Gas (ABG)', department: 'Casualty Lab', status: 'Calibrating', queueToday: 9, nextSlot: '11:15 AM' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Resource Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Resources & Logistics Hub
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Real-time monitoring of ICU/ward bed occupancy, essential pharmacy stock levels, and diagnostic scanner utilization across the facility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Hospital Systems Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('beds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'beds'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bed & ICU Occupancy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pharmacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pharmacy'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Essential Pharmacy Stocks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Diagnostic Machinery & Labs
        </button>
      </div>

      {/* 1. Bed Occupancy Matrix */}
      {activeTab === 'beds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bedStats.map((bed, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-900">{bed.type}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      bed.critical ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {bed.rate} Occupied
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 my-3 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${bed.critical ? 'bg-rose-600' : 'bg-teal-600'}`}
                    style={{ width: bed.rate }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">TOTAL</span>
                    <span className="font-black text-slate-900 text-sm">{bed.total}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">OCCUPIED</span>
                    <span className="font-black text-slate-700 text-sm">{bed.occupied}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-bold">VACANT</span>
                    <span className="font-black text-emerald-700 text-sm">{bed.available}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Auto-synced to District</span>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                >
                  Manage Beds
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Pharmacy Stocks */}
      {activeTab === 'pharmacy' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Batch Code</th>
                  <th className="py-3 px-4">Units in Stock</th>
                  <th className="py-3 px-4">Buffer Days</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicineStock.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{med.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{med.batch}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {med.stock.toLocaleString()} units
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {med.bufferDays} days reserve
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          med.status === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : med.status === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {med.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs"
                      >
                        Indent Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Diagnostic Scanners */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diagnosticScanners.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.status === 'Operational'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.department}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mt-1 mb-2">
                  {item.equipment}
                </h3>

                <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Scans Today:</span>
                    <span className="font-bold text-slate-900">{item.queueToday} patients</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Next Slot:</span>
                    <span className="font-bold text-teal-700">{item.nextSlot}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                >
                  View Schedule & Token Queue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
