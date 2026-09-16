import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface FacilityQualityScore {
  id: string;
  name: string;
  block: string;
  type: string;
  nqasScore: number;
  kayakalpScore: number;
  laqshyaCertified: boolean;
  musqanCertified: boolean;
  status: 'Accredited' | 'Conditional' | 'Under Inspection';
}

export const GovernmentAccreditation: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [facilities] = useState<FacilityQualityScore[]>([
    {
      id: 'fac-1',
      name: 'District Civil Hospital, North Campus',
      block: 'District HQ',
      type: 'District Hospital',
      nqasScore: 88.4,
      kayakalpScore: 92.0,
      laqshyaCertified: true,
      musqanCertified: true,
      status: 'Accredited',
    },
    {
      id: 'fac-2',
      name: 'Sub-Divisional Hospital, Rampur',
      block: 'Rampur Sub-Division',
      type: 'Sub-Divisional Hospital',
      nqasScore: 74.2,
      kayakalpScore: 81.5,
      laqshyaCertified: true,
      musqanCertified: false,
      status: 'Conditional',
    },
    {
      id: 'fac-3',
      name: 'Community Health Centre (CHC), Bishnupur',
      block: 'Bishnupur Rural',
      type: 'CHC',
      nqasScore: 68.0,
      kayakalpScore: 71.0,
      laqshyaCertified: false,
      musqanCertified: false,
      status: 'Under Inspection',
    },
    {
      id: 'fac-4',
      name: 'Ayushman Arogya Mandir (PHC), Sector 7',
      block: 'West Sector',
      type: 'Primary Health Centre',
      nqasScore: 82.5,
      kayakalpScore: 86.0,
      laqshyaCertified: false,
      musqanCertified: false,
      status: 'Accredited',
    },
  ]);

  const filtered = facilities.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.block.toLowerCase().includes(search.toLowerCase());
    if (filter === 'accredited') return matchesSearch && f.status === 'Accredited';
    if (filter === 'action_needed') return matchesSearch && f.status !== 'Accredited';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>National Quality Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Quality & NQAS Accreditation Registry
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              District-wide accreditation tracking under National Quality Assurance Standards (NQAS), Kayakalp clean hospital awards, LaQshya labor room certification, and MusQan pediatric metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-teal-200 border border-white/10">
              District NQAS Avg: 78.3%
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Facilities</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{facilities.length} Units</div>
          <span className="text-[11px] text-teal-700 font-semibold">Under surveillance</span>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">NQAS Certified</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {facilities.filter((f) => f.status === 'Accredited').length} Facilities
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">&gt; 70% Quality benchmark</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LaQshya Labour Rooms</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {facilities.filter((f) => f.laqshyaCertified).length} Certified
          </div>
          <span className="text-[11px] text-slate-500">Maternal delivery safety</span>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Improvement Plans</span>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {facilities.filter((f) => f.status !== 'Accredited').length} Units
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">Remediation active</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Hospitals
          </button>
          <button
            type="button"
            onClick={() => setFilter('accredited')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'accredited' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Accredited Only
          </button>
          <button
            type="button"
            onClick={() => setFilter('action_needed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'action_needed' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Remediation Required
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital or block..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
          />
        </div>
      </div>

      {/* Facilities Quality Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px]">
              <tr>
                <th className="py-3 px-4">Facility Name & Block</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">NQAS Score</th>
                <th className="py-3 px-4">Kayakalp Hygiene</th>
                <th className="py-3 px-4">Certifications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{fac.name}</div>
                    <div className="text-[11px] text-slate-500">{fac.block}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{fac.type}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                    {fac.nqasScore}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                    {fac.kayakalpScore}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {fac.laqshyaCertified && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-pink-100 text-pink-800">
                          LaQshya
                        </span>
                      )}
                      {fac.musqanCertified && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          MusQan
                        </span>
                      )}
                      {!fac.laqshyaCertified && !fac.musqanCertified && (
                        <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        fac.status === 'Accredited'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fac.status === 'Conditional'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs"
                    >
                      Audit Report
                    </button>
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
