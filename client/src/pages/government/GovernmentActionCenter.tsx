import React, { useState, useEffect } from 'react';
import { governmentService } from '../../services/governmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  Filter,
  ShieldCheck,
  Send,
  Check,
  X,
} from 'lucide-react';
import { CareRecoveryDashboard } from '../../components/common/CareRecoveryDashboard';

export const GovernmentActionCenter: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getActions();
      if (res.success) {
        setActions(res.actions || []);
      }
    } catch {
      showToast('Failed to load operational action tickets.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await governmentService.updateActionTicket(id, {
        status: newStatus,
        resolutionNotes: `Action ${newStatus.toLowerCase()} by ${user?.name || 'District Health Officer'}`,
      });
      if (res.success) {
        showToast(`Action ticket marked as ${newStatus}.`, 'success');
        setActions((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch {
      showToast('Failed to update action ticket.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = actions.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              OPERATIONAL ESCALATIONS & RESPONSE
            </span>
            <span className="text-xs text-slate-400 font-medium">• District Incident Response</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Alerts & District Action Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational bottlenecks, emergency bed surges, and resource shortages requiring prompt health authority intervention.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Actions</span>
        </button>
      </div>

      {/* Autonomous Care Recovery & Outbound AI Calling Desk (Phases 12 & 17) */}
      <CareRecoveryDashboard />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500">Filter By Severity:</span>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === sev
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sev === 'ALL' ? `All Tickets (${actions.length})` : sev}
          </button>
        ))}
      </div>

      {/* Action Tickets List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active operational action tickets found in this category.
          </div>
        ) : (
          filtered.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : ticket.severity === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {ticket.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {ticket.facilityName || 'District Facility'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900">
                  {ticket.title}
                </div>
                <p className="text-xs text-slate-600">
                  {ticket.description}
                </p>

                {ticket.recommendedAction && (
                  <div className="text-[11px] text-teal-700 bg-teal-50/50 p-2 rounded-lg border border-teal-200/50">
                    <strong>Recommended Action:</strong> {ticket.recommendedAction}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ticket.status === 'RESOLVED' ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpdate(ticket.id, 'IN_PROGRESS')}
                      disabled={updatingId === ticket.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleUpdate(ticket.id, 'RESOLVED')}
                      disabled={updatingId === ticket.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
