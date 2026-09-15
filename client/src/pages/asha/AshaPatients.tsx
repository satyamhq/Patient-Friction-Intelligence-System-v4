import React, { useState, useEffect, useMemo } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Send,
  X,
  Phone,
  Calendar,
  Home,
  CheckCircle2,
  Clock,
  GitFork,
  ShieldAlert,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';

export const AshaPatients: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modal for Escalation / Assistance
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [escalationType, setEscalationType] = useState<'CLINICAL_CONCERN' | 'HIGH_ACCESS_PRIORITY'>('HIGH_ACCESS_PRIORITY');
  const [escalationUrgency, setEscalationUrgency] = useState<'Medium' | 'High' | 'Emergency'>('High');
  const [escalationReason, setEscalationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getPatients({
        search: searchQuery || undefined,
        filter: filterType !== 'ALL' ? filterType : undefined,
      });
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch {
      showToast('Failed to load village beneficiary registry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !escalationReason.trim()) {
      showToast('Please provide a specific reason for escalation.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createEscalation({
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.name,
        householdId: selectedPatient.householdId,
        villageName: selectedPatient.village,
        type: escalationType,
        urgency: escalationUrgency,
        reason: escalationReason,
      });

      if (res.success) {
        showToast(res.message || 'Escalation recorded and routed to authorized personnel.', 'success');
        setSelectedPatient(null);
        setEscalationReason('');
        await fetchPatients();
      }
    } catch {
      showToast('Failed to submit escalation. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.patientId?.toLowerCase().includes(q) ||
        p.householdId?.toLowerCase().includes(q) ||
        p.village?.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Authorized Field Scope: Rampur Kalan (Ward 4 & 5)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Village Patient Registry & Beneficiary Roster
          </h1>
          <p className="text-xs text-slate-500">
            Assigned community members, household links, appointment & referral status, and access barriers
          </p>
        </div>

        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, Household ID (e.g. HH-PB-02), or Village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>
          {[
            { id: 'ALL', label: 'All Beneficiaries' },
            { id: 'pending_followup', label: 'Pending Follow-up' },
            { id: 'access_barrier', label: 'Has Access Barrier' },
            { id: 'visited', label: 'Visited This Month' },
            { id: 'not_visited', label: 'Visit Due' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards / Table */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading village records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No assigned beneficiaries match the selected filter.
          </div>
        ) : (
          filtered.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">{patient.name}</strong>
                  <span className="text-xs text-slate-400">
                    ({patient.age} Yrs, {patient.gender})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                    <Home className="w-3 h-3" /> {patient.householdId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      patient.accessFrictionLevel === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : patient.accessFrictionLevel === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : patient.accessFrictionLevel === 'Moderate'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Access Friction: {patient.accessFrictionLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <strong className="text-slate-800">{patient.village}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Appointment / OPD</span>
                    <strong className="text-teal-700">{patient.appointmentStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Follow-up Status</span>
                    <strong className="text-slate-800">{patient.followUpStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Identified Access Barrier</span>
                    <strong className="text-amber-700">{patient.accessBarrier}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Next Scheduled Action: <strong>{patient.nextTask}</strong> • Contact: {patient.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setSelectedPatient(patient)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Escalate Case
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Escalation Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Escalate Case: {selectedPatient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPatient.householdId} • {selectedPatient.village}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Escalation Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEscalationType('HIGH_ACCESS_PRIORITY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      escalationType === 'HIGH_ACCESS_PRIORITY'
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">High Access Priority</span>
                    <span className="text-[10px] text-slate-500">Transport, road block, documentation barrier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscalationType('CLINICAL_CONCERN')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      escalationType === 'CLINICAL_CONCERN'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">Clinical Concern</span>
                    <span className="text-[10px] text-slate-500">Route to Doctor / PHC Medical Officer</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={escalationUrgency}
                  onChange={(e) => setEscalationUrgency(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Urgency</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Reason & Non-Clinical Observations
                </label>
                <textarea
                  rows={3}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="State non-clinical barriers (e.g. no transport available, patient unable to travel) or observations reported to clinician..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                {escalationType === 'CLINICAL_CONCERN'
                  ? 'Notice: ASHA workers record field observations. Clinical diagnosis and treatment decisions remain strictly reserved for the authorized physician.'
                  : 'Notice: High Access Priority will alert Block Health Officer for transport and administrative assistance.'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Routing...' : 'Submit Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
