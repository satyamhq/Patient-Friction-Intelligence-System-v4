import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { History, ShieldCheck, RefreshCw, Search, User, Filter, Activity, Lock, Stethoscope, Building2, ShieldAlert } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await adminService.getAuditLogs(100);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getRoleBadge = (roleStr: string) => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('doctor')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Stethoscope className="w-3 h-3" /> Doctor
        </span>
      );
    }
    if (r.includes('hospital')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Building2 className="w-3 h-3" /> Hospital
        </span>
      );
    }
    if (r.includes('asha')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
          <User className="w-3 h-3" /> ASHA Worker
        </span>
      );
    }
    if (r.includes('government') || r.includes('gov')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-100 text-teal-800 border border-teal-200">
          <ShieldCheck className="w-3 h-3" /> Govt Officer
        </span>
      );
    }
    if (r.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldAlert className="w-3 h-3" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-sky-800 border border-sky-200">
        <User className="w-3 h-3" /> Patient
      </span>
    );
  };

  const formatDetails = (detailsObj: any, userObj: any) => {
    if (!detailsObj && !userObj) return '-';
    const email = detailsObj?.email || userObj?.email || '';
    const extraKeys = Object.keys(detailsObj || {}).filter((k) => k !== 'email');

    return (
      <div className="space-y-0.5 text-[11px]">
        {email && <div className="font-semibold text-slate-900 truncate">{email}</div>}
        {extraKeys.length > 0 && (
          <div className="text-slate-500 font-mono text-[10px] truncate">
            {JSON.stringify(
              extraKeys.reduce((acc: any, k) => {
                acc[k] = detailsObj[k];
                return acc;
              }, {})
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const role = (log.actorRole || '').toLowerCase();
    if (selectedRole !== 'ALL' && !role.includes(selectedRole.toLowerCase())) {
      return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const action = (log.action || '').toLowerCase();
    const resource = (log.resource || '').toLowerCase();
    const email = (log.details?.email || log.user?.email || '').toLowerCase();
    const name = (log.user?.name || '').toLowerCase();

    return action.includes(term) || resource.includes(term) || email.includes(term) || name.includes(term) || role.includes(term);
  });

  if (isLoading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE LOGINS & COMPLIANCE STREAM
            </span>
            <span className="text-xs text-slate-400 font-medium">• DPDP & ABDM Compliant</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            Audit & Compliance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of logins, doctor OPD consultations, referrals, token bookings, and privilege grants.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Live Logs</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, email, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'PATIENT', 'DOCTOR', 'HOSPITAL', 'ASHA', 'GOVERNMENT', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === role
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor Role</th>
                <th className="p-4">Resource Target</th>
                <th className="p-4">Actor Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    No matching audit logs found in the ledger.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || log._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 font-mono text-[11px] px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">{getRoleBadge(log.actorRole)}</td>
                    <td className="p-4 font-semibold text-slate-800">{log.resource}</td>
                    <td className="p-4 max-w-sm truncate">{formatDetails(log.details, log.user)}</td>
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

