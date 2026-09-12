import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Users, Search, MapPin } from 'lucide-react';

export const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await adminService.getAllPatients();
        if (res.success) {
          setPatients(res.patients || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.userId?.name || '').toLowerCase().includes(q) ||
      (p.patientCode || '').toLowerCase().includes(q) ||
      (p.location?.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            Patient Accessibility Registry
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive ledger of monitored patients with real-time friction and risk indices
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          {patients.length} Registered Patients
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
        <input
          type="text"
          placeholder="Search patients by code, name, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Patient Code</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Demographics</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Accessibility Score</th>
                <th className="p-3.5">Friction Level</th>
                <th className="p-3.5">Top Barrier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((p) => {
                const fProf = p.activeFrictionProfileId;
                return (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{p.patientCode}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{p.userId?.name || 'Patient'}</td>
                    <td className="p-3.5 text-slate-500">
                      {p.age} yrs • {p.gender} • {p.preferredLanguage}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {p.location?.address}, {p.location?.city}
                    </td>
                    <td className="p-3.5 font-black text-brand-700">
                      {fProf?.overallAccessibilityScore ?? 75} / 100
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={fProf?.frictionLevel || 'LOW'} size="sm" />
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{fProf?.topBarrier || 'Transport'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
