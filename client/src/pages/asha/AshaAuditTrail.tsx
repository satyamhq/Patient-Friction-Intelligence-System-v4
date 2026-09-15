import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  History,
  RefreshCw,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  Calendar,
  Ticket,
  Clock,
  GitFork,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AshaAuditTrail: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getAuditTrail();
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch {
      showToast('Failed to load audit trail.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Immutable Integrity Log</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Field Operation Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographically sealed and immutable audit trail of all field doorstep visits, access barrier registrations, and referral workflows
          </p>
        </div>

        <button
          onClick={fetchAudit}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Audit Event Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading audit entries...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit events logged yet.</div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {events.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                      {e.resourceType}
                    </span>
                    <strong className="text-slate-900 font-sans">{e.action}</strong>
                    <span className="text-slate-400 text-[11px] font-sans">by {e.actorName} ({e.actorRole})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(e.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>

                {e.notes && (
                  <p className="text-[11px] text-slate-600 font-sans">
                    Log: "{e.notes}"
                  </p>
                )}

                <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>Resource ID: {e.resourceId}</span>
                  {e.newStatus && <span>• Transition: {e.previousStatus || 'INIT'} → {e.newStatus}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
