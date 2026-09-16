import React, { useState } from 'react';
import {
  HeartPulse,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Baby,
  Plus,
  ShieldAlert,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { initiateHelplineCall, HELPLINE_PHONE_NUMBER } from '../../services/helplineCallingService';

interface MaternalRecord {
  id: string;
  motherName: string;
  age: number;
  rchId: string;
  lmp: string;
  edd: string;
  ancVisitsDone: number; // 0 to 4
  ttInjections: number; // 0, 1, 2
  ifaDistributed: number;
  highRiskFlags: string[];
  jsyEligible: boolean;
  villageSector: string;
}

export const AshaMaternalRegister: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high_risk' | 'due_anc'>('all');

  const [records] = useState<MaternalRecord[]>([
    {
      id: 'mat-1',
      motherName: 'Pooja Devi',
      age: 24,
      rchId: 'RCH-DL-9042',
      lmp: '2026-01-15',
      edd: '2026-10-22',
      ancVisitsDone: 3,
      ttInjections: 2,
      ifaDistributed: 180,
      highRiskFlags: ['Severe Anaemia (Hb 7.2 g/dL)', 'High Blood Pressure (148/96)'],
      jsyEligible: true,
      villageSector: 'Sector 4, North Tola',
    },
    {
      id: 'mat-2',
      motherName: 'Kavita Kumari',
      age: 21,
      rchId: 'RCH-DL-9043',
      lmp: '2026-03-02',
      edd: '2026-12-09',
      ancVisitsDone: 2,
      ttInjections: 1,
      ifaDistributed: 120,
      highRiskFlags: [],
      jsyEligible: true,
      villageSector: 'Sector 4, Main Basti',
    },
    {
      id: 'mat-3',
      motherName: 'Anita Devi',
      age: 29,
      rchId: 'RCH-DL-9044',
      lmp: '2026-06-10',
      edd: '2027-03-17',
      ancVisitsDone: 1,
      ttInjections: 1,
      ifaDistributed: 60,
      highRiskFlags: ['Previous C-Section'],
      jsyEligible: true,
      villageSector: 'Sector 4, Purani Basti',
    },
    {
      id: 'mat-4',
      motherName: 'Reena Kumari',
      age: 26,
      rchId: 'RCH-DL-9045',
      lmp: '2026-02-14',
      edd: '2026-11-21',
      ancVisitsDone: 3,
      ttInjections: 2,
      ifaDistributed: 180,
      highRiskFlags: [],
      jsyEligible: true,
      villageSector: 'Sector 4, School Tola',
    },
  ]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.villageSector.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'high_risk') return matchesSearch && r.highRiskFlags.length > 0;
    if (filter === 'due_anc') return matchesSearch && r.ancVisitsDone < 4;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
              <span>National Maternal Health Registry (RCH)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Maternal Health Register & ANC Tracker
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Track Antenatal Care (ANC 1-4) schedules, Tetanus toxoid vaccines, High-Risk Pregnancy (HRP) danger signs, and Janani Suraksha Yojana (JSY) institutional delivery incentives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => initiateHelplineCall()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title={`Call Healthcare Helpline (${HELPLINE_PHONE_NUMBER})`}
            >
              <Phone className="w-4 h-4" />
              <span>Emergency 102/Helpline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{records.length} Mothers</div>
          <span className="text-[11px] text-teal-700 font-semibold">Active RCH Records</span>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">High-Risk (HRP)</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {records.filter((r) => r.highRiskFlags.length > 0).length} Cases
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Urgent specialist care</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ANC 4 Completed</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {records.filter((r) => r.ancVisitsDone >= 4).length}
          </div>
          <span className="text-[11px] text-slate-500">Birth plan ready</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JSY Enrolled</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {records.filter((r) => r.jsyEligible).length}
          </div>
          <span className="text-[11px] text-slate-500">₹1,400 DBT Eligible</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Registered ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('high_risk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'high_risk' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            High-Risk Pregnancies ({records.filter((r) => r.highRiskFlags.length > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('due_anc')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'due_anc' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ANC Visits Due
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mother name, RCH ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
          />
        </div>
      </div>

      {/* Maternal Records List */}
      <div className="space-y-3">
        {filtered.map((record) => (
          <div
            key={record.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
              record.highRiskFlags.length > 0 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
            }`}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">{record.motherName}</h3>
                <span className="text-xs font-bold text-slate-500">({record.age} Yrs)</span>
                <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">
                  {record.rchId}
                </span>
                {record.highRiskFlags.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>HIGH RISK (HRP)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 font-medium">EDD: </span>
                  <span className="font-bold text-slate-900">{record.edd}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">LMP: </span>
                  <span className="font-medium text-slate-700">{record.lmp}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location: </span>
                  <span className="font-medium text-slate-700">{record.villageSector}</span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>ANC {record.ancVisitsDone}/4 Visits Done</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <span>TT Shots: {record.ttInjections}/2</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <span>IFA: {record.ifaDistributed} Tablets</span>
                </div>
              </div>

              {/* High Risk Flags Warning */}
              {record.highRiskFlags.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {record.highRiskFlags.map((flag, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Log ANC Checkup
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
