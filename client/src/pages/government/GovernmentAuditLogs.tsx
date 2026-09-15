import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  History,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
  Activity,
  Search,
} from 'lucide-react';

export const GovernmentAuditLogs: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getAuditLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch {
      showToast('Failed to load governance audit logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = logs.filter((l) =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.actorName?.toLowerCase().includes(search.toLowerCase()) ||
    l.resource?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              IMMUTABLE GOVERNANCE AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-400 font-medium">• Cryptographic Audit Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            District Governance & Access Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident record of facility verifications, capacity approvals, intervention dispatches, and authority data accesses.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action, officer name, or resource affected..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Compliant Access Ledger</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor / Officer</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Resource Affected</th>
                <th className="p-4">Details / Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No governance audit entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        {log.actorName || log.userId || 'District Officer'}
                      </div>
                      <div className="text-[10px] text-slate-400">{log.role || 'GOVERNMENT'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {log.resource || 'DISTRICT_GOVERNANCE'}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {log.details ? JSON.stringify(log.details) : 'Audit verification record'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
