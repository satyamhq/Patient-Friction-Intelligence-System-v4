import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Building,
  User,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Truck,
  X,
} from 'lucide-react';

export const AshaEscalations: React.FC = () => {
  const { showToast } = useToast();
  const [escalations, setEscalations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'CLINICAL_CONCERN' | 'HIGH_ACCESS_PRIORITY'>('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [householdId, setHouseholdId] = useState('HH-PB-02');
  const [escType, setEscType] = useState<'CLINICAL_CONCERN' | 'HIGH_ACCESS_PRIORITY'>('HIGH_ACCESS_PRIORITY');
  const [urgency, setUrgency] = useState<'Medium' | 'High' | 'Emergency'>('High');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEscalations = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getEscalations();
      if (res.success) {
        setEscalations(res.escalations || []);
      }
    } catch {
      showToast('Failed to load escalations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !reason.trim()) {
      showToast('Patient name and specific reason are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createEscalation({
        patientName: patientName.trim(),
        householdId,
        villageName: 'Rampur Kalan',
        type: escType,
        urgency,
        reason: reason.trim(),
        reportedObservations: observations.trim(),
        routedToFacility: 'Phagwara Rural PHC',
      });

      if (res.success) {
        showToast(res.message || 'Escalation routed successfully.', 'success');
        setShowCreateModal(false);
        setPatientName('');
        setReason('');
        setObservations('');
        await fetchEscalations();
      }
    } catch {
      showToast('Failed to submit escalation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = escalations.filter((e) => {
    if (filterType === 'CLINICAL_CONCERN') return e.type === 'CLINICAL_CONCERN';
    if (filterType === 'HIGH_ACCESS_PRIORITY') return e.type === 'HIGH_ACCESS_PRIORITY';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Operational Escalation Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Field Escalations & Priority Care Coordination
          </h1>
          <p className="text-xs text-slate-500">
            Differentiated routing: Clinical concerns routed to physicians; Access barriers routed to Block Health administration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEscalations}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Escalation
          </button>
        </div>
      </div>

      {/* Concept Clarification Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-teal-900 text-sm">
            <Truck className="w-4 h-4 text-teal-600" />
            Category A: High Access Priority
          </div>
          <p className="text-slate-600">
            For non-clinical roadblocks: Road blockage, ambulance transit failure, extreme distance, lack of funds for diagnostic booking, missing identity documents. Routed to <strong>Block Health Officer</strong>.
          </p>
        </div>

        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
            <Stethoscope className="w-4 h-4 text-rose-600" />
            Category B: Clinical Concern
          </div>
          <p className="text-slate-600">
            Beneficiary reports concerning medical complaints (e.g. severe pedal edema, chest tightness, extreme glucose spike). ASHA logs observation; routed directly to <strong>Medical Officer & Doctor Desk</strong> for clinical intervention.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Escalations' },
          { id: 'HIGH_ACCESS_PRIORITY', label: 'High Access Priority (Administrative)' },
          { id: 'CLINICAL_CONCERN', label: 'Clinical Concerns (Doctor Review)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Escalations List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading escalations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No active escalations in this category.
          </div>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-amber-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">{e.patientName}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {e.householdId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      e.type === 'CLINICAL_CONCERN'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {e.type === 'CLINICAL_CONCERN' ? 'Clinical Concern' : 'High Access Priority'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      e.urgency === 'Emergency'
                        ? 'bg-red-500 text-white animate-pulse'
                        : e.urgency === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {e.urgency}
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 self-start sm:self-auto">
                  Status: {e.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p className="text-slate-800 font-semibold">
                  Reason: <span className="font-normal">{e.reason}</span>
                </p>
                {e.reportedObservations && (
                  <p className="text-slate-500">
                    Field Observations: <span className="italic">"{e.reportedObservations}"</span>
                  </p>
                )}
                {e.clinicalNotes && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium mt-1">
                    Doctor Review Note: {e.clinicalNotes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span>
                  Routed to: <strong>{e.routedToRole}</strong> ({e.routedToFacility || 'Phagwara Rural PHC'})
                </span>
                <span>Submitted: {new Date(e.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Submit Operational Escalation
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Devi"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Escalation Category</label>
                  <select
                    value={escType}
                    onChange={(e) => setEscType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="HIGH_ACCESS_PRIORITY">High Access Priority (Transport / Road / Cost)</option>
                    <option value="CLINICAL_CONCERN">Clinical Concern (Route to Doctor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High Urgency</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Reason for Escalation</label>
                <textarea
                  rows={2}
                  placeholder="State the primary obstacle (e.g. 108 ambulance unable to reach due to flooded canal road)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Observations (Permitted Non-Clinical Notes)</label>
                <textarea
                  rows={2}
                  placeholder="Observations reported during doorstep contact..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Routing...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
